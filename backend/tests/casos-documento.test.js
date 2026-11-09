// Comprueba que el sistema reproduce las cifras de los ejercicios del documento.
const { reiniciarBase, sesion, cerrar } = require('./helpers/base');
const { calcularNiveles, calcularPrioridad } = require('../src/services/reorden.service');

let admin;
beforeAll(async () => {
  await reiniciarBase();
  admin = await sesion('admin');
});
afterAll(cerrar);

describe('A5: niveles de stock', () => {
  test.each([
    ['cemento', 40, 55, 3, 45, 165],
    ['varilla', 120, 160, 5, 200, 800],
    ['block', 600, 900, 4, 1200, 3600],
    ['arena', 6, 10, 2, 8, 20],
  ])('%s', (_n, d, max, L, ss, pr) => {
    expect(calcularNiveles({ demandaPromedio: d, demandaMaxima: max, tiempoEntrega: L })).toEqual({ stockSeguridad: ss, puntoReorden: pr });
  });

  test('sin variación de demanda el stock de seguridad es cero', () => {
    expect(calcularNiveles({ demandaPromedio: 10, demandaMaxima: 10, tiempoEntrega: 5 })).toEqual({ stockSeguridad: 0, puntoReorden: 50 });
  });

  test('prioridad según cobertura frente al tiempo de entrega', () => {
    expect(calcularPrioridad({ stock: 0, demandaPromedio: 6, demandaMaxima: 10, tiempoEntrega: 2 })).toBe('CRITICA');
    expect(calcularPrioridad({ stock: 14, demandaPromedio: 6, demandaMaxima: 10, tiempoEntrega: 2 })).toBe('ALTA');
    expect(calcularPrioridad({ stock: 25, demandaPromedio: 6, demandaMaxima: 10, tiempoEntrega: 2 })).toBe('MEDIA');
  });

  test('la base reproduce el stock original y deriva el estado', async () => {
    const { body } = await admin.get('/api/reportes/inventario').expect(200);
    const fila = (c) => body.materiales.find((m) => m.codigo === c);
    expect(fila('MAT-CEM-GRIS50')).toMatchObject({ stock_actual: 190, punto_reorden: 165, diferencia: 25, estado: 'OK' });
    expect(fila('MAT-ACE-VAR3G40')).toMatchObject({ stock_actual: 850, punto_reorden: 800, diferencia: 50, estado: 'OK' });
    expect(fila('MAT-MAM-BLK122040')).toMatchObject({ stock_actual: 2800, punto_reorden: 3600, diferencia: -800, estado: 'REPONER' });
    expect(fila('MAT-CEM-ARENA')).toMatchObject({ stock_actual: 14, punto_reorden: 20, diferencia: -6, estado: 'REPONER' });
  });

  test('solo Block y Arena están en alerta, con la Arena primero', async () => {
    const { body } = await admin.get('/api/alertas/reorden').expect(200);
    expect(body.map((a) => a.material.codigo)).toEqual(['MAT-CEM-ARENA', 'MAT-MAM-BLK122040']);
  });
});

describe('A2: consolidación', () => {
  test('ahorro al menor precio observado', async () => {
    const { body } = await admin.get('/api/reportes/consolidacion').expect(200);
    const cemento = body.insumos.find((i) => i.codigo === 'MAT-CEM-GRIS50');
    const varilla = body.insumos.find((i) => i.codigo === 'MAT-ACE-VAR3G40');
    expect(cemento).toMatchObject({ cantidad: 540, precioMinimo: 6300, costoOriginal: 3464000, costoConsolidado: 3402000, ahorro: 62000, porcentaje: 1.79 });
    expect(varilla).toMatchObject({ cantidad: 560, precioMinimo: 2150, costoOriginal: 1231000, costoConsolidado: 1204000, ahorro: 27000, porcentaje: 2.19, requiereValidacion: true });
    expect(body.ahorroTotal).toBe(89000);
    expect(body.ahorroSoloValidados).toBe(62000);
    expect(body.lineasSinEquivalente).toHaveLength(3);
  });
});

describe('A3: fuga de valor', () => {
  let r;
  beforeAll(async () => {
    r = (await admin.get('/api/reportes/fuga-valor?mes=2026-10').expect(200)).body;
  });

  test('sobreprecio por orden', () => {
    const porOrden = Object.fromEntries(r.lineas.map((l) => [l.numero, l.sobreprecioTotal]));
    expect(porOrden).toEqual({ 'OC-1041': 30000, 'OC-1042': 30000, 'OC-1047': 32000, 'OC-1050': 50000, 'OC-1053': 48000, 'OC-1058': 33000, 'OC-1061': 0 });
  });

  test('gasto fuera de contrato según la definición del documento', () => {
    expect(r.gasto).toBe(7017000);
    expect(r.gastoFueraContrato).toBe(5127000);
    expect(r.porcentajeFueraContrato).toBe(73.1);
    const clases = Object.fromEntries(r.lineas.map((l) => [l.numero, l.clasificacion]));
    expect(clases['OC-1041']).toBe('FUERA_CONTRATO_PRECIO');
    expect(clases['OC-1047']).toBe('FUERA_CONTRATO_PROVEEDOR');
    expect(clases['OC-1061']).toBe('CONFORME');
  });

  test('escenarios sin doble conteo', () => {
    expect(r.escenarios.map((e) => [e.mensual, e.anual])).toEqual([
      [223000, 2676000],
      [1483000, 17796000],
      [2467000, 29604000],
    ]);
  });
});
