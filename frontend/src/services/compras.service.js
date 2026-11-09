import { api } from './api';

export const requisicionesApi = {
  listar: () => api.get('/requisiciones'),
  crear: (d) => api.post('/requisiciones', d),
};

export const ordenesApi = {
  listar: () => api.get('/ordenes'),
  crear: (d) => api.post('/ordenes', d),
  anular: (id, comentario) => api.post(`/ordenes/${id}/anular`, { comentario }),
  duplicados: (estado = 'PENDIENTE') => api.get(`/ordenes/posibles-duplicados?estado=${estado}`),
  revisarDuplicado: (id, d) => api.patch(`/ordenes/posibles-duplicados/${id}`, d),
};

export const recepcionesApi = { crear: (d) => api.post('/recepciones', d) };

const RUTA = { requisicion: 'requisiciones', orden: 'ordenes' };

export const aprobacionesApi = {
  pendientes: () => api.get('/aprobaciones/pendientes'),
  historial: () => api.get('/aprobaciones/historial'),
  aprobar: (tipo, id, comentario) => api.post(`/${RUTA[tipo]}/${id}/aprobar`, comentario ? { comentario } : {}),
  rechazar: (tipo, id, comentario) => api.post(`/${RUTA[tipo]}/${id}/rechazar`, { comentario }),
};
