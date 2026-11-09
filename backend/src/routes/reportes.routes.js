const { Router } = require('express');
const { z } = require('zod');
const { validar } = require('../middlewares/validar');
const controller = require('../controllers/reportes.controller');

const router = Router();
const consultaMes = z.object({ mes: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use el formato AAAA-MM.').default('2026-10') }).strict();

router.get('/dashboard', controller.dashboard);
router.get('/inventario', controller.inventario);
router.get('/consolidacion', controller.consolidacion);
router.get('/fuga-valor', validar({ query: consultaMes }), controller.fugaValor);
router.get('/conciliacion', controller.conciliacion);

module.exports = router;
