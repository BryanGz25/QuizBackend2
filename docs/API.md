# API REST

Base: `http://localhost:3000/api`. Todas las rutas, salvo `/health` y `/auth/login`, exigen `Authorization: Bearer <token>`.

## Formato de errores

```json
{ "error": "Stock insuficiente: disponible 190, solicitado 191", "codigo": "STOCK_INSUFICIENTE", "detalles": { "disponible": 190, "solicitado": 191 } }
```

| Código HTTP | Significado |
|---|---|
| 200, 201 | Correcto; 200 también indica una operación repetida con la misma clave |
| 400 | Datos inválidos, con detalle por campo |
| 401 | Sin sesión o sesión vencida |
| 403 | El rol no permite la operación |
| 404 | No existe |
| 409 | Conflicto de negocio: stock, estado o duplicado |
| 422 | Referencia válida en forma, pero no utilizable |

## Autenticación

| Método y ruta | Descripción | Acceso |
|---|---|---|
| `POST /auth/login` | Inicia sesión. Limitado a 20 intentos cada 15 minutos | Público |
| `GET /auth/me` | Usuario actual | Sesión |
| `GET /health` | Estado de la API y de MySQL | Público |

```json
POST /auth/login
{ "email": "bodega@delvalle.test", "password": "..." }

200
{ "token": "eyJ...", "usuario": { "id": 10, "nombre": "Bernardo Bodeguero", "rol": "BODEGUERO" } }
```

## Materiales

| Método y ruta | Descripción | Roles |
|---|---|---|
| `GET /materiales?buscar=` | Lista con stock y estado | Todos |
| `POST /materiales` | Registra un material | ADMIN, JEFATURA_COMPRAS |
| `GET /materiales/:id` | Detalle y líneas del ERP | Todos |
| `PATCH /materiales/:id` | Edita datos autorizados; no acepta stock | ADMIN, JEFATURA_COMPRAS |
| `GET /materiales/:id/stock` | Stock derivado, SS, PR y estado | Todos |
| `GET /materiales/:id/trazabilidad` | Origen de entradas e historial | Todos |

```json
GET /materiales/1/stock

200
{
  "material": { "id": 1, "codigo": "MAT-CEM-GRIS50", "nombre": "Cemento gris 50 kg", "unidad": "saco" },
  "stockActual": 190, "stockSeguridad": 45, "puntoReorden": 165, "diferencia": 25, "estado": "OK",
  "porBodega": [{ "bodegaId": 1, "bodega": "Bodega Central", "obra": null, "cantidad": 190 }]
}
```

## Movimientos

| Método y ruta | Descripción | Roles |
|---|---|---|
| `GET /movimientos?materialId=&bodegaId=&tipo=&limite=` | Historial | Todos |
| `POST /movimientos` | Registra entrada, salida, traslado o ajuste | ADMIN, BODEGUERO, JEFATURA_AREA, JEFATURA_COMPRAS |
| `GET /movimientos/:id` | Detalle | Todos |

Un ajuste requiere ADMIN, JEFATURA_AREA o JEFATURA_COMPRAS y una justificación. Una carga inicial requiere ADMIN.

```json
POST /movimientos
{
  "tipo": "SALIDA", "materialId": 1, "cantidad": 30, "origenId": 1,
  "documentoTipo": "VALE_SALIDA", "documentoNumero": "VS-100",
  "claveIdempotencia": "3b4f0a54-8e3c-4d6c-9e55-1f7b3a2e8c11"
}

201
{ "movimiento": { "id": 12, "tipo": "SALIDA", "cantidad": 30 }, "repetido": false, "alerta": { "stock_actual": 160, "punto_reorden": 165, "faltante": 5, "prioridad": "ALTA" } }
```

Repetir la misma clave devuelve 200 y `"repetido": true`, sin registrar otro movimiento.

## Alertas

| Método y ruta | Descripción | Roles |
|---|---|---|
| `GET /alertas?estado=` | Pendientes, atendidas o cerradas | Todos |
| `GET /alertas/reorden` | Evalúa y devuelve las activas, por riesgo | Todos |
| `PATCH /alertas/:id` | Atiende o cierra, con comentario | Gestores |
| `POST /alertas/:id/generar-requisicion` | Crea la requisición con proveedor sugerido | Gestores |

