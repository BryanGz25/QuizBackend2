async function leerParametros(db, claves) {
  const filas = await db.parametros.findMany({ where: { clave: { in: claves } } });
  return Object.fromEntries(filas.map((f) => [f.clave, Number(f.valor)]));
}

module.exports = { leerParametros };
