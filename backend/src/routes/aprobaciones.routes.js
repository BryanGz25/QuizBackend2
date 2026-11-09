const { Router } = require('express');
const controller = require('../controllers/aprobaciones.controller');

const router = Router();

router.get('/pendientes', controller.pendientes);
router.get('/historial', controller.historial);

module.exports = router;
