const { Router } = require('express');
const { rateLimit } = require('express-rate-limit');
const env = require('../config/env');
const authMiddleware = require('../middlewares/authMiddleware');
const { validar } = require('../middlewares/validar');
const { login } = require('../validators/auth.validator');
const controller = require('../controllers/authController');

const router = Router();

const limitador = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.NODE_ENV === 'test' ? 10000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Espere unos minutos.', codigo: 'DEMASIADOS_INTENTOS' },
});

router.post('/login', limitador, validar({ body: login }), controller.login);
router.get('/me', authMiddleware, controller.yo);

module.exports = router;
