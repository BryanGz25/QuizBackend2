import { useState } from 'react';
import { Campo, Carga, Encabezado, Estado } from '../components/Comunes';
import { useDatos } from '../hooks/useDatos';
import { materialesApi } from '../services/inventario.service';
import { fechaHora, numero } from '../utils/formato';

function Evento({ h, unidad }) {
  const lugar = [h.origen && `desde ${h.origen}`, h.destino && `hacia ${h.destino}`].filter(Boolean).join(' ');
  const origenCompra = h.ordenCompra && `${h.ordenCompra}, ${h.proveedor}, recepción ${h.recepcion}.`;
  return (
    <li className={h.tipo === 'ENTRADA' ? '' : 'salida'}>
      <div className="fila">
        <Estado valor={h.tipo} />
        <strong>{numero(h.cantidad)} {unidad}</strong>
        <span>{lugar}</span>
      </div>
      <div className="detalle">
        {fechaHora(h.fecha)}. {h.usuario}. Documento {h.documentoNumero}. Saldo después: {numero(h.saldoConsolidado)}.
        {origenCompra && <div>Origen: {origenCompra}</div>}
        {h.obra && <div>Obra: {h.obra}.</div>}
        {h.observaciones && <div>{h.observaciones}</div>}
      </div>
    </li>
  );
}

export default function TrazabilidadPage() {
  const materiales = useDatos(() => materialesApi.listar());
  const [id, setId] = useState('');
  const traza = useDatos(() => (id ? materialesApi.trazabilidad(id) : Promise.resolve(null)), [id]);

  return (
    <>
      <Encabezado titulo="Trazabilidad" descripcion="De qué orden y proveedor vino cada entrada, y qué pasó después." />
      <section className="panel">
        <Campo etiqueta="Material" value={id} onChange={(e) => setId(e.target.value)} style={{ maxWidth: 420 }}>
          <option value="">Seleccione un material</option>
          {(materiales.datos ?? []).map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
        </Campo>
      </section>
      {id && (
        <Carga estado={traza}>
          {(d) => (
            <section className="panel">
              <h2>{d.material.nombre}: {numero(d.saldoActual)} {d.material.unidad} en existencia</h2>
              <p className="ayuda">{d.nota}</p>
              {d.historial.length === 0 ? <p className="vacio">Este material todavía no tiene movimientos.</p> : (
                <ul className="linea-tiempo">{d.historial.map((h) => <Evento key={h.id} h={h} unidad={d.material.unidad} />)}</ul>
              )}
            </section>
          )}
        </Carga>
      )}
    </>
  );
}
