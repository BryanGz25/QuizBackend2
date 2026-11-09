import { api } from './api';

export const authApi = {
  login: (d) => api.post('/auth/login', d),
  yo: () => api.get('/auth/me'),
};

export const reportesApi = {
  dashboard: () => api.get('/reportes/dashboard'),
  inventario: () => api.get('/reportes/inventario'),
  consolidacion: () => api.get('/reportes/consolidacion'),
  fugaValor: (mes) => api.get(`/reportes/fuga-valor?mes=${mes}`),
  conciliacion: () => api.get('/reportes/conciliacion'),
};

export const adminApi = {
  usuarios: () => api.get('/usuarios'),
  roles: () => api.get('/usuarios/roles'),
  crearUsuario: (d) => api.post('/usuarios', d),
  actualizarUsuario: (id, d) => api.patch(`/usuarios/${id}`, d),
  parametros: () => api.get('/configuracion/parametros'),
  actualizarParametro: (clave, valor) => api.put(`/configuracion/parametros/${clave}`, { valor }),
  matriz: () => api.get('/configuracion/matriz'),
  actualizarTramo: (id, d) => api.put(`/configuracion/matriz/${id}`, d),
  auditoria: () => api.get('/configuracion/auditoria?limite=100'),
};
