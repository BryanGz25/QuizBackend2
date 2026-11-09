const { Router } = require('express');
const { validar } = require('../middlewares/validar');
const { permitir } = require('../middlewares/permisos');
const v = require('../validators/compras.validator');
const controller = require('../controllers/recepciones.controller');

const router = Router();

router.get('/', validar({ query: v.consultaLimite }), controller.listar);
router.post('/', permitir('ADMIN', 'BODEGUERO'), validar({ body: v.crearRecepcion }), controller.crear);

module.exports = router;
