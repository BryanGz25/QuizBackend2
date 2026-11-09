const { randomUUID } = require('crypto');
const { prisma } = require('../config/database');
const { ErrorHttp, noEncontrado } = require('../utils/errorHttp');
const { redondear } = require('../utils/decimal');
const { auditar } = require('./auditoria.service');
const aprobaciones = require('./aprobaciones.service');
const fraccionamiento = require('./fraccionamiento.service');

const inclusion = {
  area: { select: { nombre: true } },
  solicitante: { select: { nombre: true } },
  proveedor: { select: { nombre: true } },
  detalle: { include: { material: { select: { codigo: true, nombre: true, unidad: true } } } },
  aprobaciones: { include: { rol: { select: { nombre: true } }, usuario: { select: { nombre: true } } }, orderBy: { paso: 'asc' } },
};

const ROLES_OTRA_AREA = ['ADMIN', 'JEFATURA_COMPRAS', 'BODEGUERO'];

function resolverArea(usuario, areaId) {
  const area = areaId ?? usuario.areaId;
  if (!area) throw new ErrorHttp(400, 'AREA_REQUERIDA', 'Indique el área solicitante.');
  if (usuario.areaId && area !== usuario.areaId && !ROLES_OTRA_AREA.includes(usuario.rol)) {
    throw new ErrorHttp(403, 'AREA_NO_PERMITIDA', 'Solo puede solicitar para su propia área.');
  }
  return area;
}

async function crear(usuario, d) {
  const areaId = resolverArea(usuario, d.areaId);
  const ids = d.lineas.map((l) => l.materialId);
  if (new Set(ids).size !== ids.length) throw new ErrorHttp(400, 'MATERIAL_REPETIDO', 'Un material solo puede aparecer una vez por requisición.');
  const existentes = await prisma.materiales.count({ where: { id: { in: ids }, activo: true } });
  if (existentes !== ids.length) throw new ErrorHttp(422, 'MATERIAL_INVALIDO', 'Algún material no existe o está inactivo.');

  const montoTotal = redondear(d.lineas.reduce((s, l) => s + l.cantidad * l.precioEstimado, 0), 2);
  const lineas = d.lineas.map((l) => ({ materialId: l.materialId, cantidad: l.cantidad, precio: l.precioEstimado }));

  const creada = await prisma.$transaction(async (tx) => {
    const f = await fraccionamiento.evaluar(tx, { areaId, proveedorId: d.proveedorSugeridoId, lineas, montoTotal });
    const tramo = await aprobaciones.tramoPorMonto(tx, f.montoEvaluado);
    const temporal = await tx.requisiciones.create({
      data: {
        numero: `TMP-${randomUUID()}`,
        area_id: areaId,
        solicitante_id: usuario.id,
        proveedor_sugerido_id: d.proveedorSugeridoId ?? null,
        alerta_id: d.alertaId ?? null,
        justificacion: d.justificacion,
        cotizaciones: d.cotizaciones ?? 0,
        monto_total: montoTotal,
        monto_evaluado: f.montoEvaluado,
        cotizaciones_requeridas: tramo.cotizaciones_requeridas,
        fraccionamiento_sospechoso: f.sospechoso,
        fraccionamiento_detalle: f.detalle ?? undefined,
        detalle: { create: d.lineas.map((l) => ({ material_id: l.materialId, cantidad: l.cantidad, precio_estimado: l.precioEstimado })) },
      },
    });
    const r = await tx.requisiciones.update({ where: { id: temporal.id }, data: { numero: `REQ-${String(temporal.id).padStart(5, '0')}` } });
    await aprobaciones.crearPasos(tx, { requisicion_id: r.id }, tramo, usuario.rol);
    await auditar(tx, { usuarioId: usuario.id, accion: 'CREAR', entidad: 'requisiciones', entidadId: r.id, despues: r });
    return r.id;
  });

  return obtener(creada);
}

async function obtener(id) {
  const r = await prisma.requisiciones.findUnique({ where: { id }, include: inclusion });
  if (!r) throw noEncontrado('La requisición');
  return r;
}

const listar = ({ estado, limite }) => prisma.requisiciones.findMany({ where: { estado }, include: inclusion, orderBy: { id: 'desc' }, take: limite });

module.exports = { crear, obtener, listar };
