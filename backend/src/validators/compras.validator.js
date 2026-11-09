const { z } = require('zod');
const { id, limite } = require('./comunes');

const cantidad = z.number().positive().max(9999999);
const precio = z.number().nonnegative().max(999999999);
const cotizaciones = z.number().int().min(0).max(20).optional();

const crearRequisicion = z
  .object({
    areaId: id.optional(),
    proveedorSugeridoId: id.optional(),
    justificacion: z.string().trim().min(5).max(400),
    cotizaciones,
    lineas: z.array(z.object({ materialId: id, cantidad, precioEstimado: precio }).strict()).min(1).max(50),
  })
  .strict();

const crearOrden = z
  .object({
    requisicionId: id.optional(),
    proveedorId: id,
    areaId: id.optional(),
    fechaEmision: z.string().date().optional(),
    cotizaciones,
    lineas: z.array(z.object({ materialId: id, cantidad, precioUnitario: precio }).strict()).min(1).max(50),
  })
  .strict();

const aprobar = z.object({ comentario: z.string().trim().max(400).optional() }).strict();
const rechazar = z.object({ comentario: z.string().trim().min(5, 'Indique el motivo del rechazo.').max(400) }).strict();

const crearRecepcion = z
  .object({
    ordenCompraId: id,
    bodegaId: id,
    observaciones: z.string().trim().max(400).optional(),
    claveIdempotencia: z.string().trim().min(8).max(70),
    lineas: z.array(z.object({ materialId: id, cantidad }).strict()).min(1).max(50),
  })
  .strict();

const consultaRequisiciones = z.object({ estado: z.enum(['PENDIENTE', 'APROBADA', 'RECHAZADA', 'CONVERTIDA']).optional(), limite }).strict();
const consultaOrdenes = z.object({ estado: z.enum(['PENDIENTE_APROBACION', 'EMITIDA', 'RECIBIDA_PARCIAL', 'RECIBIDA', 'RECHAZADA', 'ANULADA']).optional(), limite }).strict();
const consultaLimite = z.object({ limite }).strict();

const consultaSospechas = z.object({ estado: z.enum(['PENDIENTE', 'CONFIRMADA', 'DESCARTADA']).optional() }).strict();
const revisarSospecha = z.object({ estado: z.enum(['CONFIRMADA', 'DESCARTADA']), comentario: z.string().trim().min(5).max(400) }).strict();

module.exports = { crearRequisicion, crearOrden, aprobar, rechazar, crearRecepcion, consultaRequisiciones, consultaOrdenes, consultaLimite, consultaSospechas, revisarSospecha };
