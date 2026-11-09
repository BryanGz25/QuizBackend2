import { api } from './api';

export const materialesApi = {
  listar: () => api.get('/materiales'),
  crear: (d) => api.post('/materiales', d),
  actualizar: (id, d) => api.patch(`/materiales/${id}`, d),
  trazabilidad: (id) => api.get(`/materiales/${id}/trazabilidad`),
};

export const movimientosApi = {
  listar: (filtro = '') => api.get(`/movimientos${filtro}`),
  crear: (d) => api.post('/movimientos', d),
};

export const alertasApi = {
  listar: (estado) => api.get(`/alertas?estado=${estado}`),
  cambiarEstado: (id, d) => api.patch(`/alertas/${id}`, d),
  generarRequisicion: (id, d) => api.post(`/alertas/${id}/generar-requisicion`, d),
};

export const catalogosApi = {
  categorias: () => api.get('/categorias'),
  areas: () => api.get('/areas'),
  obras: () => api.get('/obras'),
  crearObra: (d) => api.post('/obras', d),
  bodegas: () => api.get('/bodegas'),
  crearBodega: (d) => api.post('/bodegas', d),
  proveedores: () => api.get('/proveedores'),
  crearProveedor: (d) => api.post('/proveedores', d),
};
