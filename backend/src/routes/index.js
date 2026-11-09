const { Router } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

// ---------- Públicas ----------
router.use('/auth', require('./authRoutes'));

// ---------- Protegidas: todo lo que sigue exige Authorization: Bearer <token> ----------
router.use(authMiddleware);

// Inventario
router.use('/materiales', require('./materiales.routes'));
router.use('/movimientos', require('./movimientos.routes'));
router.use('/alertas', require('./alertas.routes'));

// Catálogos
router.use('/categorias', require('./categorias.routes'));
router.use('/areas', require('./areas.routes'));
router.use('/obras', require('./obras.routes'));
router.use('/bodegas', require('./bodegas.routes'));
router.use('/proveedores', require('./proveedores.routes'));

// Compras
router.use('/requisiciones', require('./requisiciones.routes'));
router.use('/ordenes', require('./ordenes.routes'));
router.use('/recepciones', require('./recepciones.routes'));
router.use('/aprobaciones', require('./aprobaciones.routes'));

// Gestión
router.use('/reportes', require('./reportes.routes'));
router.use('/usuarios', require('./usuarios.routes'));
router.use('/configuracion', require('./configuracion.routes'));

module.exports = router;