Gestores: ADMIN, BODEGUERO, JEFATURA_AREA, JEFATURA_COMPRAS y COMPRADOR.

## Requisiciones y aprobaciones

| Método y ruta | Descripción | Roles |
|---|---|---|
| `GET /requisiciones?estado=&limite=` | Lista | Todos |
| `POST /requisiciones` | Crea y determina aprobadores | Todos menos AUDITOR |
| `GET /requisiciones/:id` | Detalle | Todos |
| `POST /requisiciones/:id/aprobar` | Aprueba el paso vigente | Según la matriz |
| `POST /requisiciones/:id/rechazar` | Rechaza con motivo | Según la matriz |
| `GET /aprobaciones/pendientes` | Documentos que le corresponden | Todos |
| `GET /aprobaciones/historial` | Decisiones tomadas | Todos |

```json
POST /requisiciones
{ "justificacion": "Reposición para la obra", "cotizaciones": 2, "lineas": [{ "materialId": 1, "cantidad": 100, "precioEstimado": 6300 }] }

201
{ "numero": "REQ-00002", "monto_total": 630000, "monto_evaluado": 630000, "fraccionamiento_sospechoso": false, "aprobaciones": [{ "paso": 1, "rol": { "nombre": "Jefatura de Compras" } }] }
```

## Órdenes y recepciones

| Método y ruta | Descripción | Roles |
|---|---|---|
| `GET /ordenes?estado=&limite=` | Lista | Todos |
| `POST /ordenes` | Crea desde requisición aprobada o directa | ADMIN, COMPRADOR, JEFATURA_COMPRAS |
| `GET /ordenes/:id` | Detalle | Todos |
| `POST /ordenes/:id/aprobar`, `/rechazar` | Decide una orden directa | Según la matriz |
| `POST /ordenes/:id/anular` | Anula si no tiene recepciones | ADMIN, COMPRADOR, JEFATURA_COMPRAS |
| `GET /ordenes/posibles-duplicados?estado=` | Sospechas y sus motivos | Todos |
| `PATCH /ordenes/posibles-duplicados/:id` | Confirma o descarta | ADMIN, JEFATURA_COMPRAS, AUDITOR |
| `GET /recepciones?limite=` | Lista | Todos |
| `POST /recepciones` | Recibe, crea entradas y actualiza la orden | ADMIN, BODEGUERO |

## Catálogos

| Método y ruta | Roles para crear |
|---|---|
| `GET`, `POST /categorias` | ADMIN, JEFATURA_COMPRAS |
| `GET`, `POST /areas` | ADMIN |
| `GET`, `POST /obras` | ADMIN, JEFATURA_AREA |
| `GET`, `POST /bodegas` | ADMIN, JEFATURA_AREA |
| `GET`, `POST /proveedores` | ADMIN, JEFATURA_COMPRAS |
| `GET /proveedores/sugerencia?materialId=` | Todos pueden consultar |

## Reportes y administración

| Método y ruta | Descripción | Roles |
|---|---|---|
| `GET /reportes/dashboard` | Indicadores y gráficos | Todos |
| `GET /reportes/inventario` | Niveles y stock por ubicación | Todos |
| `GET /reportes/consolidacion` | Ahorro por consolidación (A2) | Todos |
| `GET /reportes/fuga-valor?mes=AAAA-MM` | Fuga de valor y escenarios (A3) | Todos |
| `GET /reportes/conciliacion` | Saldo contra movimientos | Todos |
| `GET`, `POST /usuarios`, `PATCH /usuarios/:id`, `GET /usuarios/roles` | Gestión de usuarios | ADMIN |
| `GET /configuracion/parametros`, `/matriz` | Consulta de reglas | Todos |
| `PUT /configuracion/parametros/:clave`, `/matriz/:id` | Cambia reglas | ADMIN |
| `GET /configuracion/auditoria?entidad=&limite=` | Registro de auditoría | ADMIN, AUDITOR |
