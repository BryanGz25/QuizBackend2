const { ErrorHttp } = require('../utils/errorHttp');

/** Valida body, query y params con zod. Los datos limpios quedan en req.valid. */
const validar = (esquemas) => (req, _res, next) => {
  req.valid = {};
  for (const parte of ['params', 'query', 'body']) {
    if (!esquemas[parte]) continue;
    const r = esquemas[parte].safeParse(req[parte] ?? {});
    if (!r.success) {
      throw new ErrorHttp(400, 'VALIDACION', 'Datos inválidos', r.error.issues.map((i) => ({ campo: i.path.join('.'), mensaje: i.message })));
    }
    req.valid[parte] = r.data;
  }
  next();
};

module.exports = { validar };
