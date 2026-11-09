const { prisma, reiniciarBase, sesion, material, bodega, clave, cerrar } = require('./helpers/base');

let admin, almacen, auditor, cemento, arena, central, robles;

const salida = (cantidad, extra = {}) => ({
  tipo: 'SALIDA', materialId: cemento.id, cantidad, origenId: central.id, documentoTipo: 'VALE_SALIDA', documentoNumero: 'VS-1', claveIdempotencia: clave(), ...extra,
});

const stock = async (id = cemento.id) => (await admin.get(`/api/materiales/${id}/stock`).expect(200)).body;

beforeEach(async () => {
  await reiniciarBase();
  [admin, almacen, auditor] = await Promise.all([sesion('admin'), sesion('bodega'), sesion('auditor')]);
  cemento = await material('MAT-CEM-GRIS50');
  arena = await material('MAT-CEM-ARENA');
  central = await bodega('BOD-CENTRAL');
  robles = await bodega('BOD-ROBLES');
});
afterAll(cerrar);

describe('materiales', () => {
  const nuevo = (categoriaId) => ({ codigo: 'MAT-X-1', nombre: 'Material de prueba', unidad: 'kg', categoriaId, stockMinimo: 5, stockMaximo: 50, demandaPromedioDia: 2, demandaMaximaDia: 4, tiempoEntregaDias: 3 });

  test('registra un material y calcula su punto de reorden sin digitarlo', async () => {
    const creado = (await admin.post('/api/materiales', nuevo(cemento.categoria_id)).expect(201)).body;
    const s = (await admin.get(`/api/materiales/${creado.id}/stock`).expect(200)).body;
    expect(s).toMatchObject({ stockActual: 0, stockSeguridad: 6, puntoReorden: 12, estado: 'REPONER' });
  });

  test('rechaza que se digite el stock o el punto de reorden', async () => {
    await admin.post('/api/materiales', { ...nuevo(cemento.categoria_id), puntoReorden: 99 }).expect(400);
    await admin.patch(`/api/materiales/${cemento.id}`, { stock_actual: 9999 }).expect(400);
  });

  test('rechaza demanda máxima menor que la promedio', async () => {
    await admin.post('/api/materiales', { ...nuevo(cemento.categoria_id), demandaMaximaDia: 1 }).expect(400);
  });

  test('un rol sin permiso no registra materiales y una sesión ausente recibe 401', async () => {
    await auditor.post('/api/materiales', nuevo(cemento.categoria_id)).expect(403);
    const request = require('supertest');
    await request(require('../src/app')).get('/api/materiales').expect(401);
  });
});

