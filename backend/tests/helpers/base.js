const { randomUUID } = require('crypto');
const request = require('supertest');
const app = require('../../src/app');
const { prisma } = require('../../src/config/database');
const { sembrar } = require('../../prisma/seed');

const PASSWORD = 'Demo2026!';

/** Deja la base de pruebas con exactamente los datos semilla. */
async function reiniciarBase() {
  const tablas = await prisma.$queryRaw`
    SELECT table_name AS nombre FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name <> '_prisma_migrations'`;
  await prisma.$transaction([
    prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0'),
    // DELETE y no TRUNCATE: TRUNCATE recrea cada tabla en disco y provocaba pausas largas entre pruebas.
    ...tablas.map((t) => prisma.$executeRawUnsafe(`DELETE FROM \`${t.nombre}\``)),
    prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1'),
  ]);
  await sembrar(prisma, { costoHash: 4 });
}

async function sesion(usuario) {
  const r = await request(app).post('/api/auth/login').send({ email: `${usuario}@delvalle.test`, password: PASSWORD }).expect(200);
  const cabecera = { Authorization: `Bearer ${r.body.token}` };
  return {
    get: (url) => request(app).get(url).set(cabecera),
    post: (url, cuerpo = {}) => request(app).post(url).set(cabecera).send(cuerpo),
    patch: (url, cuerpo = {}) => request(app).patch(url).set(cabecera).send(cuerpo),
    put: (url, cuerpo = {}) => request(app).put(url).set(cabecera).send(cuerpo),
    usuario: r.body.usuario,
  };
}

const material = (codigo) => prisma.materiales.findUnique({ where: { codigo } });
const bodega = (codigo) => prisma.bodegas.findUnique({ where: { codigo } });
const area = (nombre) => prisma.areas.findUnique({ where: { nombre } });
const proveedor = (letra) => prisma.proveedores.findUnique({ where: { codigo: `PROV-${letra}` } });
const clave = () => randomUUID();

const cerrar = () => prisma.$disconnect();

module.exports = { app, prisma, reiniciarBase, sesion, material, bodega, area, proveedor, clave, cerrar };
