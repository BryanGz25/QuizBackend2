const { verificarToken } = require('../config/jwt');
const { prisma } = require('../config/database');
const { ErrorHttp } = require('../utils/errorHttp');

// Exige Authorization: Bearer <token> y deja al usuario en req.usuario.
const authMiddleware = async (req, _res, next) => {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) throw new ErrorHttp(401, 'NO_AUTENTICADO', 'Debe iniciar sesión.');

  let datos;
  try {
    datos = verificarToken(token);
  } catch {
    throw new ErrorHttp(401, 'TOKEN_INVALIDO', 'La sesión expiró o no es válida.');
  }

  // Se consulta en cada petición para que un cambio de rol o una baja surtan efecto de inmediato.
  const usuario = await prisma.usuarios.findUnique({ where: { id: datos.sub }, include: { rol: true } });
  if (!usuario || !usuario.activo) throw new ErrorHttp(401, 'USUARIO_INACTIVO', 'El usuario no está activo.');

  req.usuario = { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol.codigo, areaId: usuario.area_id };
  next();
};

module.exports = authMiddleware;
