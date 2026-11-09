const { z } = require('zod');
const { id, limite } = require('./comunes');

// Qué ubicaciones y qué documento corresponden a cada tipo de movimiento.
const REGLAS = {
  ENTRADA: { origen: false, destino: true, documentos: ['ORDEN_COMPRA', 'CARGA_INICIAL'] },
  SALIDA: { origen: true, destino: false, documentos: ['VALE_SALIDA'] },
  TRASLADO: { origen: true, destino: true, documentos: ['BOLETA_TRASLADO'] },
};
const TIPOS = ['ENTRADA', 'SALIDA', 'TRASLADO', 'AJUSTE'];

const crear = z
  .object({
    tipo: z.enum(TIPOS),
    materialId: id,
    cantidad: z.number().positive().max(9999999),
    origenId: id.optional(),
    destinoId: id.optional(),
    documentoTipo: z.enum(['ORDEN_COMPRA', 'VALE_SALIDA', 'BOLETA_TRASLADO', 'ACTA_AJUSTE', 'CARGA_INICIAL']),
    documentoNumero: z.string().trim().min(1).max(40),
    ordenCompraId: id.optional(),
    observaciones: z.string().trim().max(400).optional(),
    claveIdempotencia: z.string().trim().min(8).max(80),
  })
  .strict()
  .superRefine((d, ctx) => {
    const error = (path, message) => ctx.addIssue({ code: 'custom', path: [path], message });
    if (d.tipo === 'AJUSTE') {
      if (Boolean(d.origenId) === Boolean(d.destinoId)) error('origenId', 'Un ajuste lleva solo origen (resta) o solo destino (suma).');
      if (d.documentoTipo !== 'ACTA_AJUSTE') error('documentoTipo', 'Un ajuste requiere ACTA_AJUSTE.');
      if (!d.observaciones || d.observaciones.length < 10) error('observaciones', 'Un ajuste requiere una justificación de al menos 10 caracteres.');
      return;
    }
    const r = REGLAS[d.tipo];
    if (r.origen !== Boolean(d.origenId)) error('origenId', r.origen ? 'Este movimiento requiere ubicación de origen.' : 'Este movimiento no lleva origen.');
    if (r.destino !== Boolean(d.destinoId)) error('destinoId', r.destino ? 'Este movimiento requiere ubicación de destino.' : 'Este movimiento no lleva destino.');
    if (!r.documentos.includes(d.documentoTipo)) error('documentoTipo', `Documento no válido para ${d.tipo}.`);
    if (d.tipo === 'TRASLADO' && d.origenId === d.destinoId) error('destinoId', 'Origen y destino deben ser distintos.');
    if (d.documentoTipo === 'ORDEN_COMPRA' && !d.ordenCompraId) error('ordenCompraId', 'Indique la orden de compra de origen.');
  });

const consulta = z
  .object({
    materialId: z.coerce.number().int().positive().optional(),
    bodegaId: z.coerce.number().int().positive().optional(),
    tipo: z.enum(TIPOS).optional(),
    limite,
  })
  .strict();

module.exports = { crear, consulta };
