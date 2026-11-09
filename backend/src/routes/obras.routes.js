const { Router } = require('express');
const { validar } = require('../middlewares/validar');
const { permitir } = require('../middlewares/permisos');
const v = require('../validators/catalogos.validator');
const controller = require('../controllers/obras.controller');

const router = Router();

router.get('/', controller.listar);
router.post('/', permitir('ADMIN', 'JEFATURA_AREA'), validar({ body: v.obra }), controller.crear);

module.exports = router;
