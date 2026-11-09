const { Prisma } = require('@prisma/client');
const { ErrorHttp } = require('../utils/errorHttp');

const responder = (res, status, codigo, error, detalles) => res.status(status).json({ error, codigo, detalles });

// 404 para rutas que no existen.
const rutaNoEncontrada = (req, res) => responder(res, 404, 'RUTA_NO_ENCONTRADA', `Ruta no encontrada: ${req.method} ${req.originalUrl}`);

// Traduce los errores conocidos a respuestas JSON claras; el resto es 500 sin filtrar detalles internos.
// eslint-disable-next-line no-unused-vars
const manejadorErrores = (err, _req, res, _next) => {
  if (err instanceof ErrorHttp) return responder(res, err.status, err.codigo, err.message, err.detalles);
  if (err.type === 'entity.parse.failed') return responder(res, 400, 'JSON_INVALIDO', 'El cuerpo de la petición no es un JSON válido.');
  if (err.type === 'entity.too.large') return responder(res, 413, 'CUERPO_GRANDE', 'El cuerpo de la petición es demasiado grande.');

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return responder(res, 409, 'DUPLICADO', 'Ya existe un registro con esos datos únicos.');
    if (err.code === 'P2003') return responder(res, 400, 'REFERENCIA_INVALIDA', 'Un dato hace referencia a un registro que no existe.');
    if (err.code === 'P2025') return responder(res, 404, 'NO_ENCONTRADO', 'El registro no existe.');
    if (err.code === 'P2034') return responder(res, 409, 'CONFLICTO_CONCURRENCIA', 'Otra operación modificó estos datos. Intente de nuevo.');
  }

  console.error(err);
  return responder(res, 500, 'ERROR_INTERNO', 'Error interno del servidor.');
};

module.exports = { rutaNoEncontrada, manejadorErrores };
