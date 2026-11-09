const { Router } = require('express');
const { validar } = require('../middlewares/validar');
const { permitir } = require('../middlewares/permisos');
const { idParam } = require('../validators/comunes');
const v = require('../validators/administracion.validator');
const controller = require('../controllers/usuarios.controller');

const router = Router();
router.use(permitir('ADMIN'));

router.get('/', controller.listar);
router.get('/roles', controller.roles);
router.post('/', validar({ body: v.crearUsuario }), controller.crear);
router.patch('/:id', validar({ params: idParam, body: v.actualizarUsuario }), controller.actualizar);

module.exports = router;
