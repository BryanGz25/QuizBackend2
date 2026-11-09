const { redondear } = require('../utils/decimal');
const { leerParametros } = require('./parametros.service');
const { leerMatriz, tramoDeMatriz } = require('./aprobaciones.service');

const sumarPorCategoria = (acumulado, categoriaId, monto, numero) => {
  const c = acumulado.get(categoriaId) ?? { monto: 0, documentos: new Set() };
  c.monto += monto;
  if (numero) c.documentos.add(numero);
  acumulado.set(categoriaId, c);
};

/**
 * Regla anti-fraccionamiento: acumula las solicitudes de la misma área y categoría
 * (y del mismo proveedor, si se indicó) dentro de la ventana configurada.
 * Si el acumulado exige un nivel de aprobación más alto, se marca y se aprueba por el acumulado.
 */
async function evaluar(db, { areaId, proveedorId, lineas, montoTotal }) {
  const { FRACC_VENTANA_DIAS: dias } = await leerParametros(db, ['FRACC_VENTANA_DIAS']);
  const desde = new Date(Date.now() - dias * 86400000);
  const incluirMaterial = { detalle: { include: { material: true } } };

  const [requisiciones, ordenes, materiales, matriz] = await Promise.all([
    db.requisiciones.findMany({
      where: { area_id: areaId, creado_en: { gte: desde }, estado: { in: ['PENDIENTE', 'APROBADA', 'CONVERTIDA'] }, ...(proveedorId ? { proveedor_sugerido_id: proveedorId } : {}) },
      include: incluirMaterial,
    }),
    db.ordenes_compra.findMany({
      where: { area_id: areaId, requisicion_id: null, fecha_emision: { gte: desde }, estado: { notIn: ['RECHAZADA', 'ANULADA'] }, ...(proveedorId ? { proveedor_id: proveedorId } : {}) },
      include: incluirMaterial,
    }),
    db.materiales.findMany({ where: { id: { in: lineas.map((l) => l.materialId) } }, include: { categoria: true } }),
    leerMatriz(db),
  ]);

  const acumulado = new Map();
  for (const l of lineas) {
    sumarPorCategoria(acumulado, materiales.find((m) => m.id === l.materialId).categoria_id, l.cantidad * l.precio);
  }
  for (const r of requisiciones) for (const d of r.detalle) sumarPorCategoria(acumulado, d.material.categoria_id, Number(d.cantidad) * Number(d.precio_estimado), r.numero);
  for (const o of ordenes) for (const d of o.detalle) sumarPorCategoria(acumulado, d.material.categoria_id, Number(d.cantidad) * Number(d.precio_unitario), o.numero);

  // Solo cuentan las categorías que esta solicitud toca y que tienen documentos previos.
  const categoriasActuales = new Set(materiales.map((m) => m.categoria_id));
  const candidatas = [...acumulado.entries()].filter(([id, c]) => categoriasActuales.has(id) && c.documentos.size > 0);
  const mayor = candidatas.sort((a, b) => b[1].monto - a[1].monto)[0];

  const propio = tramoDeMatriz(matriz, montoTotal);
  if (!mayor) return { sospechoso: false, montoEvaluado: montoTotal, detalle: null };

  const montoAcumulado = redondear(mayor[1].monto, 2);
  const tramoAcumulado = tramoDeMatriz(matriz, Math.max(montoAcumulado, montoTotal));
  if (tramoAcumulado.orden <= propio.orden) return { sospechoso: false, montoEvaluado: montoTotal, detalle: null };

  const documentos = [...mayor[1].documentos];
  return {
    sospechoso: true,
    montoEvaluado: montoAcumulado,
    detalle: {
      montoAcumulado,
      ventanaDias: dias,
      documentos,
      aprobadorIndividual: propio.rol.nombre,
      aprobadorAcumulado: tramoAcumulado.rol.nombre,
      mensaje: `Junto con ${documentos.join(', ')} acumula ${montoAcumulado} en ${dias} días. Se aprueba por el acumulado: ${tramoAcumulado.rol.nombre}.`,
    },
  };
}

module.exports = { evaluar };
