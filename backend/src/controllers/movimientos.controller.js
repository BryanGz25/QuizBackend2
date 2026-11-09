const servicio = require('../services/movimientos.service');

const crear = async (req, res) => {
  const { claveIdempotencia, ...datos } = req.valid.body;
  const r = await servicio.registrar(req.usuario, { ...datos, clave: claveIdempotencia });
  res.status(r.repetido ? 200 : 201).json(r);
};

module.exports = {
  crear,
  listar: async (req, res) => res.json(await servicio.listar(req.valid.query)),
  obtener: async (req, res) => res.json(await servicio.obtener(req.valid.params.id)),
};
