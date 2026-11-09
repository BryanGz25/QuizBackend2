const crudFactory = require('./crudFactory');

module.exports = crudFactory('categorias', {
  include: { padre: true },
  orderBy: { codigo: 'asc' },
  mapear: ({ padreId, ...d }) => ({ ...d, padre_id: padreId ?? null }),
});
