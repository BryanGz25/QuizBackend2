// Punto de entrada: verifica la conexión a MySQL y levanta el servidor.
const env = require('./config/env');
const app = require('./app');
const { prisma } = require('./config/database');
const { iniciarRevision } = require('./jobs/revision.job');

const iniciar = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Conectado a MySQL');
    const servidor = app.listen(env.API_PORT, () => {
      console.log(`API escuchando en http://localhost:${env.API_PORT}/api`);
      iniciarRevision();
    });
    servidor.on('error', (error) => {
      const mensaje = error.code === 'EADDRINUSE' ? `El puerto ${env.API_PORT} ya está en uso.` : error.message;
      console.error('No se pudo iniciar el servidor:', mensaje);
      process.exit(1);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error.message);
    process.exit(1);
  }
};

iniciar();
