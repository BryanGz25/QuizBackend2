// Error con el código HTTP que le corresponde; lo traduce middlewares/errores.js.
class ErrorHttp extends Error {
  constructor(status, codigo, mensaje, detalles) {
    super(mensaje);
    this.status = status;
    this.codigo = codigo;
    this.detalles = detalles;
  }
}

const noEncontrado = (entidad) => new ErrorHttp(404, 'NO_ENCONTRADO', `${entidad} no existe.`);

module.exports = { ErrorHttp, noEncontrado };
