const { Router } = require('express');
const { validar } = require('../middlewares/validar');
const { permitir } = require('../middlewares/permisos');
const v = require('../validators/catalogos.validator');
const controller = require('../controllers/areas.controller');

const router = Router();

router.get('/', controller.listar);
router.post('/', permitir('ADMIN'), validar({ body: v.area }), controller.crear);

module.exports = router;
