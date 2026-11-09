// Cliente HTTP base: todas las llamadas a la API pasan por aquí.
const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TIMEOUT_MS = 15000;
const CLAVE_TOKEN = 'construct.token';

export class ApiError extends Error {
  constructor(status, mensaje, detalles) {
    super(mensaje);
    this.status = status;
    this.detalles = detalles;
  }
}

export const tokenStorage = {
  leer: () => {
    try {
      return localStorage.getItem(CLAVE_TOKEN);
    } catch {
      return null;
    }
  },
  guardar: (token) => {
    try {
      localStorage.setItem(CLAVE_TOKEN, token);
    } catch {
      /* almacenamiento bloqueado: la sesión dura lo que la pestaña */
    }
  },
  borrar: () => {
    try {
      localStorage.removeItem(CLAVE_TOKEN);
    } catch {
      /* nada que borrar */
    }
  },
};

// AuthContext registra aquí qué hacer ante un 401.
let alNoAutorizado = () => {};
export const configurarNoAutorizado = (fn) => {
  alNoAutorizado = fn;
};

async function peticion(metodo, ruta, cuerpo) {
  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), TIMEOUT_MS);
  const token = tokenStorage.leer();
  let respuesta;
  try {
    respuesta = await fetch(`${BASE_URL}${ruta}`, {
      method: metodo,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      signal: control.signal,
    });
  } catch {
    throw new ApiError(0, 'No hay conexión con el servidor. Verifique que la API esté encendida.');
  } finally {
    clearTimeout(temporizador);
  }

  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    if (respuesta.status === 401 && token) alNoAutorizado();
    throw new ApiError(respuesta.status, datos?.error || 'La operación no se pudo completar.', datos?.detalles);
  }
  return datos;
}

export const api = {
  get: (ruta) => peticion('GET', ruta),
  post: (ruta, cuerpo = {}) => peticion('POST', ruta, cuerpo),
  patch: (ruta, cuerpo) => peticion('PATCH', ruta, cuerpo),
  put: (ruta, cuerpo) => peticion('PUT', ruta, cuerpo),
};
