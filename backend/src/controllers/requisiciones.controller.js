const servicio = require('../services/requisiciones.service');
const aprobaciones = require('../services/aprobaciones.service');

const decidir = (decision) => async (req, res) =>
  res.json(await aprobaciones.decidir(req.usuario, 'requisicion', req.valid.params.id, decision, req.valid.body.comentario));

module.exports = {
  listar: async (req, res) => res.json(await servicio.listar(req.valid.query)),
  obtener: async (req, res) => res.json(await servicio.obtener(req.valid.params.id)),
  crear: async (req, res) => res.status(201).json(await servicio.crear(req.usuario, req.valid.body)),
  aprobar: decidir('APROBADA'),
  rechazar: decidir('RECHAZADA'),
};
