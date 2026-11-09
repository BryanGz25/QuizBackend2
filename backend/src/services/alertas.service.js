const { Prisma } = require('@prisma/client');
const { prisma } = require('../config/database');
const { ErrorHttp, noEncontrado } = require('../utils/errorHttp');
const { redondear } = require('../utils/decimal');
const { auditar } = require('./auditoria.service');
const { calcularNiveles, calcularPrioridad, requiereReposicion, nivelesDeMaterial } = require('./reorden.service');
const { stockDerivado } = require('./stock.service');

const ORDEN_PRIORIDAD = { CRITICA: 0, ALTA: 1, MEDIA: 2 };

/** Abre, actualiza o cierra la alerta de un ámbito. Nunca deja dos alertas abiertas para lo mismo. */
async function evaluarAmbito(db, materialId, bodegaId, stock, parametros) {
  const { puntoReorden } = calcularNiveles(parametros);
  const clave = `R:${materialId}:${bodegaId ?? 0}`;
  const abierta = await db.alertas.findUnique({ where: { clave_activa: clave } });

  if (!requiereReposicion(stock, puntoReorden)) {
    if (abierta) {
      await db.alertas.update({
        where: { id: abierta.id },
        data: { estado: 'CERRADA', clave_activa: null, stock_actual: stock, faltante: 0, cerrada_en: new Date(), comentario: 'Cierre automático: el stock superó el punto de reorden.' },
      });
    }
    return null;
  }

  const datos = {
    stock_actual: stock,
    punto_reorden: puntoReorden,
    faltante: redondear(Math.max(0, puntoReorden - stock)),
    prioridad: calcularPrioridad({ stock, ...parametros }),
  };
  if (abierta) return db.alertas.update({ where: { id: abierta.id }, data: datos });

  try {
    return await db.alertas.create({ data: { ...datos, material_id: materialId, bodega_id: bodegaId, clave_activa: clave } });
  } catch (e) {
    // Otro proceso abrió la misma alerta en paralelo: la restricción UNIQUE evitó el duplicado.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') return db.alertas.findUnique({ where: { clave_activa: clave } });
    throw e;
  }
}

/**
 * Los parámetros del material aplican al stock consolidado de la empresa.
 * Si una bodega tiene demanda propia (parametros_bodega), se evalúa además por separado.
 */
async function evaluarMaterial(db, materialId) {
  const material = await db.materiales.findUnique({ where: { id: materialId }, include: { parametros_bodega: true } });
  if (!material || !material.activo) return null;

  const filas = await stockDerivado(db, materialId);
  for (const p of material.parametros_bodega) {
    const stock = filas.find((f) => f.bodega_id === p.bodega_id)?.cantidad ?? 0;
    await evaluarAmbito(db, materialId, p.bodega_id, redondear(stock), {
      demandaPromedio: p.demanda_promedio_dia,
      demandaMaxima: p.demanda_maxima_dia,
      tiempoEntrega: p.tiempo_entrega_dias,
    });
  }

  if (!nivelesDeMaterial(material)) return null;
  const total = redondear(filas.reduce((s, f) => s + f.cantidad, 0));
  return evaluarAmbito(db, materialId, null, total, {
    demandaPromedio: material.demanda_promedio_dia,
    demandaMaxima: material.demanda_maxima_dia,
    tiempoEntrega: material.tiempo_entrega_dias,
  });
}

async function evaluarTodos(db) {
  const materiales = await db.materiales.findMany({ where: { activo: true }, select: { id: true } });
  for (const m of materiales) await evaluarMaterial(db, m.id);
  return db.alertas.count({ where: { clave_activa: { not: null } } });
}

const inclusion = {
  material: { select: { id: true, codigo: true, nombre: true, unidad: true } },
  bodega: { select: { id: true, nombre: true } },
  requisiciones: { select: { id: true, numero: true, estado: true } },
};

function ordenarPorRiesgo(alertas) {
  const riesgo = (a) => (Number(a.punto_reorden) ? Number(a.stock_actual) / Number(a.punto_reorden) : 0);
  return alertas.sort((a, b) => ORDEN_PRIORIDAD[a.prioridad] - ORDEN_PRIORIDAD[b.prioridad] || riesgo(a) - riesgo(b));
}

