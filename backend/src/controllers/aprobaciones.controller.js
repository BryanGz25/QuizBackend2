const servicio = require('../services/aprobaciones.service');

module.exports = {
  pendientes: async (req, res) => res.json(await servicio.pendientes(req.usuario)),
  historial: async (_req, res) => res.json(await servicio.historial()),
};
