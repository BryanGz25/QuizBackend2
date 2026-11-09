import { useState } from 'react';
import { Campo, Carga, Encabezado, Estado, Modal, Tabla } from '../components/Comunes';
import { PUEDE } from '../config/permisos';
import { useAuth } from '../context/AuthContext';
import { useDatos } from '../hooks/useDatos';
import { useFormulario } from '../hooks/useFormulario';
import { ordenesApi } from '../services/compras.service';
import { catalogosApi, materialesApi, movimientosApi } from '../services/inventario.service';
import { fechaHora, nuevaClave, numero } from '../utils/formato';

const DOCUMENTO = { SALIDA: ['VALE_SALIDA', 'Número de vale de salida'], TRASLADO: ['BOLETA_TRASLADO', 'Número de boleta'], AJUSTE: ['ACTA_AJUSTE', 'Número de acta'] };

function FormMovimiento({ materiales, bodegas, ordenes, esAdmin, alCerrar, alGuardar }) {
  const [clave] = useState(nuevaClave);
  const f = useFormulario(
    { tipo: 'SALIDA', materialId: '', cantidad: '', origenId: '', destinoId: '', documentoNumero: '', ordenCompraId: '', observaciones: '', sentidoAjuste: 'origen', origenEntrada: 'orden' },
    (v) => {
      const d = { tipo: v.tipo, materialId: Number(v.materialId), cantidad: Number(v.cantidad), claveIdempotencia: clave };
      if (v.observaciones) d.observaciones = v.observaciones;
      const usaOrigen = v.tipo === 'SALIDA' || v.tipo === 'TRASLADO' || (v.tipo === 'AJUSTE' && v.sentidoAjuste === 'origen');
      const usaDestino = v.tipo === 'ENTRADA' || v.tipo === 'TRASLADO' || (v.tipo === 'AJUSTE' && v.sentidoAjuste === 'destino');
      if (usaOrigen) d.origenId = Number(v.origenId);
      if (usaDestino) d.destinoId = Number(v.destinoId);
      if (v.tipo === 'ENTRADA' && v.origenEntrada === 'orden') {
        const orden = ordenes.find((o) => o.id === Number(v.ordenCompraId));
        d.documentoTipo = 'ORDEN_COMPRA';
        d.ordenCompraId = orden?.id;
        d.documentoNumero = orden?.numero ?? '';
      } else {
        d.documentoTipo = v.tipo === 'ENTRADA' ? 'CARGA_INICIAL' : DOCUMENTO[v.tipo][0];
        d.documentoNumero = v.documentoNumero;
      }
      return movimientosApi.crear(d);
    },
    {
      mensaje: (r) => (r.alerta ? `Movimiento registrado. Se generó una alerta de reorden: stock ${numero(r.alerta.stock_actual)}.` : 'Movimiento registrado.'),
      alTerminar: alGuardar,
    },
  );
  const v = f.valores;
  const opcionesBodega = bodegas.map((b) => <option key={b.id} value={b.id}>{b.nombre}</option>);
  const elegir = <option value="">Seleccione</option>;
  const verOrigen = v.tipo === 'SALIDA' || v.tipo === 'TRASLADO' || (v.tipo === 'AJUSTE' && v.sentidoAjuste === 'origen');
  const verDestino = v.tipo === 'ENTRADA' || v.tipo === 'TRASLADO' || (v.tipo === 'AJUSTE' && v.sentidoAjuste === 'destino');
  const porOrden = v.tipo === 'ENTRADA' && v.origenEntrada === 'orden';

  return (
    <Modal titulo="Registrar movimiento" alCerrar={alCerrar} alEnviar={f.alEnviar} enviando={f.enviando} error={f.error} textoEnviar="Registrar movimiento">
      <div className="rejilla">
        <Campo etiqueta="Tipo" value={v.tipo} onChange={f.cambiar('tipo')}>
          <option value="SALIDA">Salida</option>
          <option value="ENTRADA">Entrada</option>
          <option value="TRASLADO">Traslado</option>
          <option value="AJUSTE">Ajuste</option>
        </Campo>
        <Campo etiqueta="Material" required value={v.materialId} onChange={f.cambiar('materialId')}>
          {elegir}
          {materiales.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
        </Campo>
        <Campo etiqueta="Cantidad" type="number" min="0.001" step="any" required value={v.cantidad} onChange={f.cambiar('cantidad')} />
        {v.tipo === 'ENTRADA' && esAdmin && (
          <Campo etiqueta="Origen de la entrada" value={v.origenEntrada} onChange={f.cambiar('origenEntrada')}>
            <option value="orden">Orden de compra</option>
            <option value="carga">Carga inicial</option>
          </Campo>
        )}
        {v.tipo === 'AJUSTE' && (
          <Campo etiqueta="Efecto del ajuste" value={v.sentidoAjuste} onChange={f.cambiar('sentidoAjuste')}>
            <option value="origen">Resta stock</option>
            <option value="destino">Suma stock</option>
          </Campo>
        )}
        {verOrigen && <Campo etiqueta="Bodega de origen" required value={v.origenId} onChange={f.cambiar('origenId')}>{elegir}{opcionesBodega}</Campo>}
        {verDestino && <Campo etiqueta="Bodega de destino" required value={v.destinoId} onChange={f.cambiar('destinoId')}>{elegir}{opcionesBodega}</Campo>}
        {porOrden ? (
          <Campo etiqueta="Orden de compra" required value={v.ordenCompraId} onChange={f.cambiar('ordenCompraId')}>
            {elegir}
            {ordenes.map((o) => <option key={o.id} value={o.id}>{o.numero}, {o.proveedor.nombre}</option>)}
          </Campo>
        ) : (
          <Campo etiqueta={v.tipo === 'ENTRADA' ? 'Número de carga' : DOCUMENTO[v.tipo][1]} required value={v.documentoNumero} onChange={f.cambiar('documentoNumero')} />
        )}
        <Campo clase="ancho" etiqueta={v.tipo === 'AJUSTE' ? 'Justificación del ajuste' : 'Observaciones'} rows={2} required={v.tipo === 'AJUSTE'} minLength={v.tipo === 'AJUSTE' ? 10 : undefined} value={v.observaciones} onChange={f.cambiar('observaciones')} />
      </div>
    </Modal>
  );
}

export default function MovimientosPage() {
  const { puede, usuario } = useAuth();
  const movimientos = useDatos(() => movimientosApi.listar('?limite=200'));
  const catalogos = useDatos(() => Promise.all([materialesApi.listar(), catalogosApi.bodegas(), ordenesApi.listar()]));
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <Encabezado titulo="Movimientos" descripcion="Historial inmutable. Para corregir un error, registre un ajuste justificado.">
        {puede(PUEDE.moverStock) && <button type="button" disabled={!catalogos.datos} onClick={() => setAbierto(true)}>Registrar movimiento</button>}
      </Encabezado>
      <section className="panel">
        <Carga estado={movimientos}>
          {(d) => (
            <Tabla
              filas={d}
              vacio="Todavía no hay movimientos."
              columnas={[
                { titulo: 'Fecha', render: (m) => fechaHora(m.fecha_movimiento) },
                { titulo: 'Tipo', render: (m) => <Estado valor={m.tipo} /> },
                { titulo: 'Material', render: (m) => m.material.nombre },
                { titulo: 'Cantidad', num: true, render: (m) => `${numero(m.cantidad)} ${m.material.unidad}` },
                { titulo: 'Origen', render: (m) => m.origen?.nombre ?? 'No aplica' },
                { titulo: 'Destino', render: (m) => m.destino?.nombre ?? 'No aplica' },
                { titulo: 'Documento', render: (m) => m.documento_numero },
                { titulo: 'Responsable', render: (m) => m.usuario.nombre },
              ]}
            />
          )}
        </Carga>
      </section>
      {abierto && (
        <FormMovimiento
          materiales={catalogos.datos[0]}
          bodegas={catalogos.datos[1]}
          ordenes={catalogos.datos[2].filter((o) => ['EMITIDA', 'RECIBIDA_PARCIAL'].includes(o.estado))}
          esAdmin={usuario.rol === 'ADMIN'}
          alCerrar={() => setAbierto(false)}
          alGuardar={() => { setAbierto(false); movimientos.recargar(); }}
        />
      )}
    </>
  );
}
