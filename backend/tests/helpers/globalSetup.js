// Aplica las migraciones sobre la base de datos de pruebas antes de ejecutar la suite.
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

module.exports = async () => {
  execSync('npx prisma migrate deploy', {
    cwd: path.resolve(__dirname, '../..'),
    env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
    stdio: 'pipe',
  });
};