const conUbicacion = (a) => ({ ...a, ubicacion: a.bodega?.nombre ?? 'Consolidado (todas las bodegas)' });

async function listar({ estado }) {
  const alertas = await prisma.alertas.findMany({ where: { estado }, include: inclusion, orderBy: { creada_en: 'desc' } });
  return ordenarPorRiesgo(alertas).map(conUbicacion);
}

async function reorden() {
  await evaluarTodos(prisma);
  const alertas = await prisma.alertas.findMany({ where: { clave_activa: { not: null } }, include: inclusion });
  return ordenarPorRiesgo(alertas).map(conUbicacion);
}

function cambiarEstado(usuario, id, { estado, comentario }) {
  return prisma.$transaction(async (tx) => {
    const antes = await tx.alertas.findUnique({ where: { id } });
    if (!antes) throw noEncontrado('La alerta');
    if (antes.estado === 'CERRADA') throw new ErrorHttp(409, 'ALERTA_CERRADA', 'La alerta ya está cerrada.');
    const cerrar = estado === 'CERRADA';
    const alerta = await tx.alertas.update({
      where: { id },
      data: { estado, comentario, clave_activa: cerrar ? null : antes.clave_activa, cerrada_en: cerrar ? new Date() : null },
    });
    await auditar(tx, { usuarioId: usuario.id, accion: `ALERTA_${estado}`, entidad: 'alertas', entidadId: id, antes, despues: alerta });
    return alerta;
  });
}

/** Integración inventario → compras: la alerta produce una requisición con el proveedor más conveniente. */
async function generarRequisicion(usuario, id, { precioEstimado, cotizaciones, areaId }) {
  const requisiciones = require('./requisiciones.service');
  const { sugerirProveedor } = require('./proveedores.service');

  const alerta = await prisma.alertas.findUnique({ where: { id }, include: { material: true, requisiciones: true } });
  if (!alerta) throw noEncontrado('La alerta');
  if (alerta.estado === 'CERRADA') throw new ErrorHttp(409, 'ALERTA_CERRADA', 'La alerta ya está cerrada.');
  if (alerta.requisiciones.some((r) => ['PENDIENTE', 'APROBADA'].includes(r.estado))) {
    throw new ErrorHttp(409, 'REQUISICION_EXISTENTE', 'Esta alerta ya tiene una requisición en curso.');
  }

  const sugerencia = await sugerirProveedor(alerta.material_id);
  const precio = precioEstimado ?? sugerencia.recomendado?.precio;
  if (precio == null) throw new ErrorHttp(422, 'PRECIO_REQUERIDO', 'No hay contrato ni historial de precios para este material. Indique un precio estimado.');

  const stockObjetivo = alerta.material.stock_maximo != null ? Number(alerta.material.stock_maximo) : Number(alerta.punto_reorden);
  const cantidad = Math.ceil(Math.max(stockObjetivo - Number(alerta.stock_actual), Number(alerta.faltante), 1));

  // Reponer existencias es responsabilidad de Bodega Central cuando quien la genera no pertenece a un área.
  const areaSolicitante = areaId ?? usuario.areaId ?? (await prisma.areas.findUnique({ where: { nombre: 'Bodega Central' } }))?.id;

  const requisicion = await requisiciones.crear(usuario, {
    areaId: areaSolicitante,
    proveedorSugeridoId: sugerencia.recomendado?.proveedorId,
    alertaId: id,
    cotizaciones,
    justificacion: `Reposición por alerta de reorden de ${alerta.material.nombre}: stock ${Number(alerta.stock_actual)}, punto de reorden ${Number(alerta.punto_reorden)}.`,
    lineas: [{ materialId: alerta.material_id, cantidad, precioEstimado: precio }],
  });
  await prisma.alertas.update({ where: { id }, data: { estado: 'ATENDIDA', comentario: `Requisición ${requisicion.numero} generada.` } });
  return { requisicion, sugerencia };
}

module.exports = { evaluarMaterial, evaluarTodos, listar, reorden, cambiarEstado, generarRequisicion };
