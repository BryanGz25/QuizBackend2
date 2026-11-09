const { prisma } = require('../config/database');
const { ErrorHttp, noEncontrado } = require('../utils/errorHttp');
const { colones, redondear } = require('../utils/decimal');
const { auditar } = require('./auditoria.service');
const { leerParametros } = require('./parametros.service');
const { leerMatriz, tramoDeMatriz } = require('./aprobaciones.service');

const DIA = 86400000;
const diasEntre = (a, b) => Math.round(Math.abs(a - b) / DIA);

function compararPar(a, b, matriz, { ventana, tolerancia }) {
  const dias = diasEntre(a.orden.fecha_emision, b.orden.fecha_emision);
  const qa = Number(a.cantidad);
  const qb = Number(b.cantidad);
  const diferenciaPct = redondear((Math.abs(qa - qb) / Math.max(qa, qb)) * 100, 1);
  if (dias > ventana || diferenciaPct > tolerancia) return null;

  const mismaArea = a.orden.area_id === b.orden.area_id;
  const mismoPrecio = Number(a.precio_unitario) === Number(b.precio_unitario);
  const motivos = [
    `Mismo proveedor: ${a.orden.proveedor.nombre}`,
    `Mismo artículo: ${a.material.nombre}`,
    qa === qb ? `Misma cantidad: ${qa}` : `Cantidad similar: ${qa} y ${qb} (${diferenciaPct} %, tolerancia ${tolerancia} %)`,
    `Fechas cercanas: ${dias} día(s) de diferencia (ventana ${ventana})`,
    mismaArea ? `Misma área solicitante: ${a.orden.area.nombre}` : `Áreas distintas: ${a.orden.area.nombre} y ${b.orden.area.nombre}`,
    mismoPrecio ? `Mismo precio unitario: ${colones(a.precio_unitario)}` : `Precios distintos: ${colones(a.precio_unitario)} y ${colones(b.precio_unitario)}`,
    `Estados de las órdenes: ${a.orden.estado} y ${b.orden.estado}`,
  ];

  // Dos órdenes que juntas cruzan un umbral también pueden ser fraccionamiento (relación A1–A3).
  const combinado = Number(a.orden.total) + Number(b.orden.total);
  const individual = tramoDeMatriz(matriz, Math.max(Number(a.orden.total), Number(b.orden.total)));
  const conjunto = tramoDeMatriz(matriz, combinado);
  if (conjunto.orden > individual.orden) {
    motivos.push(`Posible fraccionamiento: juntas suman ${colones(combinado)} y exigirían ${conjunto.rol.nombre}; por separado bastó ${individual.rol.nombre}`);
  }

  return { confianza: qa === qb && mismaArea && mismoPrecio ? 'ALTA' : 'MEDIA', motivos };
}

/** Recalcula las sospechas con la regla vigente. Las que un revisor ya resolvió no se tocan. */
async function escanear(db) {
  const { DUP_VENTANA_DIAS: ventana, DUP_TOLERANCIA_PCT: tolerancia } = await leerParametros(db, ['DUP_VENTANA_DIAS', 'DUP_TOLERANCIA_PCT']);
  const matriz = await leerMatriz(db);
  const lineas = await db.detalle_orden_compra.findMany({
    where: { orden: { estado: { notIn: ['RECHAZADA', 'ANULADA'] } } },
    include: { material: true, orden: { include: { proveedor: true, area: true } } },
    orderBy: { orden: { fecha_emision: 'asc' } },
  });

  const grupos = new Map();
  for (const l of lineas) {
    const clave = `${l.orden.proveedor_id}:${l.material_id}`;
    grupos.set(clave, [...(grupos.get(clave) ?? []), l]);
  }

  const vigentes = new Set();
  const resultado = [];
  for (const grupo of grupos.values()) {
    for (let i = 0; i < grupo.length; i++) {
      for (let j = i + 1; j < grupo.length; j++) {
        const hallazgo = compararPar(grupo[i], grupo[j], matriz, { ventana, tolerancia });
        if (!hallazgo) continue;
        const [orden_a_id, orden_b_id] = [grupo[i].orden_compra_id, grupo[j].orden_compra_id].sort((x, y) => x - y);
        const material_id = grupo[i].material_id;
        const clave = { orden_a_id, orden_b_id, material_id };
        const fila = await db.sospechas_duplicado.upsert({
          where: { orden_a_id_orden_b_id_material_id: clave },
          create: { ...clave, ...hallazgo },
          update: hallazgo,
        });
        vigentes.add(fila.id);
        resultado.push(fila);
      }
    }
  }

  await db.sospechas_duplicado.deleteMany({ where: { estado: 'PENDIENTE', id: { notIn: [...vigentes] } } });
  return resultado;
}

const vistaOrden = { include: { proveedor: { select: { nombre: true } }, area: { select: { nombre: true } } } };

async function listar({ estado }) {
  await escanear(prisma);
  return prisma.sospechas_duplicado.findMany({
    where: { estado },
    include: { orden_a: vistaOrden, orden_b: vistaOrden, material: { select: { codigo: true, nombre: true } }, revisado_por: { select: { nombre: true } } },
    orderBy: [{ confianza: 'asc' }, { id: 'asc' }],
  });
}

function revisar(usuario, id, { estado, comentario }) {
  return prisma.$transaction(async (tx) => {
    const antes = await tx.sospechas_duplicado.findUnique({ where: { id } });
    if (!antes) throw noEncontrado('La sospecha');
    if (antes.estado !== 'PENDIENTE') throw new ErrorHttp(409, 'SOSPECHA_RESUELTA', 'Esta sospecha ya fue revisada.');
    const s = await tx.sospechas_duplicado.update({ where: { id }, data: { estado, comentario, revisado_por_id: usuario.id, revisado_en: new Date() } });
    await auditar(tx, { usuarioId: usuario.id, accion: `SOSPECHA_${estado}`, entidad: 'sospechas_duplicado', entidadId: id, antes, despues: s });
    return s;
  });
}

module.exports = { escanear, listar, revisar };
