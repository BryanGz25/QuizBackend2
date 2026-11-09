const crudFactory = require('./crudFactory');

module.exports = crudFactory('obras', { include: { bodegas: true }, orderBy: { codigo: 'asc' } });
