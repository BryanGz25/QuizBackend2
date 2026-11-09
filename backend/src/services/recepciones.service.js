const { randomUUID } = require('crypto');
const { prisma } = require('../config/database');
const { ErrorHttp, noEncontrado } = require('../utils/errorHttp');
const { redondear } = require('../utils/decimal');
const { auditar } = require('./auditoria.service');
const alertas = require('./alertas.service');
const movimientos = require('./movimientos.service');

const claveLinea = (clave, i) => (i === 0 ? clave : `${clave}:${i}`);

async function respuestaRepetida(clave) {
  const mov = await prisma.movimientos.findUnique({ where: { clave_idempotencia: clave }, include: { detalle_recepcion: { include: { recepcion: true } } } });
  return mov ? { recepcion: mov.detalle_recepcion?.recepcion ?? null, movimientos: [mov], alertas: [], repetido: true } : null;
}

async function recibidoPorLinea(tx, detalle) {
  const filas = await tx.detalle_recepciones.groupBy({
    by: ['detalle_orden_id'],
    where: { detalle_orden_id: { in: detalle.map((d) => d.id) } },
    _sum: { cantidad_recibida: true },
  });
  return new Map(filas.map((f) => [f.detalle_orden_id, Number(f._sum.cantidad_recibida)]));
}

async function registrar(usuario, d) {
  const repetida = await respuestaRepetida(d.clave);
  if (repetida) return repetida;

  let resultado;
  try {
    resultado = await prisma.$transaction(async (tx) => {
      // Bloquea la orden: dos recepciones simultáneas no pueden superar lo pedido.
      await tx.$queryRaw`SELECT id FROM ordenes_compra WHERE id = ${d.ordenCompraId} FOR UPDATE`;
      const orden = await tx.ordenes_compra.findUnique({ where: { id: d.ordenCompraId }, include: { detalle: true } });
      if (!orden) throw noEncontrado('La orden de compra');
      if (!['EMITIDA', 'RECIBIDA_PARCIAL'].includes(orden.estado)) throw new ErrorHttp(409, 'ORDEN_NO_RECIBIBLE', `La orden está en estado ${orden.estado}.`);

      const recibido = await recibidoPorLinea(tx, orden.detalle);
      const temporal = await tx.recepciones.create({
        data: { numero: `TMP-${randomUUID()}`, orden_compra_id: orden.id, bodega_id: d.bodegaId, usuario_id: usuario.id, observaciones: d.observaciones ?? null },
      });
      const recepcion = await tx.recepciones.update({ where: { id: temporal.id }, data: { numero: `REC-${String(temporal.id).padStart(5, '0')}` } });

      const creados = [];
      for (const [i, linea] of d.lineas.entries()) {
        const detalle = orden.detalle.find((x) => x.material_id === linea.materialId);
        if (!detalle) throw new ErrorHttp(422, 'MATERIAL_FUERA_DE_ORDEN', 'El material no pertenece a esta orden de compra.');
        const pendiente = redondear(Number(detalle.cantidad) - (recibido.get(detalle.id) ?? 0));
        if (linea.cantidad > pendiente) throw new ErrorHttp(409, 'RECEPCION_EXCEDE_ORDEN', `Se intenta recibir ${linea.cantidad} y quedan ${pendiente} pendientes.`, { pendiente });

        const dr = await tx.detalle_recepciones.create({ data: { recepcion_id: recepcion.id, detalle_orden_id: detalle.id, cantidad_recibida: linea.cantidad } });
        recibido.set(detalle.id, (recibido.get(detalle.id) ?? 0) + linea.cantidad);
        creados.push(await movimientos.aplicar(tx, {
          tipo: 'ENTRADA',
          materialId: linea.materialId,
          cantidad: linea.cantidad,
          destinoId: d.bodegaId,
          usuarioId: usuario.id,
          documentoTipo: 'ORDEN_COMPRA',
          documentoNumero: orden.numero,
          ordenCompraId: orden.id,
          detalleRecepcionId: dr.id,
          observaciones: d.observaciones,
          clave: claveLinea(d.clave, i),
        }));
      }

      const completa = orden.detalle.every((x) => (recibido.get(x.id) ?? 0) >= Number(x.cantidad));
      await tx.ordenes_compra.update({ where: { id: orden.id }, data: { estado: completa ? 'RECIBIDA' : 'RECIBIDA_PARCIAL' } });
      await auditar(tx, { usuarioId: usuario.id, accion: 'RECIBIR', entidad: 'recepciones', entidadId: recepcion.id, despues: recepcion });
      return { recepcion, movimientos: creados };
    });
  } catch (e) {
    if (!movimientos.esClaveRepetida(e)) throw e;
    return respuestaRepetida(d.clave);
  }

  const evaluadas = [];
  for (const l of d.lineas) evaluadas.push(await alertas.evaluarMaterial(prisma, l.materialId));
  return { ...resultado, alertas: evaluadas.filter(Boolean), repetido: false };
}

const listar = ({ limite }) =>
  prisma.recepciones.findMany({
    include: {
      orden: { select: { numero: true, proveedor: { select: { nombre: true } } } },
      bodega: { select: { nombre: true } },
      usuario: { select: { nombre: true } },
      detalle: { include: { detalle_orden: { include: { material: { select: { nombre: true, unidad: true } } } } } },
    },
    orderBy: { id: 'desc' },
    take: limite,
  });

module.exports = { registrar, listar };
