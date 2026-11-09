const { z } = require('zod');

const numero = z.coerce.number().nonnegative().nullable().optional();
const base = {
  nombre: z.string().trim().min(2).max(160),
  unidad: z.string().trim().min(1).max(20),
  categoriaId: z.number().int().positive(),
  stockMinimo: numero,
  stockMaximo: numero,
  demandaPromedioDia: numero,
  demandaMaximaDia: numero,
  tiempoEntregaDias: z.number().int().nonnegative().nullable().optional(),
};

const reglas = (d, ctx) => {
  const p = [d.demandaPromedioDia, d.demandaMaximaDia, d.tiempoEntregaDias].filter((v) => v != null).length;
  if (p !== 0 && p !== 3) ctx.addIssue({ code: 'custom', path: ['demandaPromedioDia'], message: 'Demanda promedio, máxima y tiempo de entrega van juntos.' });
  if (d.demandaMaximaDia != null && d.demandaPromedioDia != null && d.demandaMaximaDia < d.demandaPromedioDia) ctx.addIssue({ code: 'custom', path: ['demandaMaximaDia'], message: 'Debe ser mayor o igual que la demanda promedio.' });
  if (d.stockMaximo != null && d.stockMinimo != null && d.stockMaximo < d.stockMinimo) ctx.addIssue({ code: 'custom', path: ['stockMaximo'], message: 'Debe ser mayor o igual que el stock mínimo.' });
};

const crear = z.object({ codigo: z.string().trim().min(2).max(40), ...base }).strict().superRefine(reglas);
// El stock y el punto de reorden no son editables: no existen en este esquema.
const actualizar = z.object({ ...base, activo: z.boolean().optional() }).partial().strict().superRefine(reglas);
const consulta = z.object({ buscar: z.string().max(80).optional() }).strict();

module.exports = { crear, actualizar, consulta };
