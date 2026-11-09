const limpio = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));

/** Registra un cambio dentro de la misma transacción que lo produjo. */
function auditar(db, { usuarioId, accion, entidad, entidadId, antes, despues }) {
  return db.auditoria.create({
    data: { usuario_id: usuarioId ?? null, accion, entidad, entidad_id: String(entidadId), antes: limpio(antes), despues: limpio(despues) },
  });
}

module.exports = { auditar };
