// Datos semilla. Lo que viene del documento del profesor está marcado como ORIGINAL;
// usuarios, obras, bodegas, stock mínimo/máximo y consumos son FICTICIOS y solo permiten reproducir los casos.
const bcrypt = require('bcryptjs');
const { prisma: cliente } = require('../src/config/database');
const movimientos = require('../src/services/movimientos.service');
const alertas = require('../src/services/alertas.service');
const duplicados = require('../src/services/duplicados.service');

const PASSWORD_DEMO = process.env.SEED_PASSWORD || 'Demo2026!';
const fecha = (dia) => new Date(Date.UTC(2026, 9, dia));

const ROLES = [
  ['ADMIN', 'Administración del sistema'],
  ['SOLICITANTE', 'Solicitante'],
  ['JEFATURA_AREA', 'Jefatura del área solicitante'],
  ['COMPRADOR', 'Comprador'],
  ['JEFATURA_COMPRAS', 'Jefatura de Compras'],
  ['GERENCIA_FINANCIERA', 'Gerencia Financiera'],
  ['GERENCIA_GENERAL', 'Gerencia General'],
  ['COMITE_COMPRAS', 'Comité de compras'],
  ['BODEGUERO', 'Bodega'],
  ['AUDITOR', 'Auditoría'],
];

// ORIGINAL: matriz de aprobación del ejercicio A1.
const MATRIZ = [
  [1, 250000, 'JEFATURA_AREA', 1, false],
  [2, 2000000, 'JEFATURA_COMPRAS', 2, false],
  [3, 10000000, 'GERENCIA_FINANCIERA', 3, false],
  [4, null, 'GERENCIA_GENERAL', 3, true],
];

const PARAMETROS = [
  ['DUP_VENTANA_DIAS', '3', 'Días máximos entre dos órdenes para considerarlas posible duplicado.'],
  ['DUP_TOLERANCIA_PCT', '5', 'Diferencia porcentual máxima de cantidad para considerarla similar.'],
  ['FRACC_VENTANA_DIAS', '15', 'Días en los que se acumulan solicitudes similares para detectar fraccionamiento.'],
];

const USUARIOS = [
  ['admin', 'Ana Administradora', 'ADMIN', null],
  ['solicitante.obras', 'Sergio Solicitante', 'SOLICITANTE', 'Obras'],
  ['jefe.obras', 'Olga Jefa de Obras', 'JEFATURA_AREA', 'Obras'],
  ['jefe.mantenimiento', 'Mario Jefe de Mantenimiento', 'JEFATURA_AREA', 'Mantenimiento'],
  ['comprador', 'Carla Compradora', 'COMPRADOR', null],
  ['jefe.compras', 'Julio Jefe de Compras', 'JEFATURA_COMPRAS', null],
  ['finanzas', 'Fernanda Gerente Financiera', 'GERENCIA_FINANCIERA', null],
  ['gerencia', 'Gabriel Gerente General', 'GERENCIA_GENERAL', null],
  ['comite', 'Camila del Comité', 'COMITE_COMPRAS', null],
  ['bodega', 'Bernardo Bodeguero', 'BODEGUERO', 'Bodega Central'],
  ['auditor', 'Alicia Auditora', 'AUDITOR', null],
];

const CATEGORIAS = [
  ['MAT', 'Materiales de construcción', null],
  ['MAT-CEM', 'Cemento y agregados', 'MAT'],
  ['MAT-ACE', 'Acero de refuerzo', 'MAT'],
  ['MAT-MAM', 'Mampostería', 'MAT'],
  ['EPP', 'Equipo de protección personal', null],
  ['EPP-MAN', 'Protección de manos', 'EPP'],
  ['PLO', 'Plomería', null],
  ['PLO-TUB', 'Tubería', 'PLO'],
];

