const numeros = new Intl.NumberFormat('es-CR', { maximumFractionDigits: 3 });
const fechas = new Intl.DateTimeFormat('es-CR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
const fechasHora = new Intl.DateTimeFormat('es-CR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export const numero = (n) => (n === null || n === undefined ? 'Sin dato' : numeros.format(n));
export const colones = (n) => (n === null || n === undefined ? 'Sin dato' : `₡${numeros.format(n)}`);
export const fecha = (f) => (f ? fechas.format(new Date(f)) : 'Sin fecha');
export const fechaHora = (f) => (f ? fechasHora.format(new Date(f)) : 'Sin fecha');
export const nuevaClave = () => crypto.randomUUID();

const TEXTOS = {
  PENDIENTE: ['Pendiente', 'aviso'], APROBADA: ['Aprobada', 'ok'], RECHAZADA: ['Rechazada', 'peligro'], CONVERTIDA: ['Convertida en orden', 'info'], OMITIDA: ['Omitida', ''],
  PENDIENTE_APROBACION: ['Pendiente de aprobación', 'aviso'], EMITIDA: ['Emitida', 'info'], RECIBIDA_PARCIAL: ['Recibida en parte', 'aviso'], RECIBIDA: ['Recibida', 'ok'], ANULADA: ['Anulada', ''],
  ATENDIDA: ['Atendida', 'info'], CERRADA: ['Cerrada', ''], CRITICA: ['Crítica', 'peligro'], ALTA: ['Alta', 'aviso'], MEDIA: ['Media', 'info'],
  OK: ['Sobre el punto de reorden', 'ok'], REPONER: ['Reponer', 'peligro'], SIN_PARAMETROS: ['Sin parámetros', ''],
  CONFIRMADA: ['Confirmada', 'peligro'], DESCARTADA: ['Descartada', ''],
  ENTRADA: ['Entrada', 'ok'], SALIDA: ['Salida', 'aviso'], TRASLADO: ['Traslado', 'info'], AJUSTE: ['Ajuste', ''],
  EQUIVALENTE: ['Equivalente', 'ok'], EQUIVALENTE_POR_VALIDAR: ['Validar ficha técnica', 'aviso'], SIN_EQUIVALENTE: ['Sin equivalente', ''],
  CONFORME: ['Conforme', 'ok'], FUERA_CONTRATO_PRECIO: ['Fuera de contrato por precio', 'aviso'], FUERA_CONTRATO_PROVEEDOR: ['Fuera de contrato por proveedor', 'aviso'], SIN_CONTRATO: ['Sin contrato', ''],
};

export const textoEstado = (clave) => TEXTOS[clave] ?? [clave, ''];
