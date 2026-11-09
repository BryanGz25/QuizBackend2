const { prisma } = require('../config/database');
const { auditar } = require('../services/auditoria.service');
const { leerMatriz } = require('../services/aprobaciones.service');

const parametros = async (_req, res) => res.json(await prisma.parametros.findMany({ orderBy: { clave: 'asc' } }));

const actualizarParametro = async (req, res) => {
  const { clave } = req.valid.params;
  const parametro = await prisma.$transaction(async (tx) => {
    const antes = await tx.parametros.findUniqueOrThrow({ where: { clave } });
    const p = await tx.parametros.update({ where: { clave }, data: { valor: String(req.valid.body.valor) } });
    await auditar(tx, { usuarioId: req.usuario.id, accion: 'ACTUALIZAR', entidad: 'parametros', entidadId: clave, antes, despues: p });
    return p;
  });
  res.json(parametro);
};

const matriz = async (_req, res) => res.json(await leerMatriz(prisma));

const actualizarTramo = async (req, res) => {
  const { id } = req.valid.params;
  const { montoHasta, cotizacionesRequeridas, requiereComite } = req.valid.body;
  const tramo = await prisma.$transaction(async (tx) => {
    const antes = await tx.matriz_aprobacion.findUniqueOrThrow({ where: { id } });
    const t = await tx.matriz_aprobacion.update({
      where: { id },
      data: { monto_hasta: montoHasta, cotizaciones_requeridas: cotizacionesRequeridas, requiere_comite: requiereComite },
      include: { rol: true },
    });
    await auditar(tx, { usuarioId: req.usuario.id, accion: 'ACTUALIZAR', entidad: 'matriz_aprobacion', entidadId: id, antes, despues: t });
    return t;
  });
  res.json(tramo);
};

const auditoria = async (req, res) => {
  const { entidad, limite } = req.valid.query;
  res.json(await prisma.auditoria.findMany({ where: { entidad }, include: { usuario: { select: { nombre: true } } }, orderBy: { id: 'desc' }, take: limite }));
};

module.exports = { parametros, actualizarParametro, matriz, actualizarTramo, auditoria };
