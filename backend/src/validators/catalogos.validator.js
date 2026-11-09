const { z } = require('zod');
const { id } = require('./comunes');

const codigo = z.string().trim().min(2).max(20);
const nombre = z.string().trim().min(2).max(120);

const categoria = z.object({ codigo, nombre, padreId: id.optional() }).strict();
const area = z.object({ nombre: z.string().trim().min(2).max(80) }).strict();
const obra = z.object({ codigo, nombre }).strict();
const bodega = z.object({ codigo, nombre, obraId: id.optional() }).strict();
const proveedor = z.object({ codigo, nombre }).strict();
const sugerencia = z.object({ materialId: z.coerce.number().int().positive() }).strict();

module.exports = { categoria, area, obra, bodega, proveedor, sugerencia };
