# Construct Inventory

Control de inventario y compras para Constructora Del Valle S.A. Trabajo práctico del Quiz #2 de Gestión de Inventarios.

El sistema lleva el stock por material y bodega a partir de movimientos, avisa cuándo reponer, detecta posibles compras duplicadas y fraccionamiento, y aplica la matriz de aprobación por monto. Sus datos semilla reproducen las cifras de la Parte A.

## Tecnologías

Node.js 20 o superior, Express 5, Prisma 6, MySQL 8, React 19, Vite, Recharts, Jest y Supertest.

## Instalación

### 1. Crear la base de datos

Ejecute esto en MySQL Workbench con un usuario administrador, cambiando la contraseña:

```sql
CREATE DATABASE construct_inventory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE construct_inventory_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE construct_inventory_shadow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'inventario_app'@'localhost' IDENTIFIED BY 'cambie_esta_contrasena';
GRANT ALL PRIVILEGES ON construct_inventory.* TO 'inventario_app'@'localhost';
GRANT ALL PRIVILEGES ON construct_inventory_test.* TO 'inventario_app'@'localhost';
GRANT ALL PRIVILEGES ON construct_inventory_shadow.* TO 'inventario_app'@'localhost';
```

### 2. Backend

```bash
cd backend
npm install
```

Copie `backend/.env.example` como `backend/.env` y complete la contraseña y `JWT_SECRET`. Luego cree las tablas y cargue los datos:

```bash
npm run db:migrate
```

```bash
npm run db:seed
```

```bash
npm run dev
```

La API queda en `http://localhost:3000/api`.

### 3. Frontend

En otra terminal:

```bash
cd frontend
npm install
```

```bash
npm run dev
```

Abra `http://localhost:5173`.

## Usuarios de demostración

Son datos ficticios creados por la semilla. La contraseña de todos es `Demo2026!`, salvo que defina `SEED_PASSWORD`. No los use fuera de un entorno de prueba.

| Correo | Rol |
|---|---|
| `admin@delvalle.test` | Administración |
| `solicitante.obras@delvalle.test` | Solicitante de Obras |
| `jefe.obras@delvalle.test` | Jefatura de Obras |
| `jefe.mantenimiento@delvalle.test` | Jefatura de Mantenimiento |
| `comprador@delvalle.test` | Comprador |
| `jefe.compras@delvalle.test` | Jefatura de Compras |
| `finanzas@delvalle.test` | Gerencia Financiera |
| `gerencia@delvalle.test` | Gerencia General |
| `comite@delvalle.test` | Comité de compras |
| `bodega@delvalle.test` | Bodega |
| `auditor@delvalle.test` | Auditoría |

## Pruebas

Usan la base `construct_inventory_test`, nunca la de trabajo:

```bash
cd backend && npm test
```

## Comandos útiles

| Comando (en `backend/`) | Qué hace |
|---|---|
| `npm run db:demo` | Devuelve la base de desarrollo a los datos semilla. Borra lo registrado |
| `npm run db:export` | Regenera `database/schema.sql` y `database/seed.sql` |

## Estructura

```
backend/
  prisma/         esquema, migraciones y datos semilla
  src/
    config/       variables de entorno, base de datos y JWT
    routes/       URL, permisos y validación
    controllers/  traducen HTTP a llamadas de servicio
    services/     reglas de negocio
    validators/   esquemas de entrada
    middlewares/  autenticación, permisos y errores
    jobs/         revisión programada
  tests/          pruebas contra MySQL
  pruebas.http    peticiones de ejemplo
frontend/src/
  pages/ components/ context/ hooks/ services/ styles/ utils/ config/
database/         schema.sql y seed.sql generados
docs/             informe, diagramas, API, guion y presentación
```

## Reglas configurables

Se cambian en **Usuarios y configuración**, sin tocar el código.

| Regla | Valor inicial |
|---|---|
| Ventana para posibles duplicados | 3 días |
| Tolerancia de cantidad similar | 5 % |
| Ventana de acumulación por fraccionamiento | 15 días |
| Matriz de aprobación | Tramos del ejercicio A1 |

Una orden es posible duplicado si coincide con otra en proveedor y material, la cantidad difiere dentro de la tolerancia y las fechas caen en la ventana. El área y el precio definen la confianza. El sistema avisa y nunca bloquea la orden.

## Limitaciones conocidas

- La trazabilidad es documental: indica de qué orden vino cada entrada, pero no maneja lotes físicos.
- El flujo llega hasta la recepción. Factura y pago se describen en el informe, pero no están implementados.
- `npm audit` reporta una vulnerabilidad en una dependencia interna de la herramienta Prisma. Corregirla exige migrar a Prisma 7, y no afecta a datos de entrada de la API.

## Documentación

[Informe](docs/informe.pdf), [API](docs/API.md), [modelo de datos](docs/modelo-er.md), [guion del video](docs/guion-video.md), [presentación](docs/presentacion.pptx) y [auditoría contra la rúbrica](docs/auditoria-rubrica.md).

Este proyecto se desarrolló con asistencia de IA, como permite el enunciado.
