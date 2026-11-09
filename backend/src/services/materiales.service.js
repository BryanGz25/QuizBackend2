const { prisma } = require('../config/database');
const { noEncontrado } = require('../utils/errorHttp');
const { redondear } = require('../utils/decimal');
const { auditar } = require('./auditoria.service');
const { nivelesDeMaterial, requiereReposicion } = require('./reorden.service');
const { stockDerivado, stockTotalPorMaterial } = require('./stock.service');

const campos = (d) => ({
  codigo: d.codigo,
  nombre: d.nombre,
  unidad: d.unidad,
  categoria_id: d.categoriaId,
  stock_minimo: d.stockMinimo,
  stock_maximo: d.stockMaximo,
  demanda_promedio_dia: d.demandaPromedioDia,
  demanda_maxima_dia: d.demandaMaximaDia,
  tiempo_entrega_dias: d.tiempoEntregaDias,
  activo: d.activo,
});

function conEstado(material, stock) {
  const niveles = nivelesDeMaterial(material);
  const base = {
    ...material,
    stock_actual: stock,
    stock_seguridad: niveles?.stockSeguridad ?? null,
    punto_reorden: niveles?.puntoReorden ?? null,
    diferencia: niveles ? redondear(stock - niveles.puntoReorden) : null,
  };
  if (!niveles) return { ...base, estado: 'SIN_PARAMETROS' };
  return { ...base, estado: requiereReposicion(stock, niveles.puntoReorden) ? 'REPONER' : 'OK' };
}

async function listar({ buscar } = {}) {
  const [materiales, totales] = await Promise.all([
    prisma.materiales.findMany({
      where: buscar ? { OR: [{ nombre: { contains: buscar } }, { codigo: { contains: buscar } }] } : undefined,
      include: { categoria: { include: { padre: true } } },
      orderBy: { codigo: 'asc' },
    }),
    stockTotalPorMaterial(prisma),
  ]);
  return materiales.map((m) => conEstado(m, redondear(totales.get(m.id) || 0)));
}

async function obtener(id) {
  const m = await prisma.materiales.findUnique({ where: { id }, include: { categoria: { include: { padre: true } }, lineas_erp: { include: { area: true, proveedor: true } } } });
  if (!m) throw noEncontrado('El material');
  return m;
}

function crear(usuario, datos) {
  return prisma.$transaction(async (tx) => {
    const m = await tx.materiales.create({ data: campos(datos) });
    await auditar(tx, { usuarioId: usuario.id, accion: 'CREAR', entidad: 'materiales', entidadId: m.id, despues: m });
    return m;
  });
}

function actualizar(usuario, id, datos) {
  return prisma.$transaction(async (tx) => {
    const antes = await tx.materiales.findUnique({ where: { id } });
    if (!antes) throw noEncontrado('El material');
    const m = await tx.materiales.update({ where: { id }, data: campos(datos) });
    await auditar(tx, { usuarioId: usuario.id, accion: 'ACTUALIZAR', entidad: 'materiales', entidadId: id, antes, despues: m });
    return m;
  });
}

async function stock(id) {
  const material = await obtener(id);
  const filas = await stockDerivado(prisma, id);
  const bodegas = await prisma.bodegas.findMany({ where: { id: { in: filas.map((f) => f.bodega_id) } }, include: { obra: true } });
  const total = redondear(filas.reduce((s, f) => s + f.cantidad, 0));
  const r = conEstado(material, total);
  return {
    material: { id: material.id, codigo: material.codigo, nombre: material.nombre, unidad: material.unidad },
    stockActual: total,
    stockSeguridad: r.stock_seguridad,
    puntoReorden: r.punto_reorden,
    diferencia: r.diferencia,
    estado: r.estado,
    porBodega: filas.map((f) => {
      const b = bodegas.find((x) => x.id === f.bodega_id);
      return { bodegaId: f.bodega_id, bodega: b.nombre, obra: b.obra?.nombre ?? null, cantidad: redondear(f.cantidad) };
    }),
  };
}

/**
 * Trazabilidad DOCUMENTAL: cada entrada se vincula a su OC, proveedor y recepción.
 * No sigue lotes físicos: una salida no identifica de cuál entrada salió cada unidad.
 */
async function trazabilidad(id) {
  const material = await obtener(id);
  const movimientos = await prisma.movimientos.findMany({
    where: { material_id: id },
    include: {
      usuario: { select: { nombre: true } },
      origen: { include: { obra: true } },
      destino: { include: { obra: true } },
      orden: { include: { proveedor: true } },
      detalle_recepcion: { include: { recepcion: true } },
    },
    orderBy: [{ fecha_movimiento: 'asc' }, { id: 'asc' }],
  });

  let saldo = 0;
  const historial = movimientos.map((m) => {
    if (m.tipo !== 'TRASLADO') saldo += (m.bodega_destino_id ? 1 : -1) * Number(m.cantidad);
    return {
      id: m.id,
      tipo: m.tipo,
      fecha: m.fecha_movimiento,
      cantidad: m.cantidad,
      origen: m.origen?.nombre ?? null,
      destino: m.destino?.nombre ?? null,
      obra: m.destino?.obra?.nombre ?? m.origen?.obra?.nombre ?? null,
      usuario: m.usuario.nombre,
      documentoTipo: m.documento_tipo,
      documentoNumero: m.documento_numero,
      ordenCompra: m.orden?.numero ?? null,
      proveedor: m.orden?.proveedor.nombre ?? null,
      recepcion: m.detalle_recepcion?.recepcion.numero ?? null,
      observaciones: m.observaciones,
      saldoConsolidado: redondear(saldo),
    };
  });

  return {
    material: { id: material.id, codigo: material.codigo, nombre: material.nombre, unidad: material.unidad },
    tipoTrazabilidad: 'DOCUMENTAL',
    nota: 'Vincula cada entrada con su documento de origen. No identifica lotes físicos.',
    entradas: historial.filter((h) => h.tipo === 'ENTRADA'),
    movimientosPosteriores: historial.filter((h) => h.tipo !== 'ENTRADA'),
    historial,
    saldoActual: redondear(saldo),
  };
}

module.exports = { listar, obtener, crear, actualizar, stock, trazabilidad };