describe('movimientos', () => {
  test('una entrada aumenta el stock derivado de movimientos', async () => {
    await admin.post('/api/movimientos', { tipo: 'ENTRADA', materialId: cemento.id, cantidad: 10, destinoId: central.id, documentoTipo: 'CARGA_INICIAL', documentoNumero: 'CI-1', claveIdempotencia: clave() }).expect(201);
    expect((await stock()).stockActual).toBe(200);
  });

  test('una salida reduce el stock', async () => {
    await almacen.post('/api/movimientos', salida(20)).expect(201);
    expect((await stock()).stockActual).toBe(170);
  });

  test('rechaza una salida superior al stock y no deja rastro', async () => {
    const antes = await prisma.movimientos.count();
    const r = await almacen.post('/api/movimientos', salida(191)).expect(409);
    expect(r.body).toMatchObject({ codigo: 'STOCK_INSUFICIENTE', detalles: { disponible: 190, solicitado: 191 } });
    expect(await prisma.movimientos.count()).toBe(antes);
  });

  test('caso límite: permite retirar exactamente todo el stock', async () => {
    await almacen.post('/api/movimientos', salida(190)).expect(201);
    expect((await stock()).stockActual).toBe(0);
  });

  test('dos salidas simultáneas no pueden consumir el mismo stock', async () => {
    const respuestas = await Promise.all([almacen.post('/api/movimientos', salida(150)), almacen.post('/api/movimientos', salida(150))]);
    expect(respuestas.map((r) => r.status).sort()).toEqual([201, 409]);
    expect((await stock()).stockActual).toBe(40);
  });

  test('un traslado mueve stock sin cambiar el total', async () => {
    await almacen.post('/api/movimientos', { tipo: 'TRASLADO', materialId: cemento.id, cantidad: 30, origenId: central.id, destinoId: robles.id, documentoTipo: 'BOLETA_TRASLADO', documentoNumero: 'BT-1', claveIdempotencia: clave() }).expect(201);
    const s = await stock();
    expect(s.stockActual).toBe(190);
    expect(s.porBodega.find((b) => b.bodegaId === central.id).cantidad).toBe(160);
    expect(s.porBodega.find((b) => b.bodegaId === robles.id).cantidad).toBe(30);
  });

  test('rechaza trasladar una cantidad inexistente', async () => {
    await almacen.post('/api/movimientos', { tipo: 'TRASLADO', materialId: cemento.id, cantidad: 1, origenId: robles.id, destinoId: central.id, documentoTipo: 'BOLETA_TRASLADO', documentoNumero: 'BT-2', claveIdempotencia: clave() }).expect(409);
  });

  test('rechaza un traslado hacia la misma bodega', async () => {
    await almacen.post('/api/movimientos', { tipo: 'TRASLADO', materialId: cemento.id, cantidad: 1, origenId: central.id, destinoId: central.id, documentoTipo: 'BOLETA_TRASLADO', documentoNumero: 'BT-3', claveIdempotencia: clave() }).expect(400);
  });

  test.each([
    ['sin material', { materialId: undefined }],
    ['sin ubicación', { origenId: undefined }],
    ['con cantidad cero', { cantidad: 0 }],
    ['con cantidad negativa', { cantidad: -5 }],
    ['sin documento', { documentoNumero: '' }],
  ])('rechaza un movimiento %s', async (_n, cambio) => {
    await almacen.post('/api/movimientos', salida(1, cambio)).expect(400);
  });

  test('previene la duplicación accidental con la misma clave', async () => {
    const cuerpo = salida(5);
    await almacen.post('/api/movimientos', cuerpo).expect(201);
    const repetido = await almacen.post('/api/movimientos', cuerpo).expect(200);
    expect(repetido.body.repetido).toBe(true);
    expect((await stock()).stockActual).toBe(185);
  });

  test('dos envíos simultáneos con la misma clave registran un solo movimiento', async () => {
    const cuerpo = salida(5);
    const r = await Promise.all([almacen.post('/api/movimientos', cuerpo), almacen.post('/api/movimientos', cuerpo)]);
    expect(r.map((x) => x.status).sort()).toEqual([200, 201]);
    expect((await stock()).stockActual).toBe(185);
  });

  test('rechaza reutilizar la clave para una operación distinta', async () => {
    const cuerpo = salida(5);
    await almacen.post('/api/movimientos', cuerpo).expect(201);
    await almacen.post('/api/movimientos', { ...cuerpo, cantidad: 6 }).expect(409);
  });

  test('un ajuste exige justificación y un rol autorizado', async () => {
    const ajuste = { tipo: 'AJUSTE', materialId: cemento.id, cantidad: 2, origenId: central.id, documentoTipo: 'ACTA_AJUSTE', documentoNumero: 'AA-1', claveIdempotencia: clave() };
    await admin.post('/api/movimientos', ajuste).expect(400);
    const justificado = { ...ajuste, observaciones: 'Sacos dañados por humedad en la bodega.' };
    await almacen.post('/api/movimientos', justificado).expect(403);
    await admin.post('/api/movimientos', justificado).expect(201);
    expect((await stock()).stockActual).toBe(188);
  });

  test('el historial es inmutable y el saldo concilia con los movimientos', async () => {
    await almacen.post('/api/movimientos', salida(7)).expect(201);
    await expect(prisma.movimientos.deleteMany({})).rejects.toThrow('no se puede modificar');
    await expect(prisma.auditoria.updateMany({ data: { accion: 'X' } })).rejects.toThrow('no se puede modificar');
    const c = (await admin.get('/api/reportes/conciliacion').expect(200)).body;
    expect(c).toMatchObject({ consistente: true, diferencias: [] });
  });

  test('la base de datos rechaza por sí sola un saldo negativo', async () => {
    await expect(prisma.$executeRawUnsafe(`UPDATE inventario SET cantidad = -1 WHERE material_id = ${cemento.id} AND bodega_id = ${central.id}`)).rejects.toThrow();
  });
});

