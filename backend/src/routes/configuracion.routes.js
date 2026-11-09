const { Router } = require('express');
const { validar } = require('../middlewares/validar');
const { permitir } = require('../middlewares/permisos');
const { idParam } = require('../validators/comunes');
const v = require('../validators/administracion.validator');
const controller = require('../controllers/configuracion.controller');

const router = Router();

router.get('/parametros', controller.parametros);
router.put('/parametros/:clave', permitir('ADMIN'), validar({ params: v.parametroParam, body: v.actualizarParametro }), controller.actualizarParametro);
router.get('/matriz', controller.matriz);
router.put('/matriz/:id', permitir('ADMIN'), validar({ params: idParam, body: v.actualizarTramo }), controller.actualizarTramo);
router.get('/auditoria', permitir('ADMIN', 'AUDITOR'), validar({ query: v.consultaAuditoria }), controller.auditoria);

module.exports = router;
