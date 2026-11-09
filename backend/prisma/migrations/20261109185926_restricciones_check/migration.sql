-- Reglas que deben cumplirse aunque alguien escriba directamente en la base de datos.
ALTER TABLE `movimientos`
  ADD CONSTRAINT `chk_mov_cantidad_positiva` CHECK (`cantidad` > 0),
  ADD CONSTRAINT `chk_mov_ubicacion_por_tipo` CHECK (
    (`tipo` = 'ENTRADA'  AND `bodega_destino_id` IS NOT NULL AND `bodega_origen_id` IS NULL) OR
    (`tipo` = 'SALIDA'   AND `bodega_origen_id` IS NOT NULL AND `bodega_destino_id` IS NULL) OR
    (`tipo` = 'TRASLADO' AND `bodega_origen_id` IS NOT NULL AND `bodega_destino_id` IS NOT NULL AND `bodega_origen_id` <> `bodega_destino_id`) OR
    (`tipo` = 'AJUSTE'   AND ((`bodega_origen_id` IS NULL) <> (`bodega_destino_id` IS NULL)))
  );

ALTER TABLE `inventario` ADD CONSTRAINT `chk_inv_no_negativo` CHECK (`cantidad` >= 0);

ALTER TABLE `materiales`
  ADD CONSTRAINT `chk_mat_demanda` CHECK (`demanda_maxima_dia` >= `demanda_promedio_dia`),
  ADD CONSTRAINT `chk_mat_stock_rango` CHECK (`stock_maximo` >= `stock_minimo`),
  ADD CONSTRAINT `chk_mat_entrega` CHECK (`tiempo_entrega_dias` >= 0);

ALTER TABLE `detalle_orden_compra`
  ADD CONSTRAINT `chk_doc_cantidad` CHECK (`cantidad` > 0),
  ADD CONSTRAINT `chk_doc_precio` CHECK (`precio_unitario` >= 0);

ALTER TABLE `detalle_requisicion`
  ADD CONSTRAINT `chk_dreq_cantidad` CHECK (`cantidad` > 0),
  ADD CONSTRAINT `chk_dreq_precio` CHECK (`precio_estimado` >= 0);

ALTER TABLE `detalle_recepciones` ADD CONSTRAINT `chk_drec_cantidad` CHECK (`cantidad_recibida` > 0);

ALTER TABLE `contratos_precio` ADD CONSTRAINT `chk_contrato_precio` CHECK (`precio` > 0);

-- Una aprobación pertenece a una requisición o a una orden, nunca a ambas.
ALTER TABLE `aprobaciones` ADD CONSTRAINT `chk_aprob_documento` CHECK (
  (`requisicion_id` IS NULL) <> (`orden_compra_id` IS NULL)
);
