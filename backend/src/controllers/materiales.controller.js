const servicio = require('../services/materiales.service');

module.exports = {
  listar: async (req, res) => res.json(await servicio.listar(req.valid.query)),
  obtener: async (req, res) => res.json(await servicio.obtener(req.valid.params.id)),
  crear: async (req, res) => res.status(201).json(await servicio.crear(req.usuario, req.valid.body)),
  actualizar: async (req, res) => res.json(await servicio.actualizar(req.usuario, req.valid.params.id, req.valid.body)),
  stock: async (req, res) => res.json(await servicio.stock(req.valid.params.id)),
  trazabilidad: async (req, res) => res.json(await servicio.trazabilidad(req.valid.params.id)),
};
