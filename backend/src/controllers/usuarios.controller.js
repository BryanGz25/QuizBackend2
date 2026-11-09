const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');
const { ErrorHttp } = require('../utils/errorHttp');
const { auditar } = require('../services/auditoria.service');

// La contraseña nunca sale de la API.
const vista = { id: true, nombre: true, email: true, activo: true, creado_en: true, rol: true, area: true };

const listar = async (_req, res) => res.json(await prisma.usuarios.findMany({ select: vista, orderBy: { nombre: 'asc' } }));
const roles = async (_req, res) => res.json(await prisma.roles.findMany({ orderBy: { nombre: 'asc' } }));

const crear = async (req, res) => {
  const { password, rolId, areaId, ...datos } = req.valid.body;
  const password_hash = await bcrypt.hash(password, 10);
  const usuario = await prisma.$transaction(async (tx) => {
    const u = await tx.usuarios.create({ data: { ...datos, password_hash, rol_id: rolId, area_id: areaId ?? null }, select: vista });
    await auditar(tx, { usuarioId: req.usuario.id, accion: 'CREAR', entidad: 'usuarios', entidadId: u.id, despues: u });
    return u;
  });
  res.status(201).json(usuario);
};

const actualizar = async (req, res) => {
  const { id } = req.valid.params;
  const { rolId, areaId, activo } = req.valid.body;
  if (id === req.usuario.id && (activo === false || rolId !== undefined)) {
    throw new ErrorHttp(409, 'AUTOGESTION_NO_PERMITIDA', 'No puede desactivar ni cambiar el rol de su propio usuario.');
  }
  const usuario = await prisma.$transaction(async (tx) => {
    const antes = await tx.usuarios.findUniqueOrThrow({ where: { id }, select: vista });
    const u = await tx.usuarios.update({ where: { id }, data: { rol_id: rolId, area_id: areaId, activo }, select: vista });
    await auditar(tx, { usuarioId: req.usuario.id, accion: 'ACTUALIZAR', entidad: 'usuarios', entidadId: id, antes, despues: u });
    return u;
  });
  res.json(usuario);
};

module.exports = { listar, roles, crear, actualizar };
