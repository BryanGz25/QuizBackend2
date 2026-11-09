// Devuelve la base de desarrollo a los datos semilla, útil antes de grabar o presentar la demo.
const { prisma } = require('../src/config/database');
const { sembrar } = require('../prisma/seed');

async function reiniciar() {
  if (process.env.NODE_ENV === 'production') throw new Error('No se permite en producción.');
  const tablas = await prisma.$queryRaw`
    SELECT table_name AS nombre FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name <> '_prisma_migrations'`;
  await prisma.$transaction([
    prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0'),
    ...tablas.map((t) => prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${t.nombre}\``)),
    prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1'),
  ]);
  await sembrar();
  console.log('Base de desarrollo reiniciada con los datos semilla.');
}

reiniciar()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
