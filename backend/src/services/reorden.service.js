const { redondear } = require('../utils/decimal');

/** SS = (demanda máxima − demanda promedio) × L · PR = d × L + SS (fórmulas del documento, A5). */
function calcularNiveles({ demandaPromedio, demandaMaxima, tiempoEntrega }) {
  const d = Number(demandaPromedio);
  const dMax = Number(demandaMaxima);
  const L = Number(tiempoEntrega);
  const stockSeguridad = redondear((dMax - d) * L);
  return { stockSeguridad, puntoReorden: redondear(d * L + stockSeguridad) };
}

const requiereReposicion = (stock, puntoReorden) => Number(stock) <= Number(puntoReorden);

/**
 * CRITICA: con demanda normal se agota antes de que llegue el pedido.
 * ALTA:    se agotaría antes de que llegue si la demanda llega a su máximo.
 * MEDIA:   alcanzó el punto de reorden, pero cubre el tiempo de entrega aun con demanda máxima.
 */
function calcularPrioridad({ stock, demandaPromedio, demandaMaxima, tiempoEntrega }) {
  const L = Number(tiempoEntrega);
  if (Number(stock) <= 0 || Number(stock) / Number(demandaPromedio) < L) return 'CRITICA';
  if (Number(stock) / Number(demandaMaxima) < L) return 'ALTA';
  return 'MEDIA';
}

function nivelesDeMaterial(m) {
  if (m.demanda_promedio_dia == null || m.demanda_maxima_dia == null || m.tiempo_entrega_dias == null) return null;
  return calcularNiveles({ demandaPromedio: m.demanda_promedio_dia, demandaMaxima: m.demanda_maxima_dia, tiempoEntrega: m.tiempo_entrega_dias });
}

module.exports = { calcularNiveles, calcularPrioridad, requiereReposicion, nivelesDeMaterial };
