const { prisma, reiniciarBase, sesion, material, bodega, area, proveedor, clave, cerrar } = require('./helpers/base');

let u, cemento, varilla, central;

const requisicion = (cantidad, precioEstimado, extra = {}) => ({
  justificacion: 'Reposición para la obra', cotizaciones: 3, lineas: [{ materialId: cemento.id, cantidad, precioEstimado }], ...extra,
});

const crearReq = async (cuerpo, quien = u.solicitante) => (await quien.post('/api/requisiciones', cuerpo).expect(201)).body;

beforeEach(async () => {
  await reiniciarBase();
  const nombres = { admin: 'admin', solicitante: 'solicitante.obras', jefeObras: 'jefe.obras', jefeMant: 'jefe.mantenimiento', comprador: 'comprador', compras: 'jefe.compras', finanzas: 'finanzas', gerencia: 'gerencia', comite: 'comite', almacen: 'bodega', auditor: 'auditor' };
  u = Object.fromEntries(await Promise.all(Object.entries(nombres).map(async ([k, v]) => [k, await sesion(v)])));
  cemento = await material('MAT-CEM-GRIS50');
  varilla = await material('MAT-ACE-VAR3G40');
  central = await bodega('BOD-CENTRAL');
});
afterAll(cerrar);

describe('matriz de aprobación', () => {
  test.each([
    ['hasta 250 000', 250000, ['Jefatura del área solicitante'], 1],
    ['un colón sobre el primer umbral', 250001, ['Jefatura de Compras'], 2],
    ['hasta 2 000 000', 2000000, ['Jefatura de Compras'], 2],
    ['sobre 2 000 000', 2000001, ['Gerencia Financiera'], 3],
    ['hasta 10 000 000', 10000000, ['Gerencia Financiera'], 3],
    ['sobre 10 000 000', 10000001, ['Comité de compras', 'Gerencia General'], 3],
  ])('%s', async (_n, monto, roles, cotizaciones) => {
    const r = await crearReq(requisicion(1, monto));
    expect(r.aprobaciones.map((a) => a.rol.nombre)).toEqual(roles);
    expect(r.cotizaciones_requeridas).toBe(cotizaciones);
  });

  test('la jefatura del área aprueba un monto bajo', async () => {
    const r = await crearReq(requisicion(1, 1000));
    const d = await u.jefeObras.post(`/api/requisiciones/${r.id}/aprobar`, { comentario: 'Correcto' }).expect(200);
    expect(d.body.documento.estado).toBe('APROBADA');
    const paso = await prisma.aprobaciones.findFirst({ where: { requisicion_id: r.id } });
    expect(paso).toMatchObject({ estado: 'APROBADA', comentario: 'Correcto' });
    expect(paso.usuario_id).toBe(u.jefeObras.usuario.id);
    expect(paso.fecha_decision).not.toBeNull();
  });

  test('rechaza a un usuario no autorizado por monto', async () => {
    const r = await crearReq(requisicion(1, 5000000));
    const d = await u.compras.post(`/api/requisiciones/${r.id}/aprobar`).expect(403);
    expect(d.body.codigo).toBe('APROBADOR_NO_AUTORIZADO');
    expect((await u.admin.get(`/api/requisiciones/${r.id}`).expect(200)).body.estado).toBe('PENDIENTE');
  });

  test('la jefatura de otra área no puede aprobar', async () => {
    const r = await crearReq(requisicion(1, 1000));
    await u.jefeMant.post(`/api/requisiciones/${r.id}/aprobar`).expect(403);
  });

  test('administración no sustituye a un aprobador', async () => {
    const r = await crearReq(requisicion(1, 1000));
    await u.admin.post(`/api/requisiciones/${r.id}/aprobar`).expect(403);
  });

  test('quien solicita no se aprueba: el paso sube al tramo siguiente', async () => {
    const r = await crearReq(requisicion(1, 1000), u.jefeObras);
    expect(r.aprobaciones.map((a) => a.rol.nombre)).toEqual(['Jefatura de Compras']);
  });

  test('sobre 10 millones exige comité y luego gerencia, en ese orden', async () => {
    const r = await crearReq(requisicion(1, 10000001));
    await u.gerencia.post(`/api/requisiciones/${r.id}/aprobar`).expect(403);
    const primero = await u.comite.post(`/api/requisiciones/${r.id}/aprobar`).expect(200);
    expect(primero.body.documento.estado).toBe('PENDIENTE');
    const segundo = await u.gerencia.post(`/api/requisiciones/${r.id}/aprobar`).expect(200);
    expect(segundo.body.documento.estado).toBe('APROBADA');
  });

  test('no se aprueba con menos cotizaciones de las requeridas', async () => {
    const r = await crearReq(requisicion(1, 5000000, { cotizaciones: 2 }));
    const d = await u.finanzas.post(`/api/requisiciones/${r.id}/aprobar`).expect(409);
    expect(d.body.codigo).toBe('COTIZACIONES_INSUFICIENTES');
  });

  test('un rechazo exige motivo, omite los pasos restantes y cierra el documento', async () => {
    const r = await crearReq(requisicion(1, 10000001));
    await u.comite.post(`/api/requisiciones/${r.id}/rechazar`, {}).expect(400);
    await u.comite.post(`/api/requisiciones/${r.id}/rechazar`, { comentario: 'Sin presupuesto' }).expect(200);
    const final = (await u.admin.get(`/api/requisiciones/${r.id}`).expect(200)).body;
    expect(final.estado).toBe('RECHAZADA');
    expect(final.aprobaciones.map((a) => a.estado)).toEqual(['RECHAZADA', 'OMITIDA']);
    await u.gerencia.post(`/api/requisiciones/${r.id}/aprobar`).expect(409);
  });

  test('un cambio en la matriz surte efecto sin tocar el código', async () => {
    const tramo = await prisma.matriz_aprobacion.findUnique({ where: { orden: 1 } });
    await u.admin.put(`/api/configuracion/matriz/${tramo.id}`, { montoHasta: 500000 }).expect(200);
    const r = await crearReq(requisicion(1, 400000));
    expect(r.aprobaciones[0].rol.nombre).toBe('Jefatura del área solicitante');
  });

  test('toda decisión queda auditada', async () => {
    const r = await crearReq(requisicion(1, 1000));
    await u.jefeObras.post(`/api/requisiciones/${r.id}/aprobar`).expect(200);
    const log = (await u.auditor.get('/api/configuracion/auditoria?entidad=requisiciones').expect(200)).body;
    expect(log.map((a) => a.accion)).toEqual(expect.arrayContaining(['CREAR', 'DECISION_APROBADA']));
  });
});

