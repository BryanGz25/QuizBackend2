const { randomUUID } = require('crypto');
const { prisma } = require('../config/database');
const { ErrorHttp, noEncontrado } = require('../utils/errorHttp');
const { redondear } = require('../utils/decimal');
const { auditar } = require('./auditoria.service');
const aprobaciones = require('./aprobaciones.service');
const fraccionamiento = require('./fraccionamiento.service');
const duplicados = require('./duplicados.service');

const inclusion = {
  proveedor: { select: { nombre: true } },
  area: { select: { nombre: true } },
  requisicion: { select: { numero: true } },
  creado_por: { select: { nombre: true } },
  detalle: { include: { material: { select: { codigo: true, nombre: true, unidad: true } }, recepciones: { select: { cantidad_recibida: true } } } },
  aprobaciones: { include: { rol: { select: { nombre: true } }, usuario: { select: { nombre: true } } }, orderBy: { paso: 'asc' } },
};

/** Una OC que nace de una requisición aprobada, sin superar su monto, hereda esa aprobación. */
async function datosDeRequisicion(tx, requisicionId, total) {
  const r = await tx.requisiciones.findUnique({ where: { id: requisicionId } });
  if (!r) throw noEncontrado('La requisición');
  if (r.estado !== 'APROBADA') throw new ErrorHttp(409, 'REQUISICION_NO_APROBADA', `La requisición está en estado ${r.estado}.`);
  await tx.requisiciones.update({ where: { id: r.id }, data: { estado: 'CONVERTIDA' } });
  return { requisicion: r, heredaAprobacion: total <= Number(r.monto_total) };
}

async function crear(usuario, d) {
  const ids = d.lineas.map((l) => l.materialId);
  if (new Set(ids).size !== ids.length) throw new ErrorHttp(400, 'MATERIAL_REPETIDO', 'Un material solo puede aparecer una vez por orden.');
  const total = redondear(d.lineas.reduce((s, l) => s + l.cantidad * l.precioUnitario, 0), 2);

  const id = await prisma.$transaction(async (tx) => {
    const origen = d.requisicionId ? await datosDeRequisicion(tx, d.requisicionId, total) : null;
    const areaId = origen?.requisicion.area_id ?? d.areaId;
    if (!areaId) throw new ErrorHttp(400, 'AREA_REQUERIDA', 'Indique el área solicitante.');

    const lineas = d.lineas.map((l) => ({ materialId: l.materialId, cantidad: l.cantidad, precio: l.precioUnitario }));
    const existentes = await tx.materiales.count({ where: { id: { in: ids }, activo: true } });
    if (existentes !== ids.length) throw new ErrorHttp(422, 'MATERIAL_INVALIDO', 'Algún material no existe o está inactivo.');

    const hereda = origen?.heredaAprobacion ?? false;
    const f = hereda ? { sospechoso: false, montoEvaluado: total, detalle: null } : await fraccionamiento.evaluar(tx, { areaId, proveedorId: d.proveedorId, lineas, montoTotal: total });
    const tramo = await aprobaciones.tramoPorMonto(tx, f.montoEvaluado);

    const temporal = await tx.ordenes_compra.create({
      data: {
        numero: `TMP-${randomUUID()}`,
        requisicion_id: d.requisicionId ?? null,
        proveedor_id: d.proveedorId,
        area_id: areaId,
        fecha_emision: d.fechaEmision ? new Date(d.fechaEmision) : new Date(),
        estado: hereda ? 'EMITIDA' : 'PENDIENTE_APROBACION',
        cotizaciones: d.cotizaciones ?? origen?.requisicion.cotizaciones ?? 0,
        cotizaciones_requeridas: tramo.cotizaciones_requeridas,
        total,
        monto_evaluado: f.montoEvaluado,
        fraccionamiento_sospechoso: f.sospechoso,
        fraccionamiento_detalle: f.detalle ?? undefined,
        creado_por_id: usuario.id,
        detalle: { create: d.lineas.map((l) => ({ material_id: l.materialId, cantidad: l.cantidad, precio_unitario: l.precioUnitario })) },
      },
    });
    const orden = await tx.ordenes_compra.update({ where: { id: temporal.id }, data: { numero: `OC-${temporal.id}` } });
    if (!hereda) await aprobaciones.crearPasos(tx, { orden_compra_id: orden.id }, tramo, usuario.rol);
    await auditar(tx, { usuarioId: usuario.id, accion: 'CREAR', entidad: 'ordenes_compra', entidadId: orden.id, despues: orden });
    return orden.id;
  });

  // La sospecha de duplicado avisa, pero nunca bloquea una orden legítima.
  const sospechas = (await duplicados.escanear(prisma)).filter((s) => s.orden_a_id === id || s.orden_b_id === id);
  return { orden: await obtener(id), sospechasDuplicado: sospechas };
}

async function obtener(id) {
  const o = await prisma.ordenes_compra.findUnique({ where: { id }, include: inclusion });
  if (!o) throw noEncontrado('La orden de compra');
  return o;
}

const listar = ({ estado, limite }) => prisma.ordenes_compra.findMany({ where: { estado }, include: inclusion, orderBy: { id: 'desc' }, take: limite });

function anular(usuario, id, comentario) {
  return prisma.$transaction(async (tx) => {
    const antes = await tx.ordenes_compra.findUnique({ where: { id } });
    if (!antes) throw noEncontrado('La orden de compra');
    if (!['PENDIENTE_APROBACION', 'EMITIDA'].includes(antes.estado)) throw new ErrorHttp(409, 'ORDEN_NO_ANULABLE', `No se puede anular una orden en estado ${antes.estado}.`);
    const orden = await tx.ordenes_compra.update({ where: { id }, data: { estado: 'ANULADA' } });
    await tx.aprobaciones.updateMany({ where: { orden_compra_id: id, estado: 'PENDIENTE' }, data: { estado: 'OMITIDA' } });
    await auditar(tx, { usuarioId: usuario.id, accion: 'ANULAR', entidad: 'ordenes_compra', entidadId: id, antes, despues: { ...orden, comentario } });
    return orden;
  });
}

module.exports = { crear, obtener, listar, anular };