// A5 ORIGINAL: demanda y tiempo de entrega. FICTICIO: mínimo = stock de seguridad; máximo = PR + 7 días de demanda.
const MATERIALES = [
  { codigo: 'MAT-CEM-GRIS50', nombre: 'Cemento gris 50 kg', unidad: 'saco', cat: 'MAT-CEM', d: 40, max: 55, L: 3, min: 45, tope: 445 },
  { codigo: 'MAT-ACE-VAR3G40', nombre: 'Varilla #3 grado 40', unidad: 'unidad', cat: 'MAT-ACE', d: 120, max: 160, L: 5, min: 200, tope: 1640 },
  { codigo: 'MAT-MAM-BLK122040', nombre: 'Block 12 × 20 × 40', unidad: 'unidad', cat: 'MAT-MAM', d: 600, max: 900, L: 4, min: 1200, tope: 7800 },
  { codigo: 'MAT-CEM-ARENA', nombre: 'Arena', unidad: 'm³', cat: 'MAT-CEM', d: 6, max: 10, L: 2, min: 8, tope: 62 },
  { codigo: 'EPP-MAN-NITL', nombre: 'Guante de nitrilo talla L', unidad: 'par', cat: 'EPP-MAN' },
  { codigo: 'EPP-MAN-TRAL', nombre: 'Guante de trabajo talla L', unidad: 'par', cat: 'EPP-MAN' },
  { codigo: 'PLO-TUB-PVC12SDR135', nombre: 'Tubo PVC 1/2 SDR 13.5', unidad: 'unidad', cat: 'PLO-TUB' },
];

const EQ = 'EQUIVALENTE';
const VAL = 'EQUIVALENTE_POR_VALIDAR';
const SIN = 'SIN_EQUIVALENTE';

// A2 ORIGINAL: las 8 líneas del ERP.
const LINEAS_ERP = [
  [1, 'Cemento gris 50 kg', 'Obras', 'A', 200, 6450, 'MAT-CEM-GRIS50', EQ, 'Descripción estándar del insumo.'],
  [2, 'Saco cemento uso general', 'Mantenimiento', 'B', 40, 7100, 'MAT-CEM-GRIS50', EQ, 'En A3 la misma compra (Prov. B, 40 a ₡7 100) figura como Cemento gris 50 kg.'],
  [3, 'CEM-GRIS-50', 'Bodega Central', 'A', 300, 6300, 'MAT-CEM-GRIS50', EQ, 'El código interno describe cemento gris de 50 kg; en A3 figura como tal (OC-1061).'],
  [4, 'Varilla #3 grado 40', 'Obras', 'C', 500, 2150, 'MAT-ACE-VAR3G40', EQ, 'Descripción estándar del insumo.'],
  [5, 'Hierro 3/8 x 6 m', 'Mantenimiento', 'D', 60, 2600, 'MAT-ACE-VAR3G40', VAL, 'En A3 figura como Varilla #3 y #3 equivale a 3/8", pero la descripción no indica el grado 40: validar la ficha técnica.'],
  [6, 'Guantes de nitrilo talla L', 'Bodega Central', 'E', 100, 850, 'EPP-MAN-NITL', SIN, 'El nitrilo protege contra químicos; no sustituye a un guante de trabajo.'],
  [7, 'Guantes trabajo L', 'Obras', 'F', 80, 1200, 'EPP-MAN-TRAL', SIN, 'Guante mecánico de uso general; no equivale al de nitrilo.'],
  [8, 'Tubo PVC 1/2 SDR 13.5', 'Mantenimiento', 'B', 25, 2900, 'PLO-TUB-PVC12SDR135', SIN, 'Único artículo de su tipo en el extracto.'],
];

// A3 ORIGINAL: las 7 órdenes de octubre.
const ORDENES = [
  [1041, 2, 'Obras', 'A', 'MAT-CEM-GRIS50', 200, 6450],
  [1042, 2, 'Obras', 'A', 'MAT-CEM-GRIS50', 200, 6450],
  [1047, 6, 'Mantenimiento', 'B', 'MAT-CEM-GRIS50', 40, 7100],
  [1050, 8, 'Obras', 'C', 'MAT-ACE-VAR3G40', 500, 2150],
  [1053, 9, 'Obras', 'C', 'MAT-ACE-VAR3G40', 480, 2150],
  [1058, 13, 'Mantenimiento', 'D', 'MAT-ACE-VAR3G40', 60, 2600],
  [1061, 15, 'Bodega Central', 'A', 'MAT-CEM-GRIS50', 300, 6300],
];

