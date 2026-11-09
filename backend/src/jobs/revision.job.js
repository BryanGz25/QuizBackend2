// Revisión programada: el respaldo de las alertas que se generan al registrar movimientos.
const cron = require('node-cron');
const env = require('../config/env');
const { prisma } = require('../config/database');
const alertas = require('../services/alertas.service');
const duplicados = require('../services/duplicados.service');

async function revisar() {
  const reorden = await alertas.evaluarTodos(prisma);
  const sospechas = await duplicados.escanear(prisma);
  console.log(`Revisión programada: ${reorden} alertas de reorden abiertas, ${sospechas.length} sospechas de duplicado`);
}

function iniciarRevision() {
  cron.schedule(env.ALERTAS_CRON, () => revisar().catch((err) => console.error('Falló la revisión programada:', err.message)));
}

module.exports = { iniciarRevision, revisar };
