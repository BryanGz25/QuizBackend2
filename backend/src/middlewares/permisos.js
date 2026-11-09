// Autorización por rol. Se usa siempre después de authMiddleware, que deja req.usuario.
const { ErrorHttp } = require('../utils/errorHttp');

const permitir = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.usuario.rol)) throw new ErrorHttp(403, 'SIN_PERMISO', 'Su rol no permite esta operación.');
  next();
};

module.exports = { permitir };
