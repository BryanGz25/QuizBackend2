const { Router } = require('express');
const { validar } = require('../middlewares/validar');
const { permitir } = require('../middlewares/permisos');
const v = require('../validators/catalogos.validator');
const controller = require('../controllers/categorias.controller');

const router = Router();

router.get('/', controller.listar);
router.post('/', permitir('ADMIN', 'JEFATURA_COMPRAS'), validar({ body: v.categoria }), controller.crear);

module.exports = router;
