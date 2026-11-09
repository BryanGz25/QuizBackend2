const redondear = (n, decimales = 3) => {
  const f = 10 ** decimales;
  return Math.round((Number(n) + Number.EPSILON) * f) / f;
};

const colones = (n) => `₡${Number(n).toLocaleString('es-CR', { maximumFractionDigits: 2 })}`;

module.exports = { redondear, colones };
