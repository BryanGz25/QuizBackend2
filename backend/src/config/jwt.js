const jwt = require('jsonwebtoken');
const env = require('./env');

const firmarToken = (usuarioId) => jwt.sign({ sub: usuarioId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
const verificarToken = (token) => jwt.verify(token, env.JWT_SECRET);

module.exports = { firmarToken, verificarToken };