describe('alertas de reorden', () => {
  test('una salida que alcanza el punto de reorden genera la alerta', async () => {
    const r = await almacen.post('/api/movimientos', salida(25)).expect(201);
    expect(r.body.alerta).toMatchObject({ stock_actual: 165, punto_reorden: 165, faltante: 0, estado: 'PENDIENTE' });
  });

  test('caso límite: una unidad por encima del punto de reorden no alerta', async () => {
    const r = await almacen.post('/api/movimientos', salida(24)).expect(201);
    expect(r.body.alerta).toBeNull();
  });

  test('no repite alertas y actualiza la que ya existe', async () => {
    await almacen.post('/api/movimientos', salida(30)).expect(201);
    await almacen.post('/api/movimientos', salida(10)).expect(201);
    const activas = await prisma.alertas.findMany({ where: { material_id: cemento.id, clave_activa: { not: null } } });
    expect(activas).toHaveLength(1);
    expect(Number(activas[0].stock_actual)).toBe(150);
    expect(Number(activas[0].faltante)).toBe(15);
  });

  test('se cierra sola cuando el stock se recupera', async () => {
    await admin.post('/api/movimientos', { tipo: 'ENTRADA', materialId: arena.id, cantidad: 10, destinoId: central.id, documentoTipo: 'CARGA_INICIAL', documentoNumero: 'CI-2', claveIdempotencia: clave() }).expect(201);
    const cerradas = (await admin.get('/api/alertas?estado=CERRADA').expect(200)).body;
    expect(cerradas.map((a) => a.material.id)).toContain(arena.id);
  });

  test('genera una requisición con el proveedor de menor precio', async () => {
    await almacen.post('/api/movimientos', salida(30)).expect(201);
    const alerta = await prisma.alertas.findFirst({ where: { material_id: cemento.id, clave_activa: { not: null } } });
    const r = (await almacen.post(`/api/alertas/${alerta.id}/generar-requisicion`).expect(201)).body;
    expect(r.sugerencia.recomendado).toMatchObject({ proveedor: 'Proveedor A', precio: 6300, origen: 'CONTRATO' });
    expect(r.requisicion.detalle[0]).toMatchObject({ cantidad: 285, precio_estimado: 6300 });
    await almacen.post(`/api/alertas/${alerta.id}/generar-requisicion`).expect(409);
  });

  test('quien no pertenece a un área genera la requisición a nombre de Bodega Central', async () => {
    const alerta = await prisma.alertas.findFirst({ where: { material_id: arena.id, clave_activa: { not: null } } });
    const r = (await admin.post(`/api/alertas/${alerta.id}/generar-requisicion`, { precioEstimado: 15000 }).expect(201)).body;
    expect(r.requisicion.area.nombre).toBe('Bodega Central');
  });

  test('sin contrato ni historial exige un precio estimado', async () => {
    const alerta = await prisma.alertas.findFirst({ where: { material_id: arena.id, clave_activa: { not: null } } });
    await almacen.post(`/api/alertas/${alerta.id}/generar-requisicion`).expect(422);
    await almacen.post(`/api/alertas/${alerta.id}/generar-requisicion`, { precioEstimado: 15000 }).expect(201);
  });
});

describe('trazabilidad', () => {
  test('cada entrada conoce su orden, proveedor y recepción, y lista los movimientos posteriores', async () => {
    await almacen.post('/api/movimientos', salida(12)).expect(201);
    const { body } = await admin.get(`/api/materiales/${cemento.id}/trazabilidad`).expect(200);
    expect(body.tipoTrazabilidad).toBe('DOCUMENTAL');
    expect(body.entradas).toHaveLength(4);
    expect(body.entradas[0]).toMatchObject({ ordenCompra: 'OC-1041', proveedor: 'Proveedor A', recepcion: 'REC-S1041', destino: 'Bodega Central', usuario: 'Bernardo Bodeguero' });
    expect(body.movimientosPosteriores.map((m) => m.tipo)).toEqual(['SALIDA', 'SALIDA']);
    expect(body.saldoActual).toBe(178);
  });

  test('un traslado no altera el saldo consolidado del historial', async () => {
    await almacen.post('/api/movimientos', { tipo: 'TRASLADO', materialId: cemento.id, cantidad: 30, origenId: central.id, destinoId: robles.id, documentoTipo: 'BOLETA_TRASLADO', documentoNumero: 'BT-4', claveIdempotencia: clave() }).expect(201);
    const { body } = await admin.get(`/api/materiales/${cemento.id}/trazabilidad`).expect(200);
    expect(body.saldoActual).toBe(190);
  });
});
