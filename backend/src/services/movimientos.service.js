const { Prisma } = require('@prisma/client');
const { prisma } = require('../config/database');
const { ErrorHttp, noEncontrado } = require('../utils/errorHttp');
const { redondear } = require('../utils/decimal');
const { auditar } = require('./auditoria.service');
const alertas = require('./alertas.service');

const inclusion = {
  material: { select: { codigo: true, nombre: true, unidad: true } },
  origen: { select: { nombre: true } },
  destino: { select: { nombre: true } },
  usuario: { select: { nombre: true } },
  orden: { select: { numero: true } },
};

const ROLES_AJUSTE = ['ADMIN', 'JEFATURA_AREA', 'JEFATURA_COMPRAS'];

/**
 * Único punto del sistema que altera el saldo. Debe llamarse dentro de una transacción.
 * La salida es un UPDATE condicional: InnoDB bloquea la fila, así que dos salidas simultáneas
 * no pueden consumir el mismo stock.
 */
async function aplicar(tx, d) {
  const material = await tx.materiales.findUnique({ where: { id: d.materialId } });
  if (!material || !material.activo) throw new ErrorHttp(422, 'MATERIAL_INVALIDO', 'El material no existe o está inactivo');

  const ids = [d.origenId, d.destinoId].filter(Boolean);
  const bodegas = await tx.bodegas.findMany({ where: { id: { in: ids }, activa: true } });
  if (bodegas.length !== new Set(ids).size) throw new ErrorHttp(422, 'BODEGA_INVALIDA', 'La ubicación no existe o está inactiva');

  if (d.origenId) {
    const r = await tx.inventario.updateMany({
      where: { material_id: d.materialId, bodega_id: d.origenId, cantidad: { gte: d.cantidad } },
      data: { cantidad: { decrement: d.cantidad } },
    });
    if (r.count === 0) {
      const fila = await tx.inventario.findUnique({ where: { material_id_bodega_id: { material_id: d.materialId, bodega_id: d.origenId } } });
      const disponible = fila ? Number(fila.cantidad) : 0;
      throw new ErrorHttp(409, 'STOCK_INSUFICIENTE', `Stock insuficiente: disponible ${disponible}, solicitado ${d.cantidad}`, { disponible, solicitado: d.cantidad });
    }
  }

  if (d.destinoId) {
    await tx.inventario.upsert({
      where: { material_id_bodega_id: { material_id: d.materialId, bodega_id: d.destinoId } },
      create: { material_id: d.materialId, bodega_id: d.destinoId, cantidad: d.cantidad },
      update: { cantidad: { increment: d.cantidad } },
    });
  }

  const movimiento = await tx.movimientos.create({
    data: {
      tipo: d.tipo,
      material_id: d.materialId,
      cantidad: d.cantidad,
      bodega_origen_id: d.origenId ?? null,
      bodega_destino_id: d.destinoId ?? null,
      fecha_movimiento: d.fecha ?? new Date(),
      usuario_id: d.usuarioId,
      documento_tipo: d.documentoTipo,
      documento_numero: d.documentoNumero,
      orden_compra_id: d.ordenCompraId ?? null,
      detalle_recepcion_id: d.detalleRecepcionId ?? null,
      observaciones: d.observaciones ?? null,
      clave_idempotencia: d.clave,
    },
  });
  await auditar(tx, { usuarioId: d.usuarioId, accion: `MOVIMIENTO_${d.tipo}`, entidad: 'movimientos', entidadId: movimiento.id, despues: movimiento });
  return movimiento;
}

function comprobarRepeticion(existente, d) {
  const igual = existente.tipo === d.tipo && existente.material_id === d.materialId && Number(existente.cantidad) === redondear(d.cantidad);
  if (!igual) throw new ErrorHttp(409, 'CLAVE_REUTILIZADA', 'La clave de idempotencia ya se usó para una operación distinta');
  return { movimiento: existente, repetido: true, alerta: null };
}

const esClaveRepetida = (e) => e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002' && String(e.meta?.target).includes('clave_idempotencia');

function validarDocumento(usuario, d) {
  if (d.tipo === 'AJUSTE' && !ROLES_AJUSTE.includes(usuario.rol)) throw new ErrorHttp(403, 'SIN_PERMISO', 'Su rol no permite registrar ajustes');
  if (d.documentoTipo === 'CARGA_INICIAL' && usuario.rol !== 'ADMIN') throw new ErrorHttp(403, 'SIN_PERMISO', 'Solo administración registra cargas iniciales');
}

async function registrar(usuario, d) {
  validarDocumento(usuario, d);

  const existente = await prisma.movimientos.findUnique({ where: { clave_idempotencia: d.clave } });
  if (existente) return comprobarRepeticion(existente, d);

  // Una entrada ligada a una OC es una recepción: valida lo pendiente y actualiza el estado de la orden.
  if (d.tipo === 'ENTRADA' && d.ordenCompraId) {
    const recepciones = require('./recepciones.service');
    const r = await recepciones.registrar(usuario, {
      ordenCompraId: d.ordenCompraId,
      bodegaId: d.destinoId,
      clave: d.clave,
      observaciones: d.observaciones,
      lineas: [{ materialId: d.materialId, cantidad: d.cantidad }],
    });
    return { movimiento: r.movimientos[0], repetido: false, alerta: r.alertas[0] ?? null };
  }

  let movimiento;
  try {
    movimiento = await prisma.$transaction((tx) => aplicar(tx, { ...d, usuarioId: usuario.id }));
  } catch (e) {
    if (!esClaveRepetida(e)) throw e;
    return comprobarRepeticion(await prisma.movimientos.findUnique({ where: { clave_idempotencia: d.clave } }), d);
  }
  return { movimiento, repetido: false, alerta: await alertas.evaluarMaterial(prisma, d.materialId) };
}

const listar = ({ materialId, bodegaId, tipo, limite }) =>
  prisma.movimientos.findMany({
    where: {
      material_id: materialId,
      tipo,
      ...(bodegaId ? { OR: [{ bodega_origen_id: bodegaId }, { bodega_destino_id: bodegaId }] } : {}),
    },
    include: inclusion,
    orderBy: [{ fecha_movimiento: 'desc' }, { id: 'desc' }],
    take: limite,
  });

async function obtener(id) {
  const m = await prisma.movimientos.findUnique({ where: { id }, include: inclusion });
  if (!m) throw noEncontrado('El movimiento');
  return m;
}

module.exports = { aplicar, registrar, listar, obtener, esClaveRepetida };
