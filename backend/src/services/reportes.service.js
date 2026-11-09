const { prisma } = require('../config/database');
const { redondear } = require('../utils/decimal');
const materiales = require('./materiales.service');
const alertas = require('./alertas.service');
const aprobaciones = require('./aprobaciones.service');
const duplicados = require('./duplicados.service');
const { stockDerivado } = require('./stock.service');

const dinero = (n) => redondear(n, 2);
const ESTADOS_EXCLUIDOS = ['RECHAZADA', 'ANULADA'];

async function inventario() {
  const [lista, filas, bodegas] = await Promise.all([
    materiales.listar(),
    stockDerivado(prisma),
    prisma.bodegas.findMany({ include: { obra: true } }),
  ]);
  const porUbicacion = filas.map((f) => {
    const m = lista.find((x) => x.id === f.material_id);
    const b = bodegas.find((x) => x.id === f.bodega_id);
    return { materialId: m.id, codigo: m.codigo, material: m.nombre, unidad: m.unidad, bodegaId: b.id, bodega: b.nombre, obra: b.obra?.nombre ?? null, cantidad: redondear(f.cantidad) };
  });
  return { materiales: lista, porUbicacion };
}

/** A2: cuánto se habría ahorrado comprando cada insumo equivalente al menor precio observado. */
async function consolidacion() {
  const lineas = await prisma.lineas_erp.findMany({ include: { material: true, area: true, proveedor: true }, orderBy: { numero: 'asc' } });
  const grupos = new Map();
  for (const l of lineas) grupos.set(l.material_id, [...(grupos.get(l.material_id) ?? []), l]);

  const insumos = [...grupos.values()]
    .filter((g) => g.length > 1)
    .map((g) => {
      const cantidad = g.reduce((s, l) => s + Number(l.cantidad), 0);
      const costoOriginal = dinero(g.reduce((s, l) => s + Number(l.cantidad) * Number(l.precio_unitario), 0));
      const precioMinimo = Math.min(...g.map((l) => Number(l.precio_unitario)));
      const costoConsolidado = dinero(cantidad * precioMinimo);
      const ahorro = dinero(costoOriginal - costoConsolidado);
      return {
        materialId: g[0].material_id,
        codigo: g[0].material.codigo,
        material: g[0].material.nombre,
        lineas: g.map((l) => ({ numero: l.numero, descripcion: l.descripcion_erp, area: l.area.nombre, proveedor: l.proveedor.nombre, cantidad: l.cantidad, precio: l.precio_unitario, estado: l.estado_equivalencia, justificacion: l.justificacion })),
        cantidad,
        precioMinimo,
        costoOriginal,
        costoConsolidado,
        ahorro,
        porcentaje: redondear((ahorro / costoOriginal) * 100, 2),
        requiereValidacion: g.some((l) => l.estado_equivalencia === 'EQUIVALENTE_POR_VALIDAR'),
      };
    });

  const sumar = (lista) => dinero(lista.reduce((s, i) => s + i.ahorro, 0));
  const costo = insumos.reduce((s, i) => s + i.costoOriginal, 0);
  return {
    insumos,
    lineasSinEquivalente: lineas.filter((l) => l.estado_equivalencia === 'SIN_EQUIVALENTE').map((l) => ({ numero: l.numero, descripcion: l.descripcion_erp, justificacion: l.justificacion })),
    ahorroTotal: sumar(insumos),
    porcentajeTotal: costo ? redondear((sumar(insumos) / costo) * 100, 2) : 0,
    ahorroSoloValidados: sumar(insumos.filter((i) => !i.requiereValidacion)),
  };
}

function clasificarLinea(linea, orden, contratos) {
  const vigentes = contratos.filter((c) => c.material_id === linea.material_id && c.vigente_desde <= orden.fecha_emision && (!c.vigente_hasta || c.vigente_hasta >= orden.fecha_emision));
  if (!vigentes.length) return { clasificacion: 'SIN_CONTRATO', precioContrato: null };
  const delProveedor = vigentes.find((c) => c.proveedor_id === orden.proveedor_id);
  const referencia = delProveedor ?? vigentes[0];
  const precioContrato = Number(referencia.precio);
  if (!delProveedor) return { clasificacion: 'FUERA_CONTRATO_PROVEEDOR', precioContrato };
  return { clasificacion: Number(linea.precio_unitario) === precioContrato ? 'CONFORME' : 'FUERA_CONTRATO_PRECIO', precioContrato };
}

