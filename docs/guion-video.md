# Guion del video demo (máximo 5 minutos)

**Antes de grabar:** ejecute `npm run db:demo` en `backend/`, y deje abiertos MySQL Workbench, la terminal de la API y el navegador.

| Tiempo | En pantalla | Qué decir | Valor para la empresa |
|---|---|---|---|
| 0:00 a 0:25 | Terminal con `Conectado a MySQL` y Workbench con las tablas | “Este es Construct Inventory, conectado a una base MySQL real. La API confirma la conexión al iniciar.” | Los datos son persistentes y verificables |
| 0:25 a 0:50 | Iniciar sesión con `bodega`. Resumen | “El resumen muestra qué requiere atención. Arena y Block están bajo su punto de reorden, marcados con franjas.” | Decidir hoy qué reponer sin revisar hojas de cálculo |
| 0:50 a 1:15 | Materiales | “El stock no se digita. El punto de reorden se calcula: el cemento tiene 45 de seguridad y 165 de reorden.” | Nadie puede maquillar existencias |
| 1:15 a 1:55 | Movimientos: salida de 30 sacos de cemento, Bodega Central, vale VS-100 | “Registro una salida. El stock baja de 190 a 160 y, al cruzar 165, el sistema abre una alerta.” | La reposición se dispara sola |
| 1:55 a 2:05 | Intentar una salida de 500 sacos | “Si pido más de lo que hay, el sistema lo rechaza.” | Inventario siempre consistente |
| 2:05 a 2:30 | Alertas: Generar requisición, 2 cotizaciones | “Desde la alerta genero la requisición. El sistema calcula la cantidad y propone al Proveedor A, con precio de contrato.” | Se compra al mejor precio conocido |
| 2:30 a 3:15 | Entrar como `finanzas`: Aprobaciones vacío. Entrar como `jefe.compras`: Aprobar | “El monto es ₡1 795 500, así que aprueba la Jefatura de Compras. Finanzas ni siquiera tiene este documento en su bandeja.” | Cada gasto lo autoriza quien corresponde |
| 3:15 a 3:55 | Entrar como `admin`. Órdenes de compra, Posibles duplicados | “Aquí hay dos pares sospechosos, con los motivos. OC-1041 y OC-1042 son idénticas. Juntas también habrían exigido Gerencia Financiera. El sistema avisa, y una persona decide.” | Detecta fuga sin frenar compras legítimas |
| 3:55 a 4:25 | Trazabilidad: Cemento gris 50 kg | “Para cada entrada veo orden, proveedor, recepción y responsable, y después todos los movimientos.” | Responder de dónde vino cada existencia |
| 4:25 a 4:50 | Reportes: Fuga de valor, Conciliación | “Los reportes recalculan la Parte A: ₡223 000 de sobreprecio y hasta ₡2 467 000 si se confirman los duplicados. La conciliación demuestra que el saldo coincide con los movimientos.” | Dirección ve el dinero en juego |
| 4:50 a 5:00 | Resumen | “Eso es Construct Inventory: saber cuánto hay, cuándo reponer y de dónde vino.” | Cierre |

Los usuarios de demostración y su contraseña están en el README.
