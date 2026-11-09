const { prisma } = require('../config/database');
const { ErrorHttp, noEncontrado } = require('../utils/errorHttp');
const { auditar } = require('./auditoria.service');

const leerMatriz = (db) => db.matriz_aprobacion.findMany({ include: { rol: true }, orderBy: { orden: 'asc' } });

/** El primer tramo cuyo tope cubre el monto define quién aprueba. El último tramo no tiene tope. */
function tramoDeMatriz(matriz, monto) {
  const tramo = matriz.find((t) => t.monto_hasta === null || Number(monto) <= Number(t.monto_hasta));
  if (!tramo) throw new ErrorHttp(500, 'MATRIZ_INCOMPLETA', 'La matriz de aprobación no cubre este monto.');
  return tramo;
}

async function tramoPorMonto(db, monto) {
  return tramoDeMatriz(await leerMatriz(db), monto);
}

/** Crea los pasos pendientes. Quien solicita no se aprueba a sí mismo: el paso sube al tramo siguiente. */
async function crearPasos(tx, documento, tramo, rolSolicitante) {
  const matriz = await leerMatriz(tx);
  const siguiente = matriz.find((t) => t.orden === tramo.orden + 1);
  const aprobador = tramo.rol.codigo === rolSolicitante && siguiente ? siguiente : tramo;
  const roles = [];
  if (tramo.requiere_comite) roles.push((await tx.roles.findUnique({ where: { codigo: 'COMITE_COMPRAS' } })).id);
  roles.push(aprobador.rol_aprobador_id);

  for (const [i, rolId] of roles.entries()) {
    await tx.aprobaciones.create({ data: { ...documento, paso: i + 1, rol_requerido_id: rolId } });
  }
}

const TIPOS = {
  requisicion: {
    modelo: 'requisiciones', llave: 'requisicion_id', pendiente: 'PENDIENTE', aprobado: 'APROBADA', rechazado: 'RECHAZADA', autor: 'solicitante_id',
  },
  orden: {
    modelo: 'ordenes_compra', llave: 'orden_compra_id', pendiente: 'PENDIENTE_APROBACION', aprobado: 'EMITIDA', rechazado: 'RECHAZADA', autor: 'creado_por_id',
  },
};

function comprobarAutorizacion(usuario, doc, config, pasos, paso) {
  if (usuario.rol !== paso.rol.codigo) {
    throw new ErrorHttp(403, 'APROBADOR_NO_AUTORIZADO', `Este paso corresponde a ${paso.rol.nombre}.`);
  }
  if (paso.rol.codigo === 'JEFATURA_AREA' && usuario.areaId !== doc.area_id) {
    throw new ErrorHttp(403, 'APROBADOR_NO_AUTORIZADO', 'Solo la jefatura del área solicitante puede aprobar este documento.');
  }
  if (doc[config.autor] === usuario.id) {
    throw new ErrorHttp(403, 'SEGREGACION_FUNCIONES', 'Quien crea un documento no puede aprobarlo.');
  }
  if (pasos.some((p) => p.usuario_id === usuario.id)) {
    throw new ErrorHttp(403, 'SEGREGACION_FUNCIONES', 'Una misma persona no puede firmar dos pasos del mismo documento.');
  }
}

