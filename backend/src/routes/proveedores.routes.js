const { Router } = require('express');
const { validar } = require('../middlewares/validar');
const { permitir } = require('../middlewares/permisos');
const v = require('../validators/catalogos.validator');
const controller = require('../controllers/proveedores.controller');

const router = Router();

router.get('/', controller.listar);
router.get('/sugerencia', validar({ query: v.sugerencia }), controller.sugerencia);
router.post('/', permitir('ADMIN', 'JEFATURA_COMPRAS'), validar({ body: v.proveedor }), controller.crear);

module.exports = router;
