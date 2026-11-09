// Lee y valida las variables de entorno. Si falta una crítica, el servidor no inicia.
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), quiet: true });
const { z } = require('zod');

const esquema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().startsWith('mysql://'),
  TEST_DATABASE_URL: z.string().startsWith('mysql://').optional(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('8h'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  ALERTAS_CRON: z.string().default('*/10 * * * *'),
});

const resultado = esquema.safeParse(process.env);
if (!resultado.success) {
  console.error('Configuración inválida:', resultado.error.flatten().fieldErrors);
  process.exit(1);
}

const env = resultado.data;

// Las pruebas jamás deben tocar la base de datos de trabajo.
if (env.NODE_ENV === 'test') {
  if (!env.TEST_DATABASE_URL) throw new Error('Falta TEST_DATABASE_URL');
  env.DATABASE_URL = env.TEST_DATABASE_URL;
  process.env.DATABASE_URL = env.TEST_DATABASE_URL;
}

module.exports = env;