describe('fraccionamiento', () => {
  test('dos solicitudes que juntas cruzan un umbral escalan la segunda', async () => {
    const provA = await proveedor('A');
    const a = await crearReq(requisicion(1, 1500000, { proveedorSugeridoId: provA.id }));
    expect(a.fraccionamiento_sospechoso).toBe(false);
    const b = await crearReq(requisicion(1, 1500000, { proveedorSugeridoId: provA.id }));
    expect(b).toMatchObject({ fraccionamiento_sospechoso: true, monto_evaluado: 3000000 });
    expect(b.aprobaciones[0].rol.nombre).toBe('Gerencia Financiera');
    expect(b.fraccionamiento_detalle.documentos).toEqual([a.numero]);
  });

  test('otra categoría u otra área no acumulan', async () => {
    await crearReq(requisicion(1, 1500000));
    const otraCategoria = await crearReq({ justificacion: 'Acero para columnas', cotizaciones: 3, lineas: [{ materialId: varilla.id, cantidad: 1, precioEstimado: 1500000 }] });
    expect(otraCategoria.fraccionamiento_sospechoso).toBe(false);
    const mant = await area('Mantenimiento');
    const otraArea = await crearReq(requisicion(1, 1500000, { areaId: mant.id }), u.compras);
    expect(otraArea.fraccionamiento_sospechoso).toBe(false);
  });

  test('una solicitud rechazada ya no acumula', async () => {
    const a = await crearReq(requisicion(1, 1500000));
    await u.compras.post(`/api/requisiciones/${a.id}/rechazar`, { comentario: 'No procede' }).expect(200);
    const b = await crearReq(requisicion(1, 1500000));
    expect(b.fraccionamiento_sospechoso).toBe(false);
  });

  test('la ventana es configurable', async () => {
    await crearReq(requisicion(1, 1500000));
    await u.admin.put('/api/configuracion/parametros/FRACC_VENTANA_DIAS', { valor: 0 }).expect(200);
    const b = await crearReq(requisicion(1, 1500000));
    expect(b.fraccionamiento_sospechoso).toBe(false);
  });
});

