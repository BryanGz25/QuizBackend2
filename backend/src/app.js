// Configuración de Express: middlewares, rutas y manejo de errores.
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { Prisma } = require('@prisma/client');
const env = require('./config/env');
const { prisma } = require('./config/database');
const rutas = require('./routes');
const { rutaNoEncontrada, manejadorErrores } = require('./middlewares/errores');

const app = express();

// Prisma entrega DECIMAL como objeto; la API responde números.
app.set('json replacer', function reemplazar(clave, valor) {
  return Prisma.Decimal.isDecimal(this[clave]) ? Number(valor) : valor;
});

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN.split(',') }));
app.use(express.json({ limit: '200kb' }));

// Datos privados de cada usuario: se revalidan siempre.
app.use((_req, res, next) => {
  res.set('Cache-Control', 'private, no-cache');
  next();
});

app.get('/api/health', async (_req, res) => {
  const [{ version }] = await prisma.$queryRaw`SELECT VERSION() AS version`;
  res.json({ estado: 'ok', baseDeDatos: `MySQL ${version}` });
});
app.use('/api', rutas);

app.use(rutaNoEncontrada);
app.use(manejadorErrores);

module.exports = app;
