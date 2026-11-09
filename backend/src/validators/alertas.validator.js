const { z } = require('zod');
const { id } = require('./comunes');

const consulta = z.object({ estado: z.enum(['PENDIENTE', 'ATENDIDA', 'CERRADA']).optional() }).strict();
const cambiarEstado = z.object({ estado: z.enum(['ATENDIDA', 'CERRADA']), comentario: z.string().trim().min(3).max(400) }).strict();
const generarRequisicion = z
  .object({
    precioEstimado: z.number().positive().max(999999999).optional(),
    cotizaciones: z.number().int().min(0).max(20).optional(),
    areaId: id.optional(),
  })
  .strict();

module.exports = { consulta, cambiarEstado, generarRequisicion };
