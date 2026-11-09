const { Router } = require('express');
const { validar } = require('../middlewares/validar');
const { permitir } = require('../middlewares/permisos');
const { idParam } = require('../validators/comunes');
const v = require('../validators/materiales.validator');
const controller = require('../controllers/materiales.controller');

const router = Router();
const puedeEditar = permitir('ADMIN', 'JEFATURA_COMPRAS');

router.get('/', validar({ query: v.consulta }), controller.listar);
router.post('/', puedeEditar, validar({ body: v.crear }), controller.crear);
router.get('/:id', validar({ params: idParam }), controller.obtener);
router.patch('/:id', puedeEditar, validar({ params: idParam, body: v.actualizar }), controller.actualizar);
router.get('/:id/stock', validar({ params: idParam }), controller.stock);
router.get('/:id/trazabilidad', validar({ params: idParam }), controller.trazabilidad);

module.exports = router;
