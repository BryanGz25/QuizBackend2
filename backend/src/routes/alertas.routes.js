const { Router } = require('express');
const { validar } = require('../middlewares/validar');
const { permitir } = require('../middlewares/permisos');
const { idParam } = require('../validators/comunes');
const v = require('../validators/alertas.validator');
const controller = require('../controllers/alertas.controller');

const router = Router();
const gestores = permitir('ADMIN', 'BODEGUERO', 'JEFATURA_AREA', 'JEFATURA_COMPRAS', 'COMPRADOR');

router.get('/', validar({ query: v.consulta }), controller.listar);
router.get('/reorden', controller.reorden);
router.patch('/:id', gestores, validar({ params: idParam, body: v.cambiarEstado }), controller.cambiarEstado);
router.post('/:id/generar-requisicion', gestores, validar({ params: idParam, body: v.generarRequisicion }), controller.generarRequisicion);

module.exports = router;
