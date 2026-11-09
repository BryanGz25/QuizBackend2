const { prisma } = require('../config/database');

/** Compara contratos vigentes y últimas compras; recomienda el menor precio. A igual precio gana el contrato. */
async function sugerirProveedor(materialId, fecha = new Date()) {
  const [contratos, compras] = await Promise.all([
    prisma.contratos_precio.findMany({
      where: { material_id: materialId, vigente_desde: { lte: fecha }, OR: [{ vigente_hasta: null }, { vigente_hasta: { gte: fecha } }] },
      include: { proveedor: true },
    }),
    prisma.detalle_orden_compra.findMany({
      where: { material_id: materialId, orden: { estado: { notIn: ['RECHAZADA', 'ANULADA'] } } },
      include: { orden: { include: { proveedor: true } } },
      orderBy: { orden: { fecha_emision: 'desc' } },
    }),
  ]);

  const opciones = contratos.filter((c) => c.proveedor.activo).map((c) => ({ proveedorId: c.proveedor_id, proveedor: c.proveedor.nombre, precio: Number(c.precio), origen: 'CONTRATO' }));
  const vistos = new Set();
  for (const d of compras) {
    if (vistos.has(d.orden.proveedor_id) || !d.orden.proveedor.activo) continue;
    vistos.add(d.orden.proveedor_id);
    opciones.push({ proveedorId: d.orden.proveedor_id, proveedor: d.orden.proveedor.nombre, precio: Number(d.precio_unitario), origen: `ULTIMA_COMPRA ${d.orden.numero}` });
  }

  const peso = (o) => (o.origen === 'CONTRATO' ? 0 : 1);
  opciones.sort((a, b) => a.precio - b.precio || peso(a) - peso(b));
  return { recomendado: opciones[0] ?? null, opciones };
}

module.exports = { sugerirProveedor };
