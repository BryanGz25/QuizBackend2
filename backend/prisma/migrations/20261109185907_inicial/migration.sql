-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(40) NOT NULL,
    `nombre` VARCHAR(80) NOT NULL,

    UNIQUE INDEX `roles_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `areas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(80) NOT NULL,

    UNIQUE INDEX `areas_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(120) NOT NULL,
    `email` VARCHAR(160) NOT NULL,
    `password_hash` VARCHAR(100) NOT NULL,
    `rol_id` INTEGER NOT NULL,
    `area_id` INTEGER NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `usuarios_email_key`(`email`),
    INDEX `usuarios_rol_id_idx`(`rol_id`),
    INDEX `usuarios_area_id_idx`(`area_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categorias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(20) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `padre_id` INTEGER NULL,

    UNIQUE INDEX `categorias_codigo_key`(`codigo`),
    INDEX `categorias_padre_id_idx`(`padre_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `materiales` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(40) NOT NULL,
    `nombre` VARCHAR(160) NOT NULL,
    `unidad` VARCHAR(20) NOT NULL,
    `categoria_id` INTEGER NOT NULL,
    `stock_minimo` DECIMAL(14, 3) NULL,
    `stock_maximo` DECIMAL(14, 3) NULL,
    `demanda_promedio_dia` DECIMAL(14, 3) NULL,
    `demanda_maxima_dia` DECIMAL(14, 3) NULL,
    `tiempo_entrega_dias` INTEGER NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    UNIQUE INDEX `materiales_codigo_key`(`codigo`),
    INDEX `materiales_categoria_id_idx`(`categoria_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lineas_erp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numero` INTEGER NOT NULL,
    `descripcion_erp` VARCHAR(160) NOT NULL,
    `area_id` INTEGER NOT NULL,
    `proveedor_id` INTEGER NOT NULL,
    `cantidad` DECIMAL(14, 3) NOT NULL,
    `precio_unitario` DECIMAL(14, 2) NOT NULL,
    `material_id` INTEGER NOT NULL,
    `estado_equivalencia` ENUM('EQUIVALENTE', 'EQUIVALENTE_POR_VALIDAR', 'SIN_EQUIVALENTE') NOT NULL,
    `justificacion` VARCHAR(400) NOT NULL,

    UNIQUE INDEX `lineas_erp_numero_key`(`numero`),
    INDEX `lineas_erp_area_id_idx`(`area_id`),
    INDEX `lineas_erp_proveedor_id_idx`(`proveedor_id`),
    INDEX `lineas_erp_material_id_idx`(`material_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proveedores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(20) NOT NULL,
    `nombre` VARCHAR(120) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `proveedores_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contratos_precio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `proveedor_id` INTEGER NOT NULL,
    `material_id` INTEGER NOT NULL,
    `precio` DECIMAL(14, 2) NOT NULL,
    `vigente_desde` DATE NOT NULL,
    `vigente_hasta` DATE NULL,

    INDEX `contratos_precio_material_id_idx`(`material_id`),
    UNIQUE INDEX `contratos_precio_proveedor_id_material_id_vigente_desde_key`(`proveedor_id`, `material_id`, `vigente_desde`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `obras` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(20) NOT NULL,
    `nombre` VARCHAR(120) NOT NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `obras_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bodegas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(20) NOT NULL,
    `nombre` VARCHAR(120) NOT NULL,
    `obra_id` INTEGER NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `bodegas_codigo_key`(`codigo`),
    INDEX `bodegas_obra_id_idx`(`obra_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parametros_bodega` (
    `material_id` INTEGER NOT NULL,
    `bodega_id` INTEGER NOT NULL,
    `demanda_promedio_dia` DECIMAL(14, 3) NOT NULL,
    `demanda_maxima_dia` DECIMAL(14, 3) NOT NULL,
    `tiempo_entrega_dias` INTEGER NOT NULL,

    INDEX `parametros_bodega_bodega_id_idx`(`bodega_id`),
    PRIMARY KEY (`material_id`, `bodega_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventario` (
    `material_id` INTEGER NOT NULL,
    `bodega_id` INTEGER NOT NULL,
    `cantidad` DECIMAL(14, 3) NOT NULL DEFAULT 0,
    `actualizado_en` DATETIME(3) NOT NULL,

    INDEX `inventario_bodega_id_idx`(`bodega_id`),
    PRIMARY KEY (`material_id`, `bodega_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `movimientos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` ENUM('ENTRADA', 'SALIDA', 'TRASLADO', 'AJUSTE') NOT NULL,
    `material_id` INTEGER NOT NULL,
    `cantidad` DECIMAL(14, 3) NOT NULL,
    `bodega_origen_id` INTEGER NULL,
    `bodega_destino_id` INTEGER NULL,
    `fecha_movimiento` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usuario_id` INTEGER NOT NULL,
    `documento_tipo` ENUM('ORDEN_COMPRA', 'VALE_SALIDA', 'BOLETA_TRASLADO', 'ACTA_AJUSTE', 'CARGA_INICIAL') NOT NULL,
    `documento_numero` VARCHAR(40) NOT NULL,
    `orden_compra_id` INTEGER NULL,
    `detalle_recepcion_id` INTEGER NULL,
    `observaciones` VARCHAR(400) NULL,
    `clave_idempotencia` VARCHAR(80) NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `movimientos_detalle_recepcion_id_key`(`detalle_recepcion_id`),
    UNIQUE INDEX `movimientos_clave_idempotencia_key`(`clave_idempotencia`),
    INDEX `movimientos_material_id_fecha_movimiento_idx`(`material_id`, `fecha_movimiento`),
    INDEX `movimientos_bodega_origen_id_idx`(`bodega_origen_id`),
    INDEX `movimientos_bodega_destino_id_idx`(`bodega_destino_id`),
    INDEX `movimientos_usuario_id_idx`(`usuario_id`),
    INDEX `movimientos_orden_compra_id_idx`(`orden_compra_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `requisiciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numero` VARCHAR(40) NOT NULL,
    `area_id` INTEGER NOT NULL,
    `solicitante_id` INTEGER NOT NULL,
    `proveedor_sugerido_id` INTEGER NULL,
    `alerta_id` INTEGER NULL,
    `estado` ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA', 'CONVERTIDA') NOT NULL DEFAULT 'PENDIENTE',
    `justificacion` VARCHAR(400) NOT NULL,
    `cotizaciones` INTEGER NOT NULL DEFAULT 0,
    `monto_total` DECIMAL(14, 2) NOT NULL,
    `monto_evaluado` DECIMAL(14, 2) NOT NULL,
    `cotizaciones_requeridas` INTEGER NOT NULL,
    `fraccionamiento_sospechoso` BOOLEAN NOT NULL DEFAULT false,
    `fraccionamiento_detalle` JSON NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `requisiciones_numero_key`(`numero`),
    INDEX `requisiciones_area_id_creado_en_idx`(`area_id`, `creado_en`),
    INDEX `requisiciones_solicitante_id_idx`(`solicitante_id`),
    INDEX `requisiciones_proveedor_sugerido_id_idx`(`proveedor_sugerido_id`),
    INDEX `requisiciones_alerta_id_idx`(`alerta_id`),
    INDEX `requisiciones_estado_idx`(`estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detalle_requisicion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requisicion_id` INTEGER NOT NULL,
    `material_id` INTEGER NOT NULL,
    `cantidad` DECIMAL(14, 3) NOT NULL,
    `precio_estimado` DECIMAL(14, 2) NOT NULL,

    INDEX `detalle_requisicion_material_id_idx`(`material_id`),
    UNIQUE INDEX `detalle_requisicion_requisicion_id_material_id_key`(`requisicion_id`, `material_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matriz_aprobacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orden` INTEGER NOT NULL,
    `monto_hasta` DECIMAL(14, 2) NULL,
    `rol_aprobador_id` INTEGER NOT NULL,
    `cotizaciones_requeridas` INTEGER NOT NULL,
    `requiere_comite` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `matriz_aprobacion_orden_key`(`orden`),
    INDEX `matriz_aprobacion_rol_aprobador_id_idx`(`rol_aprobador_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aprobaciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requisicion_id` INTEGER NULL,
    `orden_compra_id` INTEGER NULL,
    `paso` INTEGER NOT NULL,
    `rol_requerido_id` INTEGER NOT NULL,
    `estado` ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA', 'OMITIDA') NOT NULL DEFAULT 'PENDIENTE',
    `usuario_id` INTEGER NULL,
    `fecha_decision` DATETIME(3) NULL,
    `comentario` VARCHAR(400) NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `aprobaciones_rol_requerido_id_estado_idx`(`rol_requerido_id`, `estado`),
    INDEX `aprobaciones_usuario_id_idx`(`usuario_id`),
    UNIQUE INDEX `aprobaciones_requisicion_id_paso_key`(`requisicion_id`, `paso`),
    UNIQUE INDEX `aprobaciones_orden_compra_id_paso_key`(`orden_compra_id`, `paso`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ordenes_compra` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numero` VARCHAR(40) NOT NULL,
    `requisicion_id` INTEGER NULL,
    `proveedor_id` INTEGER NOT NULL,
    `area_id` INTEGER NOT NULL,
    `fecha_emision` DATE NOT NULL,
    `estado` ENUM('PENDIENTE_APROBACION', 'EMITIDA', 'RECIBIDA_PARCIAL', 'RECIBIDA', 'RECHAZADA', 'ANULADA') NOT NULL,
    `cotizaciones` INTEGER NOT NULL DEFAULT 0,
    `cotizaciones_requeridas` INTEGER NOT NULL DEFAULT 0,
    `total` DECIMAL(14, 2) NOT NULL,
    `monto_evaluado` DECIMAL(14, 2) NOT NULL,
    `fraccionamiento_sospechoso` BOOLEAN NOT NULL DEFAULT false,
    `fraccionamiento_detalle` JSON NULL,
    `creado_por_id` INTEGER NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ordenes_compra_numero_key`(`numero`),
    INDEX `ordenes_compra_requisicion_id_idx`(`requisicion_id`),
    INDEX `ordenes_compra_proveedor_id_fecha_emision_idx`(`proveedor_id`, `fecha_emision`),
    INDEX `ordenes_compra_area_id_idx`(`area_id`),
    INDEX `ordenes_compra_creado_por_id_idx`(`creado_por_id`),
    INDEX `ordenes_compra_estado_idx`(`estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detalle_orden_compra` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orden_compra_id` INTEGER NOT NULL,
    `material_id` INTEGER NOT NULL,
    `cantidad` DECIMAL(14, 3) NOT NULL,
    `precio_unitario` DECIMAL(14, 2) NOT NULL,

    INDEX `detalle_orden_compra_material_id_idx`(`material_id`),
    UNIQUE INDEX `detalle_orden_compra_orden_compra_id_material_id_key`(`orden_compra_id`, `material_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recepciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numero` VARCHAR(40) NOT NULL,
    `orden_compra_id` INTEGER NOT NULL,
    `bodega_id` INTEGER NOT NULL,
    `usuario_id` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `observaciones` VARCHAR(400) NULL,

    UNIQUE INDEX `recepciones_numero_key`(`numero`),
    INDEX `recepciones_orden_compra_id_idx`(`orden_compra_id`),
    INDEX `recepciones_bodega_id_idx`(`bodega_id`),
    INDEX `recepciones_usuario_id_idx`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detalle_recepciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recepcion_id` INTEGER NOT NULL,
    `detalle_orden_id` INTEGER NOT NULL,
    `cantidad_recibida` DECIMAL(14, 3) NOT NULL,

    INDEX `detalle_recepciones_recepcion_id_idx`(`recepcion_id`),
    INDEX `detalle_recepciones_detalle_orden_id_idx`(`detalle_orden_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alertas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `material_id` INTEGER NOT NULL,
    `bodega_id` INTEGER NULL,
    `stock_actual` DECIMAL(14, 3) NOT NULL,
    `punto_reorden` DECIMAL(14, 3) NOT NULL,
    `faltante` DECIMAL(14, 3) NOT NULL,
    `prioridad` ENUM('CRITICA', 'ALTA', 'MEDIA') NOT NULL,
    `estado` ENUM('PENDIENTE', 'ATENDIDA', 'CERRADA') NOT NULL DEFAULT 'PENDIENTE',
    `clave_activa` VARCHAR(40) NULL,
    `comentario` VARCHAR(400) NULL,
    `creada_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizada_en` DATETIME(3) NOT NULL,
    `cerrada_en` DATETIME(3) NULL,

    UNIQUE INDEX `alertas_clave_activa_key`(`clave_activa`),
    INDEX `alertas_material_id_idx`(`material_id`),
    INDEX `alertas_bodega_id_idx`(`bodega_id`),
    INDEX `alertas_estado_prioridad_idx`(`estado`, `prioridad`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sospechas_duplicado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orden_a_id` INTEGER NOT NULL,
    `orden_b_id` INTEGER NOT NULL,
    `material_id` INTEGER NOT NULL,
    `confianza` ENUM('ALTA', 'MEDIA') NOT NULL,
    `motivos` JSON NOT NULL,
    `estado` ENUM('PENDIENTE', 'CONFIRMADA', 'DESCARTADA') NOT NULL DEFAULT 'PENDIENTE',
    `revisado_por_id` INTEGER NULL,
    `revisado_en` DATETIME(3) NULL,
    `comentario` VARCHAR(400) NULL,
    `creada_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `sospechas_duplicado_orden_b_id_idx`(`orden_b_id`),
    INDEX `sospechas_duplicado_material_id_idx`(`material_id`),
    INDEX `sospechas_duplicado_revisado_por_id_idx`(`revisado_por_id`),
    INDEX `sospechas_duplicado_estado_idx`(`estado`),
    UNIQUE INDEX `sospechas_duplicado_orden_a_id_orden_b_id_material_id_key`(`orden_a_id`, `orden_b_id`, `material_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parametros` (
    `clave` VARCHAR(60) NOT NULL,
    `valor` VARCHAR(120) NOT NULL,
    `descripcion` VARCHAR(300) NOT NULL,
    `actualizado_en` DATETIME(3) NOT NULL,

    PRIMARY KEY (`clave`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auditoria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NULL,
    `accion` VARCHAR(40) NOT NULL,
    `entidad` VARCHAR(40) NOT NULL,
    `entidad_id` VARCHAR(40) NOT NULL,
    `antes` JSON NULL,
    `despues` JSON NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `auditoria_entidad_entidad_id_idx`(`entidad`, `entidad_id`),
    INDEX `auditoria_usuario_id_idx`(`usuario_id`),
    INDEX `auditoria_creado_en_idx`(`creado_en`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_rol_id_fkey` FOREIGN KEY (`rol_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_area_id_fkey` FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categorias` ADD CONSTRAINT `categorias_padre_id_fkey` FOREIGN KEY (`padre_id`) REFERENCES `categorias`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `materiales` ADD CONSTRAINT `materiales_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `categorias`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lineas_erp` ADD CONSTRAINT `lineas_erp_area_id_fkey` FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lineas_erp` ADD CONSTRAINT `lineas_erp_proveedor_id_fkey` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lineas_erp` ADD CONSTRAINT `lineas_erp_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `materiales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contratos_precio` ADD CONSTRAINT `contratos_precio_proveedor_id_fkey` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contratos_precio` ADD CONSTRAINT `contratos_precio_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `materiales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bodegas` ADD CONSTRAINT `bodegas_obra_id_fkey` FOREIGN KEY (`obra_id`) REFERENCES `obras`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `parametros_bodega` ADD CONSTRAINT `parametros_bodega_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `materiales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `parametros_bodega` ADD CONSTRAINT `parametros_bodega_bodega_id_fkey` FOREIGN KEY (`bodega_id`) REFERENCES `bodegas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventario` ADD CONSTRAINT `inventario_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `materiales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventario` ADD CONSTRAINT `inventario_bodega_id_fkey` FOREIGN KEY (`bodega_id`) REFERENCES `bodegas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimientos` ADD CONSTRAINT `movimientos_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `materiales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimientos` ADD CONSTRAINT `movimientos_bodega_origen_id_fkey` FOREIGN KEY (`bodega_origen_id`) REFERENCES `bodegas`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `movimientos` ADD CONSTRAINT `movimientos_bodega_destino_id_fkey` FOREIGN KEY (`bodega_destino_id`) REFERENCES `bodegas`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `movimientos` ADD CONSTRAINT `movimientos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimientos` ADD CONSTRAINT `movimientos_orden_compra_id_fkey` FOREIGN KEY (`orden_compra_id`) REFERENCES `ordenes_compra`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimientos` ADD CONSTRAINT `movimientos_detalle_recepcion_id_fkey` FOREIGN KEY (`detalle_recepcion_id`) REFERENCES `detalle_recepciones`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requisiciones` ADD CONSTRAINT `requisiciones_area_id_fkey` FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requisiciones` ADD CONSTRAINT `requisiciones_solicitante_id_fkey` FOREIGN KEY (`solicitante_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requisiciones` ADD CONSTRAINT `requisiciones_proveedor_sugerido_id_fkey` FOREIGN KEY (`proveedor_sugerido_id`) REFERENCES `proveedores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requisiciones` ADD CONSTRAINT `requisiciones_alerta_id_fkey` FOREIGN KEY (`alerta_id`) REFERENCES `alertas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_requisicion` ADD CONSTRAINT `detalle_requisicion_requisicion_id_fkey` FOREIGN KEY (`requisicion_id`) REFERENCES `requisiciones`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_requisicion` ADD CONSTRAINT `detalle_requisicion_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `materiales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matriz_aprobacion` ADD CONSTRAINT `matriz_aprobacion_rol_aprobador_id_fkey` FOREIGN KEY (`rol_aprobador_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aprobaciones` ADD CONSTRAINT `aprobaciones_requisicion_id_fkey` FOREIGN KEY (`requisicion_id`) REFERENCES `requisiciones`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `aprobaciones` ADD CONSTRAINT `aprobaciones_orden_compra_id_fkey` FOREIGN KEY (`orden_compra_id`) REFERENCES `ordenes_compra`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `aprobaciones` ADD CONSTRAINT `aprobaciones_rol_requerido_id_fkey` FOREIGN KEY (`rol_requerido_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aprobaciones` ADD CONSTRAINT `aprobaciones_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordenes_compra` ADD CONSTRAINT `ordenes_compra_requisicion_id_fkey` FOREIGN KEY (`requisicion_id`) REFERENCES `requisiciones`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordenes_compra` ADD CONSTRAINT `ordenes_compra_proveedor_id_fkey` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordenes_compra` ADD CONSTRAINT `ordenes_compra_area_id_fkey` FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordenes_compra` ADD CONSTRAINT `ordenes_compra_creado_por_id_fkey` FOREIGN KEY (`creado_por_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_orden_compra` ADD CONSTRAINT `detalle_orden_compra_orden_compra_id_fkey` FOREIGN KEY (`orden_compra_id`) REFERENCES `ordenes_compra`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_orden_compra` ADD CONSTRAINT `detalle_orden_compra_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `materiales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recepciones` ADD CONSTRAINT `recepciones_orden_compra_id_fkey` FOREIGN KEY (`orden_compra_id`) REFERENCES `ordenes_compra`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recepciones` ADD CONSTRAINT `recepciones_bodega_id_fkey` FOREIGN KEY (`bodega_id`) REFERENCES `bodegas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recepciones` ADD CONSTRAINT `recepciones_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_recepciones` ADD CONSTRAINT `detalle_recepciones_recepcion_id_fkey` FOREIGN KEY (`recepcion_id`) REFERENCES `recepciones`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_recepciones` ADD CONSTRAINT `detalle_recepciones_detalle_orden_id_fkey` FOREIGN KEY (`detalle_orden_id`) REFERENCES `detalle_orden_compra`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alertas` ADD CONSTRAINT `alertas_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `materiales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alertas` ADD CONSTRAINT `alertas_bodega_id_fkey` FOREIGN KEY (`bodega_id`) REFERENCES `bodegas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sospechas_duplicado` ADD CONSTRAINT `sospechas_duplicado_orden_a_id_fkey` FOREIGN KEY (`orden_a_id`) REFERENCES `ordenes_compra`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sospechas_duplicado` ADD CONSTRAINT `sospechas_duplicado_orden_b_id_fkey` FOREIGN KEY (`orden_b_id`) REFERENCES `ordenes_compra`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sospechas_duplicado` ADD CONSTRAINT `sospechas_duplicado_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `materiales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sospechas_duplicado` ADD CONSTRAINT `sospechas_duplicado_revisado_por_id_fkey` FOREIGN KEY (`revisado_por_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditoria` ADD CONSTRAINT `auditoria_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
