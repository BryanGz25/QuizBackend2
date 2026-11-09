const { Router } = require('express');
const { validar } = require('../middlewares/validar');
const { permitir } = require('../middlewares/permisos');
const { idParam } = require('../validators/comunes');
const v = require('../validators/compras.validator');
const controller = require('../controllers/requisiciones.controller');

const router = Router();
const puedeSolicitar = permitir('ADMIN', 'SOLICITANTE', 'JEFATURA_AREA', 'JEFATURA_COMPRAS', 'COMPRADOR', 'BODEGUERO');

router.get('/', validar({ query: v.consultaRequisiciones }), controller.listar);
router.post('/', puedeSolicitar, validar({ body: v.crearRequisicion }), controller.crear);
router.get('/:id', validar({ params: idParam }), controller.obtener);
// Quién puede aprobar depende del monto: lo decide aprobaciones.service.
router.post('/:id/aprobar', validar({ params: idParam, body: v.aprobar }), controller.aprobar);
router.post('/:id/rechazar', validar({ params: idParam, body: v.rechazar }), controller.rechazar);

module.exports = router;
