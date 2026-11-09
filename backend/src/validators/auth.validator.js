const { z } = require('zod');

const login = z.object({ email: z.string().email(), password: z.string().min(1).max(200) }).strict();

module.exports = { login };
