const { z } = require('zod');

const idParam = z.object({ id: z.coerce.number().int().positive() }).strict();
const id = z.number().int().positive();
const limite = z.coerce.number().int().min(1).max(500).default(100);

module.exports = { idParam, id, limite };
