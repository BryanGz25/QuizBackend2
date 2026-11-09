const { z } = require('zod');
const { id, limite } = require('./comunes');

const crearUsuario = z
  .object({
    nombre: z.string().trim().min(2).max(120),
    email: z.string().trim().toLowerCase().email().max(160),
    password: z.string().min(8).max(72),
    rolId: id,
    areaId: id.optional(),
  })
  .strict();

const actualizarUsuario = z
  .object({ rolId: id, areaId: id.nullable(), activo: z.boolean() })
  .partial()
  .strict()
  .refine((d) => Object.keys(d).length > 0, 'Indique al menos un campo.');

const parametroParam = z.object({ clave: z.string().min(1).max(60) }).strict();
const actualizarParametro = z.object({ valor: z.number().nonnegative().max(100000) }).strict();

const actualizarTramo = z
  .object({
    montoHasta: z.number().positive().nullable().optional(),
    cotizacionesRequeridas: z.number().int().min(0).max(20).optional(),
    requiereComite: z.boolean().optional(),
  })
  .strict();

const consultaAuditoria = z.object({ entidad: z.string().max(40).optional(), limite }).strict();

module.exports = { crearUsuario, actualizarUsuario, parametroParam, actualizarParametro, actualizarTramo, consultaAuditoria };
