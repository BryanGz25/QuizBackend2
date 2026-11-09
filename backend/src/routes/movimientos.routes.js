const { Router } = require('express');
const { validar } = require('../middlewares/validar');
const { permitir } = require('../middlewares/permisos');
const { idParam } = require('../validators/comunes');
const v = require('../validators/movimientos.validator');
const controller = require('../controllers/movimientos.controller');

const router = Router();

router.get('/', validar({ query: v.consulta }), controller.listar);
router.post('/', permitir('ADMIN', 'BODEGUERO', 'JEFATURA_AREA', 'JEFATURA_COMPRAS'), validar({ body: v.crear }), controller.crear);
router.get('/:id', validar({ params: idParam }), controller.obtener);

module.exports = router;
