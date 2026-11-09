const { Router } = require('express');
const { validar } = require('../middlewares/validar');
const { permitir } = require('../middlewares/permisos');
const { idParam } = require('../validators/comunes');
const v = require('../validators/compras.validator');
const controller = require('../controllers/ordenes.controller');

const router = Router();
const compras = permitir('ADMIN', 'COMPRADOR', 'JEFATURA_COMPRAS');
const revisores = permitir('ADMIN', 'JEFATURA_COMPRAS', 'AUDITOR');

// Van antes de /:id para que "posibles-duplicados" no se interprete como un id.
router.get('/posibles-duplicados', validar({ query: v.consultaSospechas }), controller.posiblesDuplicados);
router.patch('/posibles-duplicados/:id', revisores, validar({ params: idParam, body: v.revisarSospecha }), controller.revisarDuplicado);

router.get('/', validar({ query: v.consultaOrdenes }), controller.listar);
router.post('/', compras, validar({ body: v.crearOrden }), controller.crear);
router.get('/:id', validar({ params: idParam }), controller.obtener);
router.post('/:id/aprobar', validar({ params: idParam, body: v.aprobar }), controller.aprobar);
router.post('/:id/rechazar', validar({ params: idParam, body: v.rechazar }), controller.rechazar);
router.post('/:id/anular', compras, validar({ params: idParam, body: v.rechazar }), controller.anular);

module.exports = router;
