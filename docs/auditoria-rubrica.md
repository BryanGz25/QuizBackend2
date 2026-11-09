# Auditoría final contra la rúbrica

Fecha de la auditoría: 9 de noviembre de 2026.

| Criterio o requisito | Pts | Estado | Evidencia |
|---|---:|---|---|
| A1. Circuito, responsables y controles | 8 | COMPLETADO PERO NO VERIFICADO | Redactado en el informe; es análisis y lo valida el docente |
| A1. Matriz y fraccionamiento | | COMPLETADO Y VERIFICADO | Pruebas de umbrales, escalamiento y acumulación en `compras.test.js` |
| A2. Taxonomía y reclasificación | 8 | COMPLETADO Y VERIFICADO | Semilla `lineas_erp` y reporte de consolidación |
| A2. Ahorro de ₡89 000 | | COMPLETADO Y VERIFICADO | `casos-documento.test.js` |
| A3. Duplicados y sobreprecios | 10 | COMPLETADO Y VERIFICADO | `casos-documento.test.js` y `compras.test.js` |
| A3. Fuga y proyección | | COMPLETADO Y VERIFICADO | Escenarios ₡223 000, ₡1 483 000 y ₡2 467 000 |
| A4. Matriz de proveedores | 7 | COMPLETADO Y VERIFICADO | Pesos suman 100 % y puntajes recalculados con un script; las notas son ficticias |
| A5. SS, PR y prioridad | 7 | COMPLETADO Y VERIFICADO | `casos-documento.test.js` |
| B1. Materiales con mínimo, máximo y PR calculado | 20 | COMPLETADO Y VERIFICADO | `inventario.test.js` |
| B1. Movimientos y stock derivado | | COMPLETADO Y VERIFICADO | `inventario.test.js` y reporte de conciliación |
| B1. Alerta de reorden | | COMPLETADO Y VERIFICADO | `inventario.test.js` y recorrido en navegador |
| B1. Detección de duplicados | | COMPLETADO Y VERIFICADO | `compras.test.js` |
| B1. Trazabilidad | | COMPLETADO Y VERIFICADO | `inventario.test.js` y recorrido en navegador |
| B2. Modelo normalizado e histórico | 12 | COMPLETADO Y VERIFICADO | 25 tablas migradas en MySQL 8.0.46 |
| B2. Scripts SQL y semilla | | COMPLETADO Y VERIFICADO | `schema.sql` y `seed.sql` cargados en una base vacía: 25 tablas, 7 órdenes, cemento en 190 |
| B3. Reglas claras y configurables | 12 | COMPLETADO Y VERIFICADO | Pruebas de cambio de matriz, tolerancia y ventana |
| B3. Casos borde | | COMPLETADO Y VERIFICADO | Concurrencia, límites exactos e idempotencia |
| B4. Código ordenado y errores centralizados | 8 | COMPLETADO Y VERIFICADO | Capas iguales a los proyectos anteriores |
| B4. Credenciales fuera del repositorio | | COMPLETADO Y VERIFICADO | `.env` y `setup-local.sql` ignorados por Git; búsqueda de la contraseña sin resultados |
| B4. README reproducible | | COMPLETADO PERO NO VERIFICADO | Los comandos se usaron por separado; falta probarlo desde una clonación limpia |
| B5. Guion del video | 8 | COMPLETADO PERO NO VERIFICADO | `guion-video.md`; cada paso se probó, pero no se cronometró |
| B5. Video grabado | | PENDIENTE | Debe grabarlo el estudiante |
| B5. Presentación | | COMPLETADO Y VERIFICADO | 9 diapositivas con notas y tiempos; revisadas en PowerPoint |
| Extra: dashboard | | COMPLETADO Y VERIFICADO | 13 secciones recorridas sin errores de consola |
| Extra: matriz en el sistema | | COMPLETADO Y VERIFICADO | Recorrido con cuatro roles y pruebas |
| Extra: pruebas automatizadas | | COMPLETADO Y VERIFICADO | 77 pruebas pasadas en 5 ejecuciones seguidas |
| Extra: integración | | COMPLETADO Y VERIFICADO | Alerta, requisición y proveedor sugerido |
| Informe de máximo 15 páginas | | COMPLETADO Y VERIFICADO | 9 páginas |
| Datos de la portada | | PENDIENTE | Faltan nombre, curso y docente |
| Repositorio publicado en GitHub | | PENDIENTE | Conectado; falta publicar los cambios |

## Observaciones

- Una ejecución de la suite excedió el tiempo de espera al reiniciar la base de pruebas mientras la computadora ejecutaba otras tareas. No falló ninguna regla, y las 5 ejecuciones siguientes pasaron sin bloqueos en MySQL. La causa no quedó confirmada.
- El enunciado pide equipos de 2 a 4 personas. Una entrega individual debe confirmarse con el docente.
- Factura y pago se analizan en el informe, pero no se implementaron: no son requisito de la Opción 2.
