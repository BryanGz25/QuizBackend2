# Especificación corregida

El prompt inicial se ajustó frente al documento del profesor. Estas son las correcciones aplicadas.

## Frente al documento

| Tema | Prompt inicial | Aplicado |
|---|---|---|
| Gasto fuera de contrato | Exigía evidencia de exclusividad | Se usa la definición del documento: otro proveedor u otro precio. Se aclara que no prueba un incumplimiento legal |
| Equivalencias | Dudaba de todas | La evidencia cruzada de A2 y A3 las resuelve; solo “Hierro 3/8” queda por validar por el grado |
| Duplicados | Una orden sospechosa | Dos pares: OC-1041/1042 y OC-1050/1053 |
| Escenarios | Sin regla de suma | Se resta el sobreprecio de la orden duplicada para no contarlo dos veces |
| Fraccionamiento | Separado de A3 | Se muestra que los pares sospechosos cruzan el umbral de ₡2 000 000 |
| Mejoras a la matriz | Solo fraccionamiento | También separación de funciones, cotizaciones, contratos, emergencias y límites |

## Requisitos agregados

Stock mínimo y máximo, vale de salida como documento de origen, reglas configurables en tablas y requisición generada desde la alerta con proveedor sugerido.

## Decisiones de diseño

- Materiales normalizados y tabla `lineas_erp` para las 8 descripciones originales.
- Consumos ficticios en la semilla para conciliar lo recibido con el stock de A5.
- Punto de reorden contra el stock consolidado, con parámetros opcionales por bodega.
- `database/schema.sql` y `seed.sql` generados, para tener una sola fuente.
- Alertas evaluadas al registrar el movimiento, además de la revisión programada.
- Estructura de carpetas igual a la de los proyectos anteriores.

## Fuera de alcance

Lotes físicos, permisos individuales y registro de factura y pago. El circuito completo se analiza en el informe.

## Condición de alerta

El documento dice “cae por debajo” en un requisito, pero define el punto de reorden como el nivel “en el que se debe emitir una nueva orden”. Se usa stock ≤ PR por coincidir con esa definición.
