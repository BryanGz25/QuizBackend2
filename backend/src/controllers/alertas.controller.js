const servicio = require('../services/alertas.service');

module.exports = {
  listar: async (req, res) => res.json(await servicio.listar(req.valid.query)),
  reorden: async (_req, res) => res.json(await servicio.reorden()),
  cambiarEstado: async (req, res) => res.json(await servicio.cambiarEstado(req.usuario, req.valid.params.id, req.valid.body)),
  generarRequisicion: async (req, res) => res.status(201).json(await servicio.generarRequisicion(req.usuario, req.valid.params.id, req.valid.body)),
};
