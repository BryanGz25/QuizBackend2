const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');
const { firmarToken } = require('../config/jwt');
const { ErrorHttp } = require('../utils/errorHttp');

const login = async (req, res) => {
  const { email, password } = req.valid.body;
  const usuario = await prisma.usuarios.findUnique({ where: { email }, include: { rol: true, area: true } });
  // Mismo mensaje en ambos casos para no revelar qué correos existen.
  if (!usuario || !usuario.activo || !(await bcrypt.compare(password, usuario.password_hash))) {
    throw new ErrorHttp(401, 'CREDENCIALES_INVALIDAS', 'Correo o contraseña incorrectos.');
  }
  res.json({
    token: firmarToken(usuario.id),
    usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol.codigo, rolNombre: usuario.rol.nombre, areaId: usuario.area_id, area: usuario.area?.nombre ?? null },
  });
};

const yo = (req, res) => res.json(req.usuario);

module.exports = { login, yo };
