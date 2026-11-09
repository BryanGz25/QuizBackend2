const crudFactory = require('./crudFactory');
const { sugerirProveedor } = require('../services/proveedores.service');

module.exports = {
  ...crudFactory('proveedores', { include: { contratos: { include: { material: { select: { nombre: true } } } } }, orderBy: { codigo: 'asc' } }),
  sugerencia: async (req, res) => res.json(await sugerirProveedor(req.valid.query.materialId)),
};
