const crudFactory = require('./crudFactory');

module.exports = crudFactory('areas', { orderBy: { nombre: 'asc' } });