async function porClave(prisma) {
  const lista = async (modelo, campo) => Object.fromEntries((await prisma[modelo].findMany()).map((f) => [f[campo], f]));
  return { roles: await lista('roles', 'codigo'), areas: await lista('areas', 'nombre') };
}

async function sembrar(prisma = cliente, { costoHash = 10 } = {}) {
  await prisma.roles.createMany({ data: ROLES.map(([codigo, nombre]) => ({ codigo, nombre })) });
  await prisma.areas.createMany({ data: ['Obras', 'Mantenimiento', 'Bodega Central'].map((nombre) => ({ nombre })) });
  await prisma.parametros.createMany({ data: PARAMETROS.map(([clave, valor, descripcion]) => ({ clave, valor, descripcion })) });
  const { roles, areas } = await porClave(prisma);

  await prisma.matriz_aprobacion.createMany({
    data: MATRIZ.map(([orden, monto_hasta, rol, cotizaciones_requeridas, requiere_comite]) => ({ orden, monto_hasta, rol_aprobador_id: roles[rol].id, cotizaciones_requeridas, requiere_comite })),
  });

  const password_hash = await bcrypt.hash(PASSWORD_DEMO, costoHash);
  await prisma.usuarios.createMany({
    data: USUARIOS.map(([usuario, nombre, rol, area]) => ({ nombre, email: `${usuario}@delvalle.test`, password_hash, rol_id: roles[rol].id, area_id: area ? areas[area].id : null })),
  });
  const usuario = async (u) => prisma.usuarios.findUnique({ where: { email: `${u}@delvalle.test` } });
  const comprador = await usuario('comprador');
  const bodeguero = await usuario('bodega');

  const categorias = {};
  for (const [codigo, nombre, padre] of CATEGORIAS) {
    categorias[codigo] = await prisma.categorias.create({ data: { codigo, nombre, padre_id: padre ? categorias[padre].id : null } });
  }

  const proveedores = {};
  for (const letra of 'ABCDEF') proveedores[letra] = await prisma.proveedores.create({ data: { codigo: `PROV-${letra}`, nombre: `Proveedor ${letra}` } });

  const materiales = {};
  for (const m of MATERIALES) {
    materiales[m.codigo] = await prisma.materiales.create({
      data: { codigo: m.codigo, nombre: m.nombre, unidad: m.unidad, categoria_id: categorias[m.cat].id, stock_minimo: m.min, stock_maximo: m.tope, demanda_promedio_dia: m.d, demanda_maxima_dia: m.max, tiempo_entrega_dias: m.L },
    });
  }

  await prisma.lineas_erp.createMany({
    data: LINEAS_ERP.map(([numero, descripcion_erp, area, prov, cantidad, precio_unitario, material, estado_equivalencia, justificacion]) => ({
      numero, descripcion_erp, area_id: areas[area].id, proveedor_id: proveedores[prov].id, cantidad, precio_unitario, material_id: materiales[material].id, estado_equivalencia, justificacion,
    })),
  });

  // A3 ORIGINAL: contrato vigente con el Proveedor A.
  await prisma.contratos_precio.createMany({
    data: [
      { proveedor_id: proveedores.A.id, material_id: materiales['MAT-CEM-GRIS50'].id, precio: 6300, vigente_desde: new Date(Date.UTC(2026, 0, 1)) },
      { proveedor_id: proveedores.A.id, material_id: materiales['MAT-ACE-VAR3G40'].id, precio: 2050, vigente_desde: new Date(Date.UTC(2026, 0, 1)) },
    ],
  });

  const central = await prisma.bodegas.create({ data: { codigo: 'BOD-CENTRAL', nombre: 'Bodega Central' } });
  const robles = await prisma.obras.create({ data: { codigo: 'OBR-ROBLES', nombre: 'Residencial Los Robles (ficticia)' } });
  const norte = await prisma.obras.create({ data: { codigo: 'OBR-NORTE', nombre: 'Plaza Norte (ficticia)' } });
  await prisma.bodegas.create({ data: { codigo: 'BOD-ROBLES', nombre: 'Bodega Los Robles', obra_id: robles.id } });
  await prisma.bodegas.create({ data: { codigo: 'BOD-NORTE', nombre: 'Bodega Plaza Norte', obra_id: norte.id } });

  // Cada orden histórica se recibe en Bodega Central para que su entrada sea trazable.
  for (const [id, dia, area, prov, material, cantidad, precio] of ORDENES) {
    await prisma.$transaction(async (tx) => {
      const total = cantidad * precio;
      const orden = await tx.ordenes_compra.create({
        data: {
          id, numero: `OC-${id}`, proveedor_id: proveedores[prov].id, area_id: areas[area].id, fecha_emision: fecha(dia), estado: 'RECIBIDA', total, monto_evaluado: total, creado_por_id: comprador.id,
          detalle: { create: [{ material_id: materiales[material].id, cantidad, precio_unitario: precio }] },
        },
        include: { detalle: true },
      });
      const recepcion = await tx.recepciones.create({
        data: { numero: `REC-S${id}`, orden_compra_id: id, bodega_id: central.id, usuario_id: bodeguero.id, fecha: fecha(dia + 1), detalle: { create: [{ detalle_orden_id: orden.detalle[0].id, cantidad_recibida: cantidad }] } },
        include: { detalle: true },
      });
      await movimientos.aplicar(tx, {
        tipo: 'ENTRADA', materialId: materiales[material].id, cantidad, destinoId: central.id, usuarioId: bodeguero.id, documentoTipo: 'ORDEN_COMPRA', documentoNumero: orden.numero,
        ordenCompraId: id, detalleRecepcionId: recepcion.detalle[0].id, fecha: fecha(dia + 1), clave: `semilla-oc-${id}`,
      });
    });
  }

  // FICTICIO: consumos que concilian lo recibido con el stock original de A5 (740−550=190 y 1040−190=850).
  const consumos = [['MAT-CEM-GRIS50', 550], ['MAT-ACE-VAR3G40', 190]];
  for (const [material, cantidad] of consumos) {
    await prisma.$transaction((tx) => movimientos.aplicar(tx, {
      tipo: 'SALIDA', materialId: materiales[material].id, cantidad, origenId: central.id, usuarioId: bodeguero.id, documentoTipo: 'VALE_SALIDA', documentoNumero: `VS-SEMILLA-${material}`,
      fecha: fecha(31), observaciones: 'Dato semilla ficticio: consumo acumulado de octubre para conciliar con el stock de A5.', clave: `semilla-consumo-${material}`,
    }));
  }

  // A5 ORIGINAL: stock actual de los materiales sin órdenes en el extracto.
  const iniciales = [['MAT-MAM-BLK122040', 2800], ['MAT-CEM-ARENA', 14]];
  for (const [material, cantidad] of iniciales) {
    await prisma.$transaction((tx) => movimientos.aplicar(tx, {
      tipo: 'ENTRADA', materialId: materiales[material].id, cantidad, destinoId: central.id, usuarioId: bodeguero.id, documentoTipo: 'CARGA_INICIAL', documentoNumero: `CI-${material}`,
      fecha: fecha(31), observaciones: 'Stock actual del ejercicio A5.', clave: `semilla-inicial-${material}`,
    }));
  }

  await alertas.evaluarTodos(prisma);
  await duplicados.escanear(prisma);
}

if (require.main === module) {
  sembrar()
    .then(() => console.log('Datos semilla cargados.'))
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(() => cliente.$disconnect());
}

module.exports = { sembrar };
