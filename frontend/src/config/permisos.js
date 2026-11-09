// Solo decide qué botones mostrar. La autorización real siempre la aplica el backend.
export const PUEDE = {
  editarMateriales: ['ADMIN', 'JEFATURA_COMPRAS'],
  moverStock: ['ADMIN', 'BODEGUERO', 'JEFATURA_AREA', 'JEFATURA_COMPRAS'],
  gestionarAlertas: ['ADMIN', 'BODEGUERO', 'JEFATURA_AREA', 'JEFATURA_COMPRAS', 'COMPRADOR'],
  solicitar: ['ADMIN', 'SOLICITANTE', 'JEFATURA_AREA', 'JEFATURA_COMPRAS', 'COMPRADOR', 'BODEGUERO'],
  crearOrden: ['ADMIN', 'COMPRADOR', 'JEFATURA_COMPRAS'],
  recibir: ['ADMIN', 'BODEGUERO'],
  revisarDuplicados: ['ADMIN', 'JEFATURA_COMPRAS', 'AUDITOR'],
  crearObra: ['ADMIN', 'JEFATURA_AREA'],
  crearProveedor: ['ADMIN', 'JEFATURA_COMPRAS'],
  administrar: ['ADMIN'],
  verAuditoria: ['ADMIN', 'AUDITOR'],
};

export const MENU = [
  { grupo: null, enlaces: [['/', 'Resumen']] },
  { grupo: 'Inventario', enlaces: [['/materiales', 'Materiales'], ['/inventarios', 'Inventarios'], ['/movimientos', 'Movimientos'], ['/alertas', 'Alertas'], ['/trazabilidad', 'Trazabilidad']] },
  { grupo: 'Compras', enlaces: [['/requisiciones', 'Requisiciones'], ['/ordenes', 'Órdenes de compra'], ['/aprobaciones', 'Aprobaciones'], ['/proveedores', 'Proveedores']] },
  { grupo: 'Gestión', enlaces: [['/obras', 'Obras y bodegas'], ['/reportes', 'Reportes'], ['/configuracion', 'Usuarios y configuración']] },
];