describe('órdenes de compra y recepción', () => {
  const orden = async (provLetra = 'A', cantidad = 10, precioUnitario = 6300, extra = {}) => {
    const p = await proveedor(provLetra);
    return { proveedorId: p.id, cotizaciones: 3, lineas: [{ materialId: cemento.id, cantidad, precioUnitario }], ...extra };
  };

  test('una orden directa queda pendiente hasta que la apruebe el rol correcto', async () => {
    const obras = await area('Obras');
    const creada = (await u.comprador.post('/api/ordenes', await orden('A', 100, 6300, { areaId: obras.id })).expect(201)).body.orden;
    expect(creada.estado).toBe('PENDIENTE_APROBACION');
    await u.almacen.post('/api/recepciones', { ordenCompraId: creada.id, bodegaId: central.id, claveIdempotencia: clave(), lineas: [{ materialId: cemento.id, cantidad: 1 }] }).expect(409);
    await u.finanzas.post(`/api/ordenes/${creada.id}/aprobar`).expect(403);
    const d = await u.compras.post(`/api/ordenes/${creada.id}/aprobar`).expect(200);
    expect(d.body.documento.estado).toBe('EMITIDA');
  });

  test('quien crea la orden no puede aprobarla', async () => {
    const obras = await area('Obras');
    const creada = (await u.compras.post('/api/ordenes', await orden('A', 100, 6300, { areaId: obras.id })).expect(201)).body.orden;
    // Al ser su propio rol, el paso sube a Gerencia Financiera.
    expect(creada.aprobaciones[0].rol.nombre).toBe('Gerencia Financiera');
    await u.compras.post(`/api/ordenes/${creada.id}/aprobar`).expect(403);
  });

  test('flujo completo: requisición, aprobación, orden, recepción y stock', async () => {
    const provA = await proveedor('A');
    const r = await crearReq(requisicion(10, 6300, { proveedorSugeridoId: provA.id }));
    const prematura = await u.comprador.post('/api/ordenes', await orden('A', 10, 6300, { requisicionId: r.id }));
    expect(prematura.status).toBe(409);
    expect(prematura.body.codigo).toBe('REQUISICION_NO_APROBADA');

    await u.jefeObras.post(`/api/requisiciones/${r.id}/aprobar`).expect(200);
    const creada = (await u.comprador.post('/api/ordenes', await orden('A', 10, 6300, { requisicionId: r.id })).expect(201)).body.orden;
    expect(creada).toMatchObject({ estado: 'EMITIDA', numero: `OC-${creada.id}` });
    expect(creada.id).toBeGreaterThan(1061);

    await u.almacen.post('/api/recepciones', { ordenCompraId: creada.id, bodegaId: central.id, claveIdempotencia: clave(), lineas: [{ materialId: cemento.id, cantidad: 4 }] }).expect(201);
    expect((await u.admin.get(`/api/ordenes/${creada.id}`).expect(200)).body.estado).toBe('RECIBIDA_PARCIAL');

    const exceso = await u.almacen.post('/api/recepciones', { ordenCompraId: creada.id, bodegaId: central.id, claveIdempotencia: clave(), lineas: [{ materialId: cemento.id, cantidad: 7 }] }).expect(409);
    expect(exceso.body).toMatchObject({ codigo: 'RECEPCION_EXCEDE_ORDEN', detalles: { pendiente: 6 } });

    await u.almacen.post('/api/recepciones', { ordenCompraId: creada.id, bodegaId: central.id, claveIdempotencia: clave(), lineas: [{ materialId: cemento.id, cantidad: 6 }] }).expect(201);
    expect((await u.admin.get(`/api/ordenes/${creada.id}`).expect(200)).body.estado).toBe('RECIBIDA');
    expect((await u.admin.get(`/api/materiales/${cemento.id}/stock`).expect(200)).body.stockActual).toBe(200);
  });

  test('una entrada por movimiento ligada a OC también valida lo pendiente', async () => {
    const provA = await proveedor('A');
    const r = await crearReq(requisicion(10, 6300, { proveedorSugeridoId: provA.id }));
    await u.jefeObras.post(`/api/requisiciones/${r.id}/aprobar`).expect(200);
    const o = (await u.comprador.post('/api/ordenes', await orden('A', 10, 6300, { requisicionId: r.id })).expect(201)).body.orden;
    const base = { tipo: 'ENTRADA', materialId: cemento.id, destinoId: central.id, documentoTipo: 'ORDEN_COMPRA', documentoNumero: o.numero, ordenCompraId: o.id };
    await u.almacen.post('/api/movimientos', { ...base, cantidad: 11, claveIdempotencia: clave() }).expect(409);
    await u.almacen.post('/api/movimientos', { ...base, cantidad: 10, claveIdempotencia: clave() }).expect(201);
  });
});

