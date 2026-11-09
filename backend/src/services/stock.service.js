const { Prisma } = require('@prisma/client');

/**
 * El stock se obtiene SIEMPRE de los movimientos: lo que entró a una bodega menos lo que salió de ella.
 * Devuelve [{ material_id, bodega_id, cantidad }].
 */
async function stockDerivado(db, materialId) {
  const filtro = materialId ? Prisma.sql`AND material_id = ${materialId}` : Prisma.empty;
  const filas = await db.$queryRaw`
    SELECT material_id, bodega_id, SUM(delta) AS cantidad FROM (
      SELECT material_id, bodega_destino_id AS bodega_id, cantidad AS delta
        FROM movimientos WHERE bodega_destino_id IS NOT NULL ${filtro}
      UNION ALL
      SELECT material_id, bodega_origen_id AS bodega_id, -cantidad AS delta
        FROM movimientos WHERE bodega_origen_id IS NOT NULL ${filtro}
    ) t
    GROUP BY material_id, bodega_id`;
  return filas.map((f) => ({ material_id: f.material_id, bodega_id: f.bodega_id, cantidad: Number(f.cantidad) }));
}

async function stockTotalPorMaterial(db) {
  const totales = new Map();
  for (const f of await stockDerivado(db)) totales.set(f.material_id, (totales.get(f.material_id) || 0) + f.cantidad);
  return totales;
}

module.exports = { stockDerivado, stockTotalPorMaterial };
