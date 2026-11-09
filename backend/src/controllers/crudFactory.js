// Genera listar y crear para los catálogos simples, con auditoría incluida.
const { prisma } = require('../config/database');
const { auditar } = require('../services/auditoria.service');

const crudFactory = (modelo, { include, orderBy, mapear = (d) => d } = {}) => ({
  listar: async (_req, res) => res.json(await prisma[modelo].findMany({ include, orderBy })),
  crear: async (req, res) => {
    const creado = await prisma.$transaction(async (tx) => {
      const fila = await tx[modelo].create({ data: mapear(req.valid.body), include });
      await auditar(tx, { usuarioId: req.usuario.id, accion: 'CREAR', entidad: modelo, entidadId: fila.id, despues: fila });
      return fila;
    });
    res.status(201).json(creado);
  },
});

module.exports = crudFactory;