describe('detección de duplicados', () => {
  test('detecta los dos pares del extracto, con sus motivos y sin falsos positivos', async () => {
    const { body } = await u.admin.get('/api/ordenes/posibles-duplicados').expect(200);
    expect(body.map((s) => [s.orden_a.numero, s.orden_b.numero, s.confianza])).toEqual([
      ['OC-1041', 'OC-1042', 'ALTA'],
      ['OC-1050', 'OC-1053', 'MEDIA'],
    ]);
    expect(body[0].motivos).toEqual(expect.arrayContaining(['Mismo proveedor: Proveedor A', 'Misma cantidad: 200', 'Misma área solicitante: Obras']));
    expect(body[0].motivos.join(' ')).toContain('Posible fraccionamiento');
    expect(body[1].motivos.join(' ')).toContain('4 %');
  });

  test('la regla es configurable', async () => {
    await u.admin.put('/api/configuracion/parametros/DUP_TOLERANCIA_PCT', { valor: 3 }).expect(200);
    const { body } = await u.admin.get('/api/ordenes/posibles-duplicados?estado=PENDIENTE').expect(200);
    expect(body.map((s) => s.orden_b.numero)).toEqual(['OC-1042']);
  });

  test('no bloquea la orden sospechosa: la crea y avisa', async () => {
    const provA = await proveedor('A');
    const obras = await area('Obras');
    const cuerpo = { proveedorId: provA.id, areaId: obras.id, fechaEmision: '2026-11-02', cotizaciones: 3, lineas: [{ materialId: cemento.id, cantidad: 50, precioUnitario: 6300 }] };
    await u.comprador.post('/api/ordenes', cuerpo).expect(201);
    const r = await u.comprador.post('/api/ordenes', cuerpo).expect(201);
    expect(r.body.sospechasDuplicado).toHaveLength(1);
  });

  test('una orden anulada deja de ser sospechosa', async () => {
    const provA = await proveedor('A');
    const obras = await area('Obras');
    const cuerpo = { proveedorId: provA.id, areaId: obras.id, fechaEmision: '2026-11-02', cotizaciones: 3, lineas: [{ materialId: cemento.id, cantidad: 50, precioUnitario: 6300 }] };
    await u.comprador.post('/api/ordenes', cuerpo).expect(201);
    const b = await u.comprador.post('/api/ordenes', cuerpo).expect(201);
    await u.comprador.post(`/api/ordenes/${b.body.orden.id}/anular`, { comentario: 'Se generó por error' }).expect(200);
    const { body } = await u.admin.get('/api/ordenes/posibles-duplicados').expect(200);
    expect(body).toHaveLength(2);
  });

  test('una revisión humana queda registrada y no se revierte al escanear', async () => {
    const [s] = (await u.admin.get('/api/ordenes/posibles-duplicados').expect(200)).body;
    await u.auditor.patch(`/api/ordenes/posibles-duplicados/${s.id}`, { estado: 'DESCARTADA', comentario: 'Pedidos para dos obras distintas' }).expect(200);
    const { body } = await u.admin.get('/api/ordenes/posibles-duplicados?estado=DESCARTADA').expect(200);
    expect(body[0]).toMatchObject({ id: s.id, comentario: 'Pedidos para dos obras distintas' });
    await u.auditor.patch(`/api/ordenes/posibles-duplicados/${s.id}`, { estado: 'CONFIRMADA', comentario: 'Cambio de criterio' }).expect(409);
  });
});

describe('administración', () => {
  test('el dashboard entrega indicadores reales', async () => {
    const { body } = await u.admin.get('/api/reportes/dashboard').expect(200);
    expect(body.indicadores).toMatchObject({ materiales: 7, obras: 2, bodegas: 3, alertasActivas: 2, bajoPuntoReorden: 2, posiblesDuplicados: 2 });
  });

  test('la lista de usuarios no expone contraseñas y es solo para administración', async () => {
    const { body } = await u.admin.get('/api/usuarios').expect(200);
    expect(JSON.stringify(body)).not.toContain('password');
    await u.comprador.get('/api/usuarios').expect(403);
  });

  test('credenciales incorrectas responden 401 con mensaje genérico', async () => {
    const request = require('supertest');
    const r = await request(require('../src/app')).post('/api/auth/login').send({ email: 'admin@delvalle.test', password: 'incorrecta' }).expect(401);
    expect(r.body.codigo).toBe('CREDENCIALES_INVALIDAS');
  });

  test('un intento de inyección SQL en la búsqueda no altera nada', async () => {
    const r = await u.admin.get(`/api/materiales?buscar=${encodeURIComponent("' OR 1=1; DROP TABLE materiales; --")}`).expect(200);
    expect(r.body).toEqual([]);
    expect(await prisma.materiales.count()).toBe(7);
  });
});
