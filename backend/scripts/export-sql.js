// Genera database/schema.sql (desde las migraciones) y database/seed.sql (desde la base sembrada).
// Así hay una sola fuente de verdad y los scripts SQL no se desincronizan de Prisma.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
require('../src/config/env');

const raiz = path.resolve(__dirname, '..');
const salida = path.resolve(raiz, '../database');
const MYSQLDUMP = process.env.MYSQLDUMP_PATH || 'C:/Program Files/MySQL/MySQL Server 8.0/bin/mysqldump.exe';

const carpeta = path.join(raiz, 'prisma/migrations');
const migraciones = fs.readdirSync(carpeta).filter((d) => fs.statSync(path.join(carpeta, d)).isDirectory()).sort();
const esquema = migraciones.map((m) => `-- Migración ${m}\n${fs.readFileSync(path.join(carpeta, m, 'migration.sql'), 'utf8')}`).join('\n');
fs.writeFileSync(path.join(salida, 'schema.sql'), `-- Generado por npm run db:export. No editar a mano.\n\n${esquema}`);

const url = new URL(process.env.DATABASE_URL);
const r = spawnSync(MYSQLDUMP, [
  `--host=${url.hostname}`, `--user=${decodeURIComponent(url.username)}`, '--no-create-info', '--skip-triggers', '--no-tablespaces', '--complete-insert',
  '--skip-extended-insert', '--ignore-table=' + url.pathname.slice(1) + '._prisma_migrations', '--default-character-set=utf8mb4', '--set-gtid-purged=OFF', url.pathname.slice(1),
], { env: { ...process.env, MYSQL_PWD: decodeURIComponent(url.password) }, encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
if (r.status !== 0) throw new Error(r.stderr);

fs.writeFileSync(path.join(salida, 'seed.sql'), `-- Generado por npm run db:export. Datos del documento y datos ficticios de prueba.\nSET FOREIGN_KEY_CHECKS=0;\n${r.stdout}\nSET FOREIGN_KEY_CHECKS=1;\n`);
console.log(`schema.sql: ${migraciones.length} migraciones. seed.sql generado.`);
