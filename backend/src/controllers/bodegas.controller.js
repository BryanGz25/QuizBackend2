const crudFactory = require('./crudFactory');

module.exports = crudFactory('bodegas', {
  include: { obra: true },
  orderBy: { codigo: 'asc' },
  mapear: ({ obraId, ...d }) => ({ ...d, obra_id: obraId ?? null }),
});
