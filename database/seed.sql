-- Generado por npm run db:export. Datos del documento y datos ficticios de prueba.
SET FOREIGN_KEY_CHECKS=0;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: construct_inventory
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `alertas`
--

LOCK TABLES `alertas` WRITE;
/*!40000 ALTER TABLE `alertas` DISABLE KEYS */;
INSERT INTO `alertas` (`id`, `material_id`, `bodega_id`, `stock_actual`, `punto_reorden`, `faltante`, `prioridad`, `estado`, `clave_activa`, `comentario`, `creada_en`, `actualizada_en`, `cerrada_en`) VALUES (1,3,NULL,2800.000,3600.000,800.000,'ALTA','PENDIENTE','R:3:0',NULL,'2026-11-09 19:41:41.245','2026-11-09 19:41:41.245',NULL);
INSERT INTO `alertas` (`id`, `material_id`, `bodega_id`, `stock_actual`, `punto_reorden`, `faltante`, `prioridad`, `estado`, `clave_activa`, `comentario`, `creada_en`, `actualizada_en`, `cerrada_en`) VALUES (2,4,NULL,14.000,20.000,6.000,'ALTA','PENDIENTE','R:4:0',NULL,'2026-11-09 19:41:41.253','2026-11-09 19:41:41.253',NULL);
/*!40000 ALTER TABLE `alertas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `aprobaciones`
--

LOCK TABLES `aprobaciones` WRITE;
/*!40000 ALTER TABLE `aprobaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `aprobaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `areas`
--

LOCK TABLES `areas` WRITE;
/*!40000 ALTER TABLE `areas` DISABLE KEYS */;
INSERT INTO `areas` (`id`, `nombre`) VALUES (3,'Bodega Central');
INSERT INTO `areas` (`id`, `nombre`) VALUES (2,'Mantenimiento');
INSERT INTO `areas` (`id`, `nombre`) VALUES (1,'Obras');
/*!40000 ALTER TABLE `areas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `auditoria`
--

LOCK TABLES `auditoria` WRITE;
/*!40000 ALTER TABLE `auditoria` DISABLE KEYS */;
INSERT INTO `auditoria` (`id`, `usuario_id`, `accion`, `entidad`, `entidad_id`, `antes`, `despues`, `creado_en`) VALUES (1,10,'MOVIMIENTO_ENTRADA','movimientos','1',NULL,'{\"id\": 1, \"tipo\": \"ENTRADA\", \"cantidad\": \"200\", \"creado_en\": \"2026-11-09T19:41:41.089Z\", \"usuario_id\": 10, \"material_id\": 1, \"observaciones\": null, \"documento_tipo\": \"ORDEN_COMPRA\", \"orden_compra_id\": 1041, \"bodega_origen_id\": null, \"documento_numero\": \"OC-1041\", \"fecha_movimiento\": \"2026-10-03T00:00:00.000Z\", \"bodega_destino_id\": 1, \"clave_idempotencia\": \"semilla-oc-1041\", \"detalle_recepcion_id\": 1}','2026-11-09 19:41:41.092');
INSERT INTO `auditoria` (`id`, `usuario_id`, `accion`, `entidad`, `entidad_id`, `antes`, `despues`, `creado_en`) VALUES (2,10,'MOVIMIENTO_ENTRADA','movimientos','2',NULL,'{\"id\": 2, \"tipo\": \"ENTRADA\", \"cantidad\": \"200\", \"creado_en\": \"2026-11-09T19:41:41.104Z\", \"usuario_id\": 10, \"material_id\": 1, \"observaciones\": null, \"documento_tipo\": \"ORDEN_COMPRA\", \"orden_compra_id\": 1042, \"bodega_origen_id\": null, \"documento_numero\": \"OC-1042\", \"fecha_movimiento\": \"2026-10-03T00:00:00.000Z\", \"bodega_destino_id\": 1, \"clave_idempotencia\": \"semilla-oc-1042\", \"detalle_recepcion_id\": 2}','2026-11-09 19:41:41.105');
INSERT INTO `auditoria` (`id`, `usuario_id`, `accion`, `entidad`, `entidad_id`, `antes`, `despues`, `creado_en`) VALUES (3,10,'MOVIMIENTO_ENTRADA','movimientos','3',NULL,'{\"id\": 3, \"tipo\": \"ENTRADA\", \"cantidad\": \"40\", \"creado_en\": \"2026-11-09T19:41:41.118Z\", \"usuario_id\": 10, \"material_id\": 1, \"observaciones\": null, \"documento_tipo\": \"ORDEN_COMPRA\", \"orden_compra_id\": 1047, \"bodega_origen_id\": null, \"documento_numero\": \"OC-1047\", \"fecha_movimiento\": \"2026-10-07T00:00:00.000Z\", \"bodega_destino_id\": 1, \"clave_idempotencia\": \"semilla-oc-1047\", \"detalle_recepcion_id\": 3}','2026-11-09 19:41:41.119');
INSERT INTO `auditoria` (`id`, `usuario_id`, `accion`, `entidad`, `entidad_id`, `antes`, `despues`, `creado_en`) VALUES (4,10,'MOVIMIENTO_ENTRADA','movimientos','4',NULL,'{\"id\": 4, \"tipo\": \"ENTRADA\", \"cantidad\": \"500\", \"creado_en\": \"2026-11-09T19:41:41.134Z\", \"usuario_id\": 10, \"material_id\": 2, \"observaciones\": null, \"documento_tipo\": \"ORDEN_COMPRA\", \"orden_compra_id\": 1050, \"bodega_origen_id\": null, \"documento_numero\": \"OC-1050\", \"fecha_movimiento\": \"2026-10-09T00:00:00.000Z\", \"bodega_destino_id\": 1, \"clave_idempotencia\": \"semilla-oc-1050\", \"detalle_recepcion_id\": 4}','2026-11-09 19:41:41.135');
INSERT INTO `auditoria` (`id`, `usuario_id`, `accion`, `entidad`, `entidad_id`, `antes`, `despues`, `creado_en`) VALUES (5,10,'MOVIMIENTO_ENTRADA','movimientos','5',NULL,'{\"id\": 5, \"tipo\": \"ENTRADA\", \"cantidad\": \"480\", \"creado_en\": \"2026-11-09T19:41:41.150Z\", \"usuario_id\": 10, \"material_id\": 2, \"observaciones\": null, \"documento_tipo\": \"ORDEN_COMPRA\", \"orden_compra_id\": 1053, \"bodega_origen_id\": null, \"documento_numero\": \"OC-1053\", \"fecha_movimiento\": \"2026-10-10T00:00:00.000Z\", \"bodega_destino_id\": 1, \"clave_idempotencia\": \"semilla-oc-1053\", \"detalle_recepcion_id\": 5}','2026-11-09 19:41:41.151');
INSERT INTO `auditoria` (`id`, `usuario_id`, `accion`, `entidad`, `entidad_id`, `antes`, `despues`, `creado_en`) VALUES (6,10,'MOVIMIENTO_ENTRADA','movimientos','6',NULL,'{\"id\": 6, \"tipo\": \"ENTRADA\", \"cantidad\": \"60\", \"creado_en\": \"2026-11-09T19:41:41.166Z\", \"usuario_id\": 10, \"material_id\": 2, \"observaciones\": null, \"documento_tipo\": \"ORDEN_COMPRA\", \"orden_compra_id\": 1058, \"bodega_origen_id\": null, \"documento_numero\": \"OC-1058\", \"fecha_movimiento\": \"2026-10-14T00:00:00.000Z\", \"bodega_destino_id\": 1, \"clave_idempotencia\": \"semilla-oc-1058\", \"detalle_recepcion_id\": 6}','2026-11-09 19:41:41.168');
INSERT INTO `auditoria` (`id`, `usuario_id`, `accion`, `entidad`, `entidad_id`, `antes`, `despues`, `creado_en`) VALUES (7,10,'MOVIMIENTO_ENTRADA','movimientos','7',NULL,'{\"id\": 7, \"tipo\": \"ENTRADA\", \"cantidad\": \"300\", \"creado_en\": \"2026-11-09T19:41:41.183Z\", \"usuario_id\": 10, \"material_id\": 1, \"observaciones\": null, \"documento_tipo\": \"ORDEN_COMPRA\", \"orden_compra_id\": 1061, \"bodega_origen_id\": null, \"documento_numero\": \"OC-1061\", \"fecha_movimiento\": \"2026-10-16T00:00:00.000Z\", \"bodega_destino_id\": 1, \"clave_idempotencia\": \"semilla-oc-1061\", \"detalle_recepcion_id\": 7}','2026-11-09 19:41:41.185');
INSERT INTO `auditoria` (`id`, `usuario_id`, `accion`, `entidad`, `entidad_id`, `antes`, `despues`, `creado_en`) VALUES (8,10,'MOVIMIENTO_SALIDA','movimientos','8',NULL,'{\"id\": 8, \"tipo\": \"SALIDA\", \"cantidad\": \"550\", \"creado_en\": \"2026-11-09T19:41:41.194Z\", \"usuario_id\": 10, \"material_id\": 1, \"observaciones\": \"Dato semilla ficticio: consumo acumulado de octubre para conciliar con el stock de A5.\", \"documento_tipo\": \"VALE_SALIDA\", \"orden_compra_id\": null, \"bodega_origen_id\": 1, \"documento_numero\": \"VS-SEMILLA-MAT-CEM-GRIS50\", \"fecha_movimiento\": \"2026-10-31T00:00:00.000Z\", \"bodega_destino_id\": null, \"clave_idempotencia\": \"semilla-consumo-MAT-CEM-GRIS50\", \"detalle_recepcion_id\": null}','2026-11-09 19:41:41.196');
INSERT INTO `auditoria` (`id`, `usuario_id`, `accion`, `entidad`, `entidad_id`, `antes`, `despues`, `creado_en`) VALUES (9,10,'MOVIMIENTO_SALIDA','movimientos','9',NULL,'{\"id\": 9, \"tipo\": \"SALIDA\", \"cantidad\": \"190\", \"creado_en\": \"2026-11-09T19:41:41.206Z\", \"usuario_id\": 10, \"material_id\": 2, \"observaciones\": \"Dato semilla ficticio: consumo acumulado de octubre para conciliar con el stock de A5.\", \"documento_tipo\": \"VALE_SALIDA\", \"orden_compra_id\": null, \"bodega_origen_id\": 1, \"documento_numero\": \"VS-SEMILLA-MAT-ACE-VAR3G40\", \"fecha_movimiento\": \"2026-10-31T00:00:00.000Z\", \"bodega_destino_id\": null, \"clave_idempotencia\": \"semilla-consumo-MAT-ACE-VAR3G40\", \"detalle_recepcion_id\": null}','2026-11-09 19:41:41.207');
INSERT INTO `auditoria` (`id`, `usuario_id`, `accion`, `entidad`, `entidad_id`, `antes`, `despues`, `creado_en`) VALUES (10,10,'MOVIMIENTO_ENTRADA','movimientos','10',NULL,'{\"id\": 10, \"tipo\": \"ENTRADA\", \"cantidad\": \"2800\", \"creado_en\": \"2026-11-09T19:41:41.216Z\", \"usuario_id\": 10, \"material_id\": 3, \"observaciones\": \"Stock actual del ejercicio A5.\", \"documento_tipo\": \"CARGA_INICIAL\", \"orden_compra_id\": null, \"bodega_origen_id\": null, \"documento_numero\": \"CI-MAT-MAM-BLK122040\", \"fecha_movimiento\": \"2026-10-31T00:00:00.000Z\", \"bodega_destino_id\": 1, \"clave_idempotencia\": \"semilla-inicial-MAT-MAM-BLK122040\", \"detalle_recepcion_id\": null}','2026-11-09 19:41:41.217');
INSERT INTO `auditoria` (`id`, `usuario_id`, `accion`, `entidad`, `entidad_id`, `antes`, `despues`, `creado_en`) VALUES (11,10,'MOVIMIENTO_ENTRADA','movimientos','11',NULL,'{\"id\": 11, \"tipo\": \"ENTRADA\", \"cantidad\": \"14\", \"creado_en\": \"2026-11-09T19:41:41.224Z\", \"usuario_id\": 10, \"material_id\": 4, \"observaciones\": \"Stock actual del ejercicio A5.\", \"documento_tipo\": \"CARGA_INICIAL\", \"orden_compra_id\": null, \"bodega_origen_id\": null, \"documento_numero\": \"CI-MAT-CEM-ARENA\", \"fecha_movimiento\": \"2026-10-31T00:00:00.000Z\", \"bodega_destino_id\": 1, \"clave_idempotencia\": \"semilla-inicial-MAT-CEM-ARENA\", \"detalle_recepcion_id\": null}','2026-11-09 19:41:41.225');
/*!40000 ALTER TABLE `auditoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `bodegas`
--

LOCK TABLES `bodegas` WRITE;
/*!40000 ALTER TABLE `bodegas` DISABLE KEYS */;
INSERT INTO `bodegas` (`id`, `codigo`, `nombre`, `obra_id`, `activa`) VALUES (1,'BOD-CENTRAL','Bodega Central',NULL,1);
INSERT INTO `bodegas` (`id`, `codigo`, `nombre`, `obra_id`, `activa`) VALUES (2,'BOD-ROBLES','Bodega Los Robles',1,1);
INSERT INTO `bodegas` (`id`, `codigo`, `nombre`, `obra_id`, `activa`) VALUES (3,'BOD-NORTE','Bodega Plaza Norte',2,1);
/*!40000 ALTER TABLE `bodegas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` (`id`, `codigo`, `nombre`, `padre_id`) VALUES (1,'MAT','Materiales de construcción',NULL);
INSERT INTO `categorias` (`id`, `codigo`, `nombre`, `padre_id`) VALUES (2,'MAT-CEM','Cemento y agregados',1);
INSERT INTO `categorias` (`id`, `codigo`, `nombre`, `padre_id`) VALUES (3,'MAT-ACE','Acero de refuerzo',1);
INSERT INTO `categorias` (`id`, `codigo`, `nombre`, `padre_id`) VALUES (4,'MAT-MAM','Mampostería',1);
INSERT INTO `categorias` (`id`, `codigo`, `nombre`, `padre_id`) VALUES (5,'EPP','Equipo de protección personal',NULL);
INSERT INTO `categorias` (`id`, `codigo`, `nombre`, `padre_id`) VALUES (6,'EPP-MAN','Protección de manos',5);
INSERT INTO `categorias` (`id`, `codigo`, `nombre`, `padre_id`) VALUES (7,'PLO','Plomería',NULL);
INSERT INTO `categorias` (`id`, `codigo`, `nombre`, `padre_id`) VALUES (8,'PLO-TUB','Tubería',7);
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `contratos_precio`
--

LOCK TABLES `contratos_precio` WRITE;
/*!40000 ALTER TABLE `contratos_precio` DISABLE KEYS */;
INSERT INTO `contratos_precio` (`id`, `proveedor_id`, `material_id`, `precio`, `vigente_desde`, `vigente_hasta`) VALUES (1,1,1,6300.00,'2026-01-01',NULL);
INSERT INTO `contratos_precio` (`id`, `proveedor_id`, `material_id`, `precio`, `vigente_desde`, `vigente_hasta`) VALUES (2,1,2,2050.00,'2026-01-01',NULL);
/*!40000 ALTER TABLE `contratos_precio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `detalle_orden_compra`
--

LOCK TABLES `detalle_orden_compra` WRITE;
/*!40000 ALTER TABLE `detalle_orden_compra` DISABLE KEYS */;
INSERT INTO `detalle_orden_compra` (`id`, `orden_compra_id`, `material_id`, `cantidad`, `precio_unitario`) VALUES (1,1041,1,200.000,6450.00);
INSERT INTO `detalle_orden_compra` (`id`, `orden_compra_id`, `material_id`, `cantidad`, `precio_unitario`) VALUES (2,1042,1,200.000,6450.00);
INSERT INTO `detalle_orden_compra` (`id`, `orden_compra_id`, `material_id`, `cantidad`, `precio_unitario`) VALUES (3,1047,1,40.000,7100.00);
INSERT INTO `detalle_orden_compra` (`id`, `orden_compra_id`, `material_id`, `cantidad`, `precio_unitario`) VALUES (4,1050,2,500.000,2150.00);
INSERT INTO `detalle_orden_compra` (`id`, `orden_compra_id`, `material_id`, `cantidad`, `precio_unitario`) VALUES (5,1053,2,480.000,2150.00);
INSERT INTO `detalle_orden_compra` (`id`, `orden_compra_id`, `material_id`, `cantidad`, `precio_unitario`) VALUES (6,1058,2,60.000,2600.00);
INSERT INTO `detalle_orden_compra` (`id`, `orden_compra_id`, `material_id`, `cantidad`, `precio_unitario`) VALUES (7,1061,1,300.000,6300.00);
/*!40000 ALTER TABLE `detalle_orden_compra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `detalle_recepciones`
--

LOCK TABLES `detalle_recepciones` WRITE;
/*!40000 ALTER TABLE `detalle_recepciones` DISABLE KEYS */;
INSERT INTO `detalle_recepciones` (`id`, `recepcion_id`, `detalle_orden_id`, `cantidad_recibida`) VALUES (1,1,1,200.000);
INSERT INTO `detalle_recepciones` (`id`, `recepcion_id`, `detalle_orden_id`, `cantidad_recibida`) VALUES (2,2,2,200.000);
INSERT INTO `detalle_recepciones` (`id`, `recepcion_id`, `detalle_orden_id`, `cantidad_recibida`) VALUES (3,3,3,40.000);
INSERT INTO `detalle_recepciones` (`id`, `recepcion_id`, `detalle_orden_id`, `cantidad_recibida`) VALUES (4,4,4,500.000);
INSERT INTO `detalle_recepciones` (`id`, `recepcion_id`, `detalle_orden_id`, `cantidad_recibida`) VALUES (5,5,5,480.000);
INSERT INTO `detalle_recepciones` (`id`, `recepcion_id`, `detalle_orden_id`, `cantidad_recibida`) VALUES (6,6,6,60.000);
INSERT INTO `detalle_recepciones` (`id`, `recepcion_id`, `detalle_orden_id`, `cantidad_recibida`) VALUES (7,7,7,300.000);
/*!40000 ALTER TABLE `detalle_recepciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `detalle_requisicion`
--

LOCK TABLES `detalle_requisicion` WRITE;
/*!40000 ALTER TABLE `detalle_requisicion` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_requisicion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `inventario`
--

LOCK TABLES `inventario` WRITE;
/*!40000 ALTER TABLE `inventario` DISABLE KEYS */;
INSERT INTO `inventario` (`material_id`, `bodega_id`, `cantidad`, `actualizado_en`) VALUES (1,1,190.000,'2026-11-09 19:41:41.192');
INSERT INTO `inventario` (`material_id`, `bodega_id`, `cantidad`, `actualizado_en`) VALUES (2,1,850.000,'2026-11-09 19:41:41.205');
INSERT INTO `inventario` (`material_id`, `bodega_id`, `cantidad`, `actualizado_en`) VALUES (3,1,2800.000,'2026-11-09 19:41:41.214');
INSERT INTO `inventario` (`material_id`, `bodega_id`, `cantidad`, `actualizado_en`) VALUES (4,1,14.000,'2026-11-09 19:41:41.223');
/*!40000 ALTER TABLE `inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `lineas_erp`
--

LOCK TABLES `lineas_erp` WRITE;
/*!40000 ALTER TABLE `lineas_erp` DISABLE KEYS */;
INSERT INTO `lineas_erp` (`id`, `numero`, `descripcion_erp`, `area_id`, `proveedor_id`, `cantidad`, `precio_unitario`, `material_id`, `estado_equivalencia`, `justificacion`) VALUES (1,1,'Cemento gris 50 kg',1,1,200.000,6450.00,1,'EQUIVALENTE','Descripción estándar del insumo.');
INSERT INTO `lineas_erp` (`id`, `numero`, `descripcion_erp`, `area_id`, `proveedor_id`, `cantidad`, `precio_unitario`, `material_id`, `estado_equivalencia`, `justificacion`) VALUES (2,2,'Saco cemento uso general',2,2,40.000,7100.00,1,'EQUIVALENTE','En A3 la misma compra (Prov. B, 40 a ₡7 100) figura como Cemento gris 50 kg.');
INSERT INTO `lineas_erp` (`id`, `numero`, `descripcion_erp`, `area_id`, `proveedor_id`, `cantidad`, `precio_unitario`, `material_id`, `estado_equivalencia`, `justificacion`) VALUES (3,3,'CEM-GRIS-50',3,1,300.000,6300.00,1,'EQUIVALENTE','El código interno describe cemento gris de 50 kg; en A3 figura como tal (OC-1061).');
INSERT INTO `lineas_erp` (`id`, `numero`, `descripcion_erp`, `area_id`, `proveedor_id`, `cantidad`, `precio_unitario`, `material_id`, `estado_equivalencia`, `justificacion`) VALUES (4,4,'Varilla #3 grado 40',1,3,500.000,2150.00,2,'EQUIVALENTE','Descripción estándar del insumo.');
INSERT INTO `lineas_erp` (`id`, `numero`, `descripcion_erp`, `area_id`, `proveedor_id`, `cantidad`, `precio_unitario`, `material_id`, `estado_equivalencia`, `justificacion`) VALUES (5,5,'Hierro 3/8 x 6 m',2,4,60.000,2600.00,2,'EQUIVALENTE_POR_VALIDAR','En A3 figura como Varilla #3 y #3 equivale a 3/8\", pero la descripción no indica el grado 40: validar la ficha técnica.');
INSERT INTO `lineas_erp` (`id`, `numero`, `descripcion_erp`, `area_id`, `proveedor_id`, `cantidad`, `precio_unitario`, `material_id`, `estado_equivalencia`, `justificacion`) VALUES (6,6,'Guantes de nitrilo talla L',3,5,100.000,850.00,5,'SIN_EQUIVALENTE','El nitrilo protege contra químicos; no sustituye a un guante de trabajo.');
INSERT INTO `lineas_erp` (`id`, `numero`, `descripcion_erp`, `area_id`, `proveedor_id`, `cantidad`, `precio_unitario`, `material_id`, `estado_equivalencia`, `justificacion`) VALUES (7,7,'Guantes trabajo L',1,6,80.000,1200.00,6,'SIN_EQUIVALENTE','Guante mecánico de uso general; no equivale al de nitrilo.');
INSERT INTO `lineas_erp` (`id`, `numero`, `descripcion_erp`, `area_id`, `proveedor_id`, `cantidad`, `precio_unitario`, `material_id`, `estado_equivalencia`, `justificacion`) VALUES (8,8,'Tubo PVC 1/2 SDR 13.5',2,2,25.000,2900.00,7,'SIN_EQUIVALENTE','Único artículo de su tipo en el extracto.');
/*!40000 ALTER TABLE `lineas_erp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `materiales`
--

LOCK TABLES `materiales` WRITE;
/*!40000 ALTER TABLE `materiales` DISABLE KEYS */;
INSERT INTO `materiales` (`id`, `codigo`, `nombre`, `unidad`, `categoria_id`, `stock_minimo`, `stock_maximo`, `demanda_promedio_dia`, `demanda_maxima_dia`, `tiempo_entrega_dias`, `activo`, `creado_en`, `actualizado_en`) VALUES (1,'MAT-CEM-GRIS50','Cemento gris 50 kg','saco',2,45.000,445.000,40.000,55.000,3,1,'2026-11-09 19:41:41.008','2026-11-09 19:41:41.008');
INSERT INTO `materiales` (`id`, `codigo`, `nombre`, `unidad`, `categoria_id`, `stock_minimo`, `stock_maximo`, `demanda_promedio_dia`, `demanda_maxima_dia`, `tiempo_entrega_dias`, `activo`, `creado_en`, `actualizado_en`) VALUES (2,'MAT-ACE-VAR3G40','Varilla #3 grado 40','unidad',3,200.000,1640.000,120.000,160.000,5,1,'2026-11-09 19:41:41.013','2026-11-09 19:41:41.013');
INSERT INTO `materiales` (`id`, `codigo`, `nombre`, `unidad`, `categoria_id`, `stock_minimo`, `stock_maximo`, `demanda_promedio_dia`, `demanda_maxima_dia`, `tiempo_entrega_dias`, `activo`, `creado_en`, `actualizado_en`) VALUES (3,'MAT-MAM-BLK122040','Block 12 × 20 × 40','unidad',4,1200.000,7800.000,600.000,900.000,4,1,'2026-11-09 19:41:41.019','2026-11-09 19:41:41.019');
INSERT INTO `materiales` (`id`, `codigo`, `nombre`, `unidad`, `categoria_id`, `stock_minimo`, `stock_maximo`, `demanda_promedio_dia`, `demanda_maxima_dia`, `tiempo_entrega_dias`, `activo`, `creado_en`, `actualizado_en`) VALUES (4,'MAT-CEM-ARENA','Arena','m³',2,8.000,62.000,6.000,10.000,2,1,'2026-11-09 19:41:41.024','2026-11-09 19:41:41.024');
INSERT INTO `materiales` (`id`, `codigo`, `nombre`, `unidad`, `categoria_id`, `stock_minimo`, `stock_maximo`, `demanda_promedio_dia`, `demanda_maxima_dia`, `tiempo_entrega_dias`, `activo`, `creado_en`, `actualizado_en`) VALUES (5,'EPP-MAN-NITL','Guante de nitrilo talla L','par',6,NULL,NULL,NULL,NULL,NULL,1,'2026-11-09 19:41:41.028','2026-11-09 19:41:41.028');
INSERT INTO `materiales` (`id`, `codigo`, `nombre`, `unidad`, `categoria_id`, `stock_minimo`, `stock_maximo`, `demanda_promedio_dia`, `demanda_maxima_dia`, `tiempo_entrega_dias`, `activo`, `creado_en`, `actualizado_en`) VALUES (6,'EPP-MAN-TRAL','Guante de trabajo talla L','par',6,NULL,NULL,NULL,NULL,NULL,1,'2026-11-09 19:41:41.032','2026-11-09 19:41:41.032');
INSERT INTO `materiales` (`id`, `codigo`, `nombre`, `unidad`, `categoria_id`, `stock_minimo`, `stock_maximo`, `demanda_promedio_dia`, `demanda_maxima_dia`, `tiempo_entrega_dias`, `activo`, `creado_en`, `actualizado_en`) VALUES (7,'PLO-TUB-PVC12SDR135','Tubo PVC 1/2 SDR 13.5','unidad',8,NULL,NULL,NULL,NULL,NULL,1,'2026-11-09 19:41:41.036','2026-11-09 19:41:41.036');
/*!40000 ALTER TABLE `materiales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `matriz_aprobacion`
--

LOCK TABLES `matriz_aprobacion` WRITE;
/*!40000 ALTER TABLE `matriz_aprobacion` DISABLE KEYS */;
INSERT INTO `matriz_aprobacion` (`id`, `orden`, `monto_hasta`, `rol_aprobador_id`, `cotizaciones_requeridas`, `requiere_comite`) VALUES (1,1,250000.00,3,1,0);
INSERT INTO `matriz_aprobacion` (`id`, `orden`, `monto_hasta`, `rol_aprobador_id`, `cotizaciones_requeridas`, `requiere_comite`) VALUES (2,2,2000000.00,5,2,0);
INSERT INTO `matriz_aprobacion` (`id`, `orden`, `monto_hasta`, `rol_aprobador_id`, `cotizaciones_requeridas`, `requiere_comite`) VALUES (3,3,10000000.00,6,3,0);
INSERT INTO `matriz_aprobacion` (`id`, `orden`, `monto_hasta`, `rol_aprobador_id`, `cotizaciones_requeridas`, `requiere_comite`) VALUES (4,4,NULL,7,3,1);
/*!40000 ALTER TABLE `matriz_aprobacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `movimientos`
--

LOCK TABLES `movimientos` WRITE;
/*!40000 ALTER TABLE `movimientos` DISABLE KEYS */;
INSERT INTO `movimientos` (`id`, `tipo`, `material_id`, `cantidad`, `bodega_origen_id`, `bodega_destino_id`, `fecha_movimiento`, `usuario_id`, `documento_tipo`, `documento_numero`, `orden_compra_id`, `detalle_recepcion_id`, `observaciones`, `clave_idempotencia`, `creado_en`) VALUES (1,'ENTRADA',1,200.000,NULL,1,'2026-10-03 00:00:00.000',10,'ORDEN_COMPRA','OC-1041',1041,1,NULL,'semilla-oc-1041','2026-11-09 19:41:41.089');
INSERT INTO `movimientos` (`id`, `tipo`, `material_id`, `cantidad`, `bodega_origen_id`, `bodega_destino_id`, `fecha_movimiento`, `usuario_id`, `documento_tipo`, `documento_numero`, `orden_compra_id`, `detalle_recepcion_id`, `observaciones`, `clave_idempotencia`, `creado_en`) VALUES (2,'ENTRADA',1,200.000,NULL,1,'2026-10-03 00:00:00.000',10,'ORDEN_COMPRA','OC-1042',1042,2,NULL,'semilla-oc-1042','2026-11-09 19:41:41.104');
INSERT INTO `movimientos` (`id`, `tipo`, `material_id`, `cantidad`, `bodega_origen_id`, `bodega_destino_id`, `fecha_movimiento`, `usuario_id`, `documento_tipo`, `documento_numero`, `orden_compra_id`, `detalle_recepcion_id`, `observaciones`, `clave_idempotencia`, `creado_en`) VALUES (3,'ENTRADA',1,40.000,NULL,1,'2026-10-07 00:00:00.000',10,'ORDEN_COMPRA','OC-1047',1047,3,NULL,'semilla-oc-1047','2026-11-09 19:41:41.118');
INSERT INTO `movimientos` (`id`, `tipo`, `material_id`, `cantidad`, `bodega_origen_id`, `bodega_destino_id`, `fecha_movimiento`, `usuario_id`, `documento_tipo`, `documento_numero`, `orden_compra_id`, `detalle_recepcion_id`, `observaciones`, `clave_idempotencia`, `creado_en`) VALUES (4,'ENTRADA',2,500.000,NULL,1,'2026-10-09 00:00:00.000',10,'ORDEN_COMPRA','OC-1050',1050,4,NULL,'semilla-oc-1050','2026-11-09 19:41:41.134');
INSERT INTO `movimientos` (`id`, `tipo`, `material_id`, `cantidad`, `bodega_origen_id`, `bodega_destino_id`, `fecha_movimiento`, `usuario_id`, `documento_tipo`, `documento_numero`, `orden_compra_id`, `detalle_recepcion_id`, `observaciones`, `clave_idempotencia`, `creado_en`) VALUES (5,'ENTRADA',2,480.000,NULL,1,'2026-10-10 00:00:00.000',10,'ORDEN_COMPRA','OC-1053',1053,5,NULL,'semilla-oc-1053','2026-11-09 19:41:41.150');
INSERT INTO `movimientos` (`id`, `tipo`, `material_id`, `cantidad`, `bodega_origen_id`, `bodega_destino_id`, `fecha_movimiento`, `usuario_id`, `documento_tipo`, `documento_numero`, `orden_compra_id`, `detalle_recepcion_id`, `observaciones`, `clave_idempotencia`, `creado_en`) VALUES (6,'ENTRADA',2,60.000,NULL,1,'2026-10-14 00:00:00.000',10,'ORDEN_COMPRA','OC-1058',1058,6,NULL,'semilla-oc-1058','2026-11-09 19:41:41.166');
INSERT INTO `movimientos` (`id`, `tipo`, `material_id`, `cantidad`, `bodega_origen_id`, `bodega_destino_id`, `fecha_movimiento`, `usuario_id`, `documento_tipo`, `documento_numero`, `orden_compra_id`, `detalle_recepcion_id`, `observaciones`, `clave_idempotencia`, `creado_en`) VALUES (7,'ENTRADA',1,300.000,NULL,1,'2026-10-16 00:00:00.000',10,'ORDEN_COMPRA','OC-1061',1061,7,NULL,'semilla-oc-1061','2026-11-09 19:41:41.183');
INSERT INTO `movimientos` (`id`, `tipo`, `material_id`, `cantidad`, `bodega_origen_id`, `bodega_destino_id`, `fecha_movimiento`, `usuario_id`, `documento_tipo`, `documento_numero`, `orden_compra_id`, `detalle_recepcion_id`, `observaciones`, `clave_idempotencia`, `creado_en`) VALUES (8,'SALIDA',1,550.000,1,NULL,'2026-10-31 00:00:00.000',10,'VALE_SALIDA','VS-SEMILLA-MAT-CEM-GRIS50',NULL,NULL,'Dato semilla ficticio: consumo acumulado de octubre para conciliar con el stock de A5.','semilla-consumo-MAT-CEM-GRIS50','2026-11-09 19:41:41.194');
INSERT INTO `movimientos` (`id`, `tipo`, `material_id`, `cantidad`, `bodega_origen_id`, `bodega_destino_id`, `fecha_movimiento`, `usuario_id`, `documento_tipo`, `documento_numero`, `orden_compra_id`, `detalle_recepcion_id`, `observaciones`, `clave_idempotencia`, `creado_en`) VALUES (9,'SALIDA',2,190.000,1,NULL,'2026-10-31 00:00:00.000',10,'VALE_SALIDA','VS-SEMILLA-MAT-ACE-VAR3G40',NULL,NULL,'Dato semilla ficticio: consumo acumulado de octubre para conciliar con el stock de A5.','semilla-consumo-MAT-ACE-VAR3G40','2026-11-09 19:41:41.206');
INSERT INTO `movimientos` (`id`, `tipo`, `material_id`, `cantidad`, `bodega_origen_id`, `bodega_destino_id`, `fecha_movimiento`, `usuario_id`, `documento_tipo`, `documento_numero`, `orden_compra_id`, `detalle_recepcion_id`, `observaciones`, `clave_idempotencia`, `creado_en`) VALUES (10,'ENTRADA',3,2800.000,NULL,1,'2026-10-31 00:00:00.000',10,'CARGA_INICIAL','CI-MAT-MAM-BLK122040',NULL,NULL,'Stock actual del ejercicio A5.','semilla-inicial-MAT-MAM-BLK122040','2026-11-09 19:41:41.216');
INSERT INTO `movimientos` (`id`, `tipo`, `material_id`, `cantidad`, `bodega_origen_id`, `bodega_destino_id`, `fecha_movimiento`, `usuario_id`, `documento_tipo`, `documento_numero`, `orden_compra_id`, `detalle_recepcion_id`, `observaciones`, `clave_idempotencia`, `creado_en`) VALUES (11,'ENTRADA',4,14.000,NULL,1,'2026-10-31 00:00:00.000',10,'CARGA_INICIAL','CI-MAT-CEM-ARENA',NULL,NULL,'Stock actual del ejercicio A5.','semilla-inicial-MAT-CEM-ARENA','2026-11-09 19:41:41.224');
/*!40000 ALTER TABLE `movimientos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `obras`
--

LOCK TABLES `obras` WRITE;
/*!40000 ALTER TABLE `obras` DISABLE KEYS */;
INSERT INTO `obras` (`id`, `codigo`, `nombre`, `activa`) VALUES (1,'OBR-ROBLES','Residencial Los Robles (ficticia)',1);
INSERT INTO `obras` (`id`, `codigo`, `nombre`, `activa`) VALUES (2,'OBR-NORTE','Plaza Norte (ficticia)',1);
/*!40000 ALTER TABLE `obras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `ordenes_compra`
--

LOCK TABLES `ordenes_compra` WRITE;
/*!40000 ALTER TABLE `ordenes_compra` DISABLE KEYS */;
INSERT INTO `ordenes_compra` (`id`, `numero`, `requisicion_id`, `proveedor_id`, `area_id`, `fecha_emision`, `estado`, `cotizaciones`, `cotizaciones_requeridas`, `total`, `monto_evaluado`, `fraccionamiento_sospechoso`, `fraccionamiento_detalle`, `creado_por_id`, `creado_en`) VALUES (1041,'OC-1041',NULL,1,1,'2026-10-02','RECIBIDA',0,0,1290000.00,1290000.00,0,NULL,5,'2026-11-09 19:41:41.075');
INSERT INTO `ordenes_compra` (`id`, `numero`, `requisicion_id`, `proveedor_id`, `area_id`, `fecha_emision`, `estado`, `cotizaciones`, `cotizaciones_requeridas`, `total`, `monto_evaluado`, `fraccionamiento_sospechoso`, `fraccionamiento_detalle`, `creado_por_id`, `creado_en`) VALUES (1042,'OC-1042',NULL,1,1,'2026-10-02','RECIBIDA',0,0,1290000.00,1290000.00,0,NULL,5,'2026-11-09 19:41:41.098');
INSERT INTO `ordenes_compra` (`id`, `numero`, `requisicion_id`, `proveedor_id`, `area_id`, `fecha_emision`, `estado`, `cotizaciones`, `cotizaciones_requeridas`, `total`, `monto_evaluado`, `fraccionamiento_sospechoso`, `fraccionamiento_detalle`, `creado_por_id`, `creado_en`) VALUES (1047,'OC-1047',NULL,2,2,'2026-10-06','RECIBIDA',0,0,284000.00,284000.00,0,NULL,5,'2026-11-09 19:41:41.109');
INSERT INTO `ordenes_compra` (`id`, `numero`, `requisicion_id`, `proveedor_id`, `area_id`, `fecha_emision`, `estado`, `cotizaciones`, `cotizaciones_requeridas`, `total`, `monto_evaluado`, `fraccionamiento_sospechoso`, `fraccionamiento_detalle`, `creado_por_id`, `creado_en`) VALUES (1050,'OC-1050',NULL,3,1,'2026-10-08','RECIBIDA',0,0,1075000.00,1075000.00,0,NULL,5,'2026-11-09 19:41:41.125');
INSERT INTO `ordenes_compra` (`id`, `numero`, `requisicion_id`, `proveedor_id`, `area_id`, `fecha_emision`, `estado`, `cotizaciones`, `cotizaciones_requeridas`, `total`, `monto_evaluado`, `fraccionamiento_sospechoso`, `fraccionamiento_detalle`, `creado_por_id`, `creado_en`) VALUES (1053,'OC-1053',NULL,3,1,'2026-10-09','RECIBIDA',0,0,1032000.00,1032000.00,0,NULL,5,'2026-11-09 19:41:41.140');
INSERT INTO `ordenes_compra` (`id`, `numero`, `requisicion_id`, `proveedor_id`, `area_id`, `fecha_emision`, `estado`, `cotizaciones`, `cotizaciones_requeridas`, `total`, `monto_evaluado`, `fraccionamiento_sospechoso`, `fraccionamiento_detalle`, `creado_por_id`, `creado_en`) VALUES (1058,'OC-1058',NULL,4,2,'2026-10-13','RECIBIDA',0,0,156000.00,156000.00,0,NULL,5,'2026-11-09 19:41:41.156');
INSERT INTO `ordenes_compra` (`id`, `numero`, `requisicion_id`, `proveedor_id`, `area_id`, `fecha_emision`, `estado`, `cotizaciones`, `cotizaciones_requeridas`, `total`, `monto_evaluado`, `fraccionamiento_sospechoso`, `fraccionamiento_detalle`, `creado_por_id`, `creado_en`) VALUES (1061,'OC-1061',NULL,1,3,'2026-10-15','RECIBIDA',0,0,1890000.00,1890000.00,0,NULL,5,'2026-11-09 19:41:41.173');
/*!40000 ALTER TABLE `ordenes_compra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `parametros`
--

LOCK TABLES `parametros` WRITE;
/*!40000 ALTER TABLE `parametros` DISABLE KEYS */;
INSERT INTO `parametros` (`clave`, `valor`, `descripcion`, `actualizado_en`) VALUES ('DUP_TOLERANCIA_PCT','5','Diferencia porcentual máxima de cantidad para considerarla similar.','2026-11-09 19:41:40.855');
INSERT INTO `parametros` (`clave`, `valor`, `descripcion`, `actualizado_en`) VALUES ('DUP_VENTANA_DIAS','3','Días máximos entre dos órdenes para considerarlas posible duplicado.','2026-11-09 19:41:40.855');
INSERT INTO `parametros` (`clave`, `valor`, `descripcion`, `actualizado_en`) VALUES ('FRACC_VENTANA_DIAS','15','Días en los que se acumulan solicitudes similares para detectar fraccionamiento.','2026-11-09 19:41:40.855');
/*!40000 ALTER TABLE `parametros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `parametros_bodega`
--

LOCK TABLES `parametros_bodega` WRITE;
/*!40000 ALTER TABLE `parametros_bodega` DISABLE KEYS */;
/*!40000 ALTER TABLE `parametros_bodega` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `proveedores`
--

LOCK TABLES `proveedores` WRITE;
/*!40000 ALTER TABLE `proveedores` DISABLE KEYS */;
INSERT INTO `proveedores` (`id`, `codigo`, `nombre`, `activo`, `creado_en`) VALUES (1,'PROV-A','Proveedor A',1,'2026-11-09 19:41:40.984');
INSERT INTO `proveedores` (`id`, `codigo`, `nombre`, `activo`, `creado_en`) VALUES (2,'PROV-B','Proveedor B',1,'2026-11-09 19:41:40.990');
INSERT INTO `proveedores` (`id`, `codigo`, `nombre`, `activo`, `creado_en`) VALUES (3,'PROV-C','Proveedor C',1,'2026-11-09 19:41:40.994');
INSERT INTO `proveedores` (`id`, `codigo`, `nombre`, `activo`, `creado_en`) VALUES (4,'PROV-D','Proveedor D',1,'2026-11-09 19:41:40.997');
INSERT INTO `proveedores` (`id`, `codigo`, `nombre`, `activo`, `creado_en`) VALUES (5,'PROV-E','Proveedor E',1,'2026-11-09 19:41:41.001');
INSERT INTO `proveedores` (`id`, `codigo`, `nombre`, `activo`, `creado_en`) VALUES (6,'PROV-F','Proveedor F',1,'2026-11-09 19:41:41.004');
/*!40000 ALTER TABLE `proveedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `recepciones`
--

LOCK TABLES `recepciones` WRITE;
/*!40000 ALTER TABLE `recepciones` DISABLE KEYS */;
INSERT INTO `recepciones` (`id`, `numero`, `orden_compra_id`, `bodega_id`, `usuario_id`, `fecha`, `observaciones`) VALUES (1,'REC-S1041',1041,1,10,'2026-10-03 00:00:00.000',NULL);
INSERT INTO `recepciones` (`id`, `numero`, `orden_compra_id`, `bodega_id`, `usuario_id`, `fecha`, `observaciones`) VALUES (2,'REC-S1042',1042,1,10,'2026-10-03 00:00:00.000',NULL);
INSERT INTO `recepciones` (`id`, `numero`, `orden_compra_id`, `bodega_id`, `usuario_id`, `fecha`, `observaciones`) VALUES (3,'REC-S1047',1047,1,10,'2026-10-07 00:00:00.000',NULL);
INSERT INTO `recepciones` (`id`, `numero`, `orden_compra_id`, `bodega_id`, `usuario_id`, `fecha`, `observaciones`) VALUES (4,'REC-S1050',1050,1,10,'2026-10-09 00:00:00.000',NULL);
INSERT INTO `recepciones` (`id`, `numero`, `orden_compra_id`, `bodega_id`, `usuario_id`, `fecha`, `observaciones`) VALUES (5,'REC-S1053',1053,1,10,'2026-10-10 00:00:00.000',NULL);
INSERT INTO `recepciones` (`id`, `numero`, `orden_compra_id`, `bodega_id`, `usuario_id`, `fecha`, `observaciones`) VALUES (6,'REC-S1058',1058,1,10,'2026-10-14 00:00:00.000',NULL);
INSERT INTO `recepciones` (`id`, `numero`, `orden_compra_id`, `bodega_id`, `usuario_id`, `fecha`, `observaciones`) VALUES (7,'REC-S1061',1061,1,10,'2026-10-16 00:00:00.000',NULL);
/*!40000 ALTER TABLE `recepciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `requisiciones`
--

LOCK TABLES `requisiciones` WRITE;
/*!40000 ALTER TABLE `requisiciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `requisiciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` (`id`, `codigo`, `nombre`) VALUES (1,'ADMIN','Administración del sistema');
INSERT INTO `roles` (`id`, `codigo`, `nombre`) VALUES (2,'SOLICITANTE','Solicitante');
INSERT INTO `roles` (`id`, `codigo`, `nombre`) VALUES (3,'JEFATURA_AREA','Jefatura del área solicitante');
INSERT INTO `roles` (`id`, `codigo`, `nombre`) VALUES (4,'COMPRADOR','Comprador');
INSERT INTO `roles` (`id`, `codigo`, `nombre`) VALUES (5,'JEFATURA_COMPRAS','Jefatura de Compras');
INSERT INTO `roles` (`id`, `codigo`, `nombre`) VALUES (6,'GERENCIA_FINANCIERA','Gerencia Financiera');
INSERT INTO `roles` (`id`, `codigo`, `nombre`) VALUES (7,'GERENCIA_GENERAL','Gerencia General');
INSERT INTO `roles` (`id`, `codigo`, `nombre`) VALUES (8,'COMITE_COMPRAS','Comité de compras');
INSERT INTO `roles` (`id`, `codigo`, `nombre`) VALUES (9,'BODEGUERO','Bodega');
INSERT INTO `roles` (`id`, `codigo`, `nombre`) VALUES (10,'AUDITOR','Auditoría');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `sospechas_duplicado`
--

LOCK TABLES `sospechas_duplicado` WRITE;
/*!40000 ALTER TABLE `sospechas_duplicado` DISABLE KEYS */;
INSERT INTO `sospechas_duplicado` (`id`, `orden_a_id`, `orden_b_id`, `material_id`, `confianza`, `motivos`, `estado`, `revisado_por_id`, `revisado_en`, `comentario`, `creada_en`) VALUES (1,1041,1042,1,'ALTA','[\"Mismo proveedor: Proveedor A\", \"Mismo artículo: Cemento gris 50 kg\", \"Misma cantidad: 200\", \"Fechas cercanas: 0 día(s) de diferencia (ventana 3)\", \"Misma área solicitante: Obras\", \"Mismo precio unitario: ₡6 450\", \"Estados de las órdenes: RECIBIDA y RECIBIDA\", \"Posible fraccionamiento: juntas suman ₡2 580 000 y exigirían Gerencia Financiera; por separado bastó Jefatura de Compras\"]','PENDIENTE',NULL,NULL,NULL,'2026-11-09 19:41:41.294');
INSERT INTO `sospechas_duplicado` (`id`, `orden_a_id`, `orden_b_id`, `material_id`, `confianza`, `motivos`, `estado`, `revisado_por_id`, `revisado_en`, `comentario`, `creada_en`) VALUES (2,1050,1053,2,'MEDIA','[\"Mismo proveedor: Proveedor C\", \"Mismo artículo: Varilla #3 grado 40\", \"Cantidad similar: 500 y 480 (4 %, tolerancia 5 %)\", \"Fechas cercanas: 1 día(s) de diferencia (ventana 3)\", \"Misma área solicitante: Obras\", \"Mismo precio unitario: ₡2 150\", \"Estados de las órdenes: RECIBIDA y RECIBIDA\", \"Posible fraccionamiento: juntas suman ₡2 107 000 y exigirían Gerencia Financiera; por separado bastó Jefatura de Compras\"]','PENDIENTE',NULL,NULL,NULL,'2026-11-09 19:41:41.305');
/*!40000 ALTER TABLE `sospechas_duplicado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password_hash`, `rol_id`, `area_id`, `activo`, `creado_en`) VALUES (1,'Ana Administradora','admin@delvalle.test','$2b$10$.zJ/CPyjURC9ov35l3MY6.5ujueFzBfO5nGkSXFNLLCj5UOfHInki',1,NULL,1,'2026-11-09 19:41:40.937');
INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password_hash`, `rol_id`, `area_id`, `activo`, `creado_en`) VALUES (2,'Sergio Solicitante','solicitante.obras@delvalle.test','$2b$10$.zJ/CPyjURC9ov35l3MY6.5ujueFzBfO5nGkSXFNLLCj5UOfHInki',2,1,1,'2026-11-09 19:41:40.937');
INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password_hash`, `rol_id`, `area_id`, `activo`, `creado_en`) VALUES (3,'Olga Jefa de Obras','jefe.obras@delvalle.test','$2b$10$.zJ/CPyjURC9ov35l3MY6.5ujueFzBfO5nGkSXFNLLCj5UOfHInki',3,1,1,'2026-11-09 19:41:40.937');
INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password_hash`, `rol_id`, `area_id`, `activo`, `creado_en`) VALUES (4,'Mario Jefe de Mantenimiento','jefe.mantenimiento@delvalle.test','$2b$10$.zJ/CPyjURC9ov35l3MY6.5ujueFzBfO5nGkSXFNLLCj5UOfHInki',3,2,1,'2026-11-09 19:41:40.937');
INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password_hash`, `rol_id`, `area_id`, `activo`, `creado_en`) VALUES (5,'Carla Compradora','comprador@delvalle.test','$2b$10$.zJ/CPyjURC9ov35l3MY6.5ujueFzBfO5nGkSXFNLLCj5UOfHInki',4,NULL,1,'2026-11-09 19:41:40.937');
INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password_hash`, `rol_id`, `area_id`, `activo`, `creado_en`) VALUES (6,'Julio Jefe de Compras','jefe.compras@delvalle.test','$2b$10$.zJ/CPyjURC9ov35l3MY6.5ujueFzBfO5nGkSXFNLLCj5UOfHInki',5,NULL,1,'2026-11-09 19:41:40.937');
INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password_hash`, `rol_id`, `area_id`, `activo`, `creado_en`) VALUES (7,'Fernanda Gerente Financiera','finanzas@delvalle.test','$2b$10$.zJ/CPyjURC9ov35l3MY6.5ujueFzBfO5nGkSXFNLLCj5UOfHInki',6,NULL,1,'2026-11-09 19:41:40.937');
INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password_hash`, `rol_id`, `area_id`, `activo`, `creado_en`) VALUES (8,'Gabriel Gerente General','gerencia@delvalle.test','$2b$10$.zJ/CPyjURC9ov35l3MY6.5ujueFzBfO5nGkSXFNLLCj5UOfHInki',7,NULL,1,'2026-11-09 19:41:40.937');
INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password_hash`, `rol_id`, `area_id`, `activo`, `creado_en`) VALUES (9,'Camila del Comité','comite@delvalle.test','$2b$10$.zJ/CPyjURC9ov35l3MY6.5ujueFzBfO5nGkSXFNLLCj5UOfHInki',8,NULL,1,'2026-11-09 19:41:40.937');
INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password_hash`, `rol_id`, `area_id`, `activo`, `creado_en`) VALUES (10,'Bernardo Bodeguero','bodega@delvalle.test','$2b$10$.zJ/CPyjURC9ov35l3MY6.5ujueFzBfO5nGkSXFNLLCj5UOfHInki',9,3,1,'2026-11-09 19:41:40.937');
INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password_hash`, `rol_id`, `area_id`, `activo`, `creado_en`) VALUES (11,'Alicia Auditora','auditor@delvalle.test','$2b$10$.zJ/CPyjURC9ov35l3MY6.5ujueFzBfO5nGkSXFNLLCj5UOfHInki',10,NULL,1,'2026-11-09 19:41:40.937');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-09 13:41:42

SET FOREIGN_KEY_CHECKS=1;
