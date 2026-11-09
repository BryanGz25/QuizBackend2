const servicio = require('../services/ordenes.service');
const aprobaciones = require('../services/aprobaciones.service');
const duplicados = require('../services/duplicados.service');

const decidir = (decision) => async (req, res) =>
  res.json(await aprobaciones.decidir(req.usuario, 'orden', req.valid.params.id, decision, req.valid.body.comentario));

module.exports = {
  listar: async (req, res) => res.json(await servicio.listar(req.valid.query)),
  obtener: async (req, res) => res.json(await servicio.obtener(req.valid.params.id)),
  crear: async (req, res) => res.status(201).json(await servicio.crear(req.usuario, req.valid.body)),
  aprobar: decidir('APROBADA'),
  rechazar: decidir('RECHAZADA'),
  anular: async (req, res) => res.json(await servicio.anular(req.usuario, req.valid.params.id, req.valid.body.comentario)),
  posiblesDuplicados: async (req, res) => res.json(await duplicados.listar(req.valid.query)),
  revisarDuplicado: async (req, res) => res.json(await duplicados.revisar(req.usuario, req.valid.params.id, req.valid.body)),
};
