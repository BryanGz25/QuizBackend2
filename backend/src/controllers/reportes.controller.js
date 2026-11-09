const servicio = require('../services/reportes.service');

module.exports = {
  dashboard: async (req, res) => res.json(await servicio.dashboard(req.usuario)),
  inventario: async (_req, res) => res.json(await servicio.inventario()),
  consolidacion: async (_req, res) => res.json(await servicio.consolidacion()),
  fugaValor: async (req, res) => res.json(await servicio.fugaValor(req.valid.query)),
  conciliacion: async (_req, res) => res.json(await servicio.conciliacion()),
};
