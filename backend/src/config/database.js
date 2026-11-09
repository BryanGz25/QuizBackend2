// Conexión a MySQL mediante Prisma.
require('./env');
const { PrismaClient } = require('@prisma/client');
const { ErrorHttp } = require('../utils/errorHttp');

const rechazar = () => {
  throw new ErrorHttp(409, 'REGISTRO_INMUTABLE', 'Este registro no se puede modificar ni eliminar. Registre un ajuste.');
};
const inmutable = { update: rechazar, updateMany: rechazar, upsert: rechazar, delete: rechazar, deleteMany: rechazar };

// Movimientos y auditoría son registros históricos: desde la aplicación solo se insertan.
const prisma = new PrismaClient().$extends({
  query: { movimientos: inmutable, auditoria: inmutable },
});

module.exports = { prisma };