/** A3: sobreprecio confirmado por los datos y el impacto adicional si las sospechas resultan ser duplicados. */
async function fugaValor({ mes }) {
  const [anio, m] = mes.split('-').map(Number);
  const desde = new Date(Date.UTC(anio, m - 1, 1));
  const hasta = new Date(Date.UTC(anio, m, 1));

  await duplicados.escanear(prisma);
  const [ordenes, contratos, sospechas] = await Promise.all([
    prisma.ordenes_compra.findMany({
      where: { fecha_emision: { gte: desde, lt: hasta }, estado: { notIn: ESTADOS_EXCLUIDOS } },
      include: { proveedor: true, area: true, detalle: { include: { material: true } } },
      orderBy: { id: 'asc' },
    }),
    prisma.contratos_precio.findMany(),
    prisma.sospechas_duplicado.findMany({ where: { estado: { not: 'DESCARTADA' } } }),
  ]);

  const lineas = ordenes.flatMap((o) =>
    o.detalle.map((d) => {
      const { clasificacion, precioContrato } = clasificarLinea(d, o, contratos);
      const sobreprecioUnitario = precioContrato === null ? 0 : dinero(Number(d.precio_unitario) - precioContrato);
      return {
        ordenId: o.id, numero: o.numero, fecha: o.fecha_emision, area: o.area.nombre, proveedor: o.proveedor.nombre, material: d.material.nombre,
        cantidad: Number(d.cantidad), precio: Number(d.precio_unitario), total: dinero(Number(d.cantidad) * Number(d.precio_unitario)),
        precioContrato, clasificacion, sobreprecioUnitario, sobreprecioTotal: dinero(sobreprecioUnitario * Number(d.cantidad)),
      };
    }),
  );

  const gasto = dinero(lineas.reduce((s, l) => s + l.total, 0));
  const sobreprecio = dinero(lineas.reduce((s, l) => s + l.sobreprecioTotal, 0));
  const fuera = dinero(lineas.filter((l) => l.clasificacion.startsWith('FUERA')).reduce((s, l) => s + l.total, 0));

  // Si la orden B es duplicada, se pierde su valor completo y deja de contar su sobreprecio (no se suma dos veces).
  const escenario = (nombre, lista) => {
    const ids = new Set(lista.map((s) => s.orden_b_id));
    const dup = lineas.filter((l) => ids.has(l.ordenId));
    const mensual = dinero(sobreprecio - dup.reduce((s, l) => s + l.sobreprecioTotal, 0) + dup.reduce((s, l) => s + l.total, 0));
    return { nombre, ordenesSospechosas: dup.map((l) => l.numero), mensual, anual: dinero(mensual * 12) };
  };

  return {
    mes,
    gasto,
    gastoFueraContrato: fuera,
    porcentajeFueraContrato: gasto ? redondear((fuera / gasto) * 100, 1) : 0,
    lineas,
    escenarios: [
      { nombre: 'Solo sobreprecio', ordenesSospechosas: [], mensual: sobreprecio, anual: dinero(sobreprecio * 12) },
      escenario('Si las sospechas de confianza alta son duplicados', sospechas.filter((s) => s.confianza === 'ALTA')),
      escenario('Si todas las sospechas son duplicados', sospechas),
    ],
    nota: 'La proyección anual multiplica un solo mes por 12. Una sospecha no es una duplicación confirmada.',
  };
}

/** Compara el saldo guardado en inventario contra el calculado desde movimientos. Debe dar cero diferencias. */
async function conciliacion() {
  const [saldos, derivado] = await Promise.all([prisma.inventario.findMany(), stockDerivado(prisma)]);
  const diferencias = [];
  const claves = new Set([...saldos.map((s) => `${s.material_id}:${s.bodega_id}`), ...derivado.map((d) => `${d.material_id}:${d.bodega_id}`)]);
  for (const clave of claves) {
    const [materialId, bodegaId] = clave.split(':').map(Number);
    const guardado = Number(saldos.find((s) => s.material_id === materialId && s.bodega_id === bodegaId)?.cantidad ?? 0);
    const calculado = redondear(derivado.find((d) => d.material_id === materialId && d.bodega_id === bodegaId)?.cantidad ?? 0);
    if (guardado !== calculado) diferencias.push({ materialId, bodegaId, guardado, calculado });
  }
  return { filasRevisadas: claves.size, consistente: diferencias.length === 0, diferencias };
}

async function dashboard(usuario) {
  const [totalMateriales, totalObras, totalBodegas, reorden, lista, recientes, pendientes, sospechas, gastoPorProveedor] = await Promise.all([
    prisma.materiales.count({ where: { activo: true } }),
    prisma.obras.count({ where: { activa: true } }),
    prisma.bodegas.count({ where: { activa: true } }),
    alertas.reorden(),
    materiales.listar(),
    prisma.movimientos.findMany({
      include: { material: { select: { nombre: true, unidad: true } }, usuario: { select: { nombre: true } }, origen: { select: { nombre: true } }, destino: { select: { nombre: true } } },
      orderBy: [{ fecha_movimiento: 'desc' }, { id: 'desc' }],
      take: 8,
    }),
    aprobaciones.pendientes(usuario),
    duplicados.listar({ estado: 'PENDIENTE' }),
    prisma.$queryRaw`
      SELECT p.nombre AS proveedor, SUM(o.total) AS total
      FROM ordenes_compra o JOIN proveedores p ON p.id = o.proveedor_id
      WHERE o.estado NOT IN ('RECHAZADA', 'ANULADA')
      GROUP BY p.nombre ORDER BY total DESC`,
  ]);

  return {
    indicadores: {
      materiales: totalMateriales,
      obras: totalObras,
      bodegas: totalBodegas,
      alertasActivas: reorden.length,
      bajoPuntoReorden: lista.filter((m) => m.estado === 'REPONER').length,
      aprobacionesPendientes: pendientes.length,
      posiblesDuplicados: sospechas.length,
    },
    alertas: reorden.slice(0, 5),
    movimientosRecientes: recientes,
    aprobacionesPendientes: pendientes.slice(0, 5),
    posiblesDuplicados: sospechas.slice(0, 5),
    stockVsReorden: lista.filter((m) => m.punto_reorden !== null).map((m) => ({
      material: m.nombre, unidad: m.unidad, stock: m.stock_actual, puntoReorden: m.punto_reorden,
      porcentaje: redondear((m.stock_actual / m.punto_reorden) * 100, 1),
    })),
    gastoPorProveedor: gastoPorProveedor.map((f) => ({ proveedor: f.proveedor, total: Number(f.total) })),
  };
}

module.exports = { inventario, consolidacion, fugaValor, conciliacion, dashboard };