function decidir(usuario, tipo, id, decision, comentario) {
  const config = TIPOS[tipo];
  return prisma.$transaction(async (tx) => {
    const doc = await tx[config.modelo].findUnique({ where: { id } });
    if (!doc) throw noEncontrado('El documento');
    if (doc.estado !== config.pendiente) throw new ErrorHttp(409, 'DOCUMENTO_NO_PENDIENTE', `El documento está en estado ${doc.estado}.`);

    const pasos = await tx.aprobaciones.findMany({ where: { [config.llave]: id }, include: { rol: true }, orderBy: { paso: 'asc' } });
    const paso = pasos.find((p) => p.estado === 'PENDIENTE');
    if (!paso) throw new ErrorHttp(409, 'SIN_PASOS', 'El documento no tiene aprobaciones pendientes.');

    comprobarAutorizacion(usuario, doc, config, pasos, paso);

    if (decision === 'APROBADA' && doc.cotizaciones < doc.cotizaciones_requeridas) {
      throw new ErrorHttp(409, 'COTIZACIONES_INSUFICIENTES', `Se requieren ${doc.cotizaciones_requeridas} cotizaciones y hay ${doc.cotizaciones}.`);
    }

    // El UPDATE condicional impide que dos personas resuelvan el mismo paso a la vez.
    const r = await tx.aprobaciones.updateMany({
      where: { id: paso.id, estado: 'PENDIENTE' },
      data: { estado: decision, usuario_id: usuario.id, fecha_decision: new Date(), comentario },
    });
    if (r.count === 0) throw new ErrorHttp(409, 'PASO_YA_RESUELTO', 'Otra persona ya resolvió este paso.');

    let estado = doc.estado;
    if (decision === 'RECHAZADA') {
      await tx.aprobaciones.updateMany({ where: { [config.llave]: id, estado: 'PENDIENTE' }, data: { estado: 'OMITIDA' } });
      estado = config.rechazado;
    } else if (pasos.filter((p) => p.estado === 'PENDIENTE').length === 1) {
      estado = config.aprobado;
    }

    const despues = await tx[config.modelo].update({ where: { id }, data: { estado } });
    await auditar(tx, { usuarioId: usuario.id, accion: `DECISION_${decision}`, entidad: config.modelo, entidadId: id, antes: { estado: doc.estado, paso: paso.paso }, despues: { estado, comentario } });
    return { documento: despues, decision, paso: paso.paso, siguientePaso: estado === doc.estado ? pasos.find((p) => p.paso === paso.paso + 1)?.rol.nombre : null };
  });
}

const VISTA_DOCUMENTO = { area: { select: { nombre: true } } };

async function pendientes(usuario) {
  const filas = await prisma.aprobaciones.findMany({
    where: { estado: 'PENDIENTE' },
    include: {
      rol: true,
      requisicion: { include: { ...VISTA_DOCUMENTO, solicitante: { select: { nombre: true } } } },
      orden: { include: { ...VISTA_DOCUMENTO, proveedor: { select: { nombre: true } } } },
    },
    orderBy: [{ creado_en: 'asc' }, { paso: 'asc' }],
  });

  // Solo interesa el paso vigente de cada documento.
  const vistos = new Set();
  const vigentes = filas.filter((f) => {
    const clave = f.requisicion_id ? `r${f.requisicion_id}` : `o${f.orden_compra_id}`;
    if (vistos.has(clave)) return false;
    vistos.add(clave);
    return true;
  });

  const verTodo = ['ADMIN', 'AUDITOR'].includes(usuario.rol);
  return vigentes
    .filter((f) => verTodo || f.rol.codigo === usuario.rol)
    .filter((f) => verTodo || f.rol.codigo !== 'JEFATURA_AREA' || (f.requisicion ?? f.orden).area_id === usuario.areaId)
    .map((f) => {
      const doc = f.requisicion ?? f.orden;
      return {
        id: f.id,
        tipo: f.requisicion ? 'requisicion' : 'orden',
        documentoId: doc.id,
        numero: doc.numero,
        area: doc.area.nombre,
        monto: f.requisicion ? doc.monto_total : doc.total,
        montoEvaluado: doc.monto_evaluado,
        cotizaciones: doc.cotizaciones,
        cotizacionesRequeridas: doc.cotizaciones_requeridas,
        fraccionamientoSospechoso: doc.fraccionamiento_sospechoso,
        fraccionamientoDetalle: doc.fraccionamiento_detalle,
        paso: f.paso,
        rolRequerido: f.rol.nombre,
        puedoDecidir: f.rol.codigo === usuario.rol,
      };
    });
}

const historial = () =>
  prisma.aprobaciones.findMany({
    where: { estado: { not: 'PENDIENTE' } },
    include: { rol: true, usuario: { select: { nombre: true } }, requisicion: { select: { numero: true } }, orden: { select: { numero: true } } },
    orderBy: { fecha_decision: 'desc' },
    take: 200,
  });

module.exports = { leerMatriz, tramoDeMatriz, tramoPorMonto, crearPasos, decidir, pendientes, historial };
