import { useState } from 'react';
import { Campo, Carga, Encabezado, Estado, Modal, Pestanas, Tabla } from '../components/Comunes';
import LineasForm from '../components/LineasForm';
import { PUEDE } from '../config/permisos';
import { useAuth } from '../context/AuthContext';
import { useDatos } from '../hooks/useDatos';
import { useFormulario } from '../hooks/useFormulario';
import { ordenesApi, recepcionesApi, requisicionesApi } from '../services/compras.service';
import { catalogosApi, materialesApi } from '../services/inventario.service';
import { colones, fecha, nuevaClave, numero } from '../utils/formato';

function FormOrden({ catalogos, alCerrar, alGuardar }) {
  const [materiales, areas, proveedores, requisiciones] = catalogos;
  const [lineas, setLineas] = useState([{ materialId: '', cantidad: '', precio: '' }]);
  const f = useFormulario(
    { requisicionId: '', proveedorId: '', areaId: '', fechaEmision: '', cotizaciones: '' },
    (v) => ordenesApi.crear({
      proveedorId: Number(v.proveedorId),
      ...(v.requisicionId ? { requisicionId: Number(v.requisicionId) } : { areaId: Number(v.areaId), cotizaciones: Number(v.cotizaciones || 0) }),
      ...(v.fechaEmision ? { fechaEmision: v.fechaEmision } : {}),
      lineas: lineas.map((l) => ({ materialId: Number(l.materialId), cantidad: Number(l.cantidad), precioUnitario: Number(l.precio) })),
    }),
    {
      mensaje: (r) => (r.sospechasDuplicado.length ? `${r.orden.numero} creada. Revise la posible duplicidad detectada.` : `${r.orden.numero} creada.`),
      alTerminar: alGuardar,
    },
  );
  const v = f.valores;

  const elegirRequisicion = (e) => {
    const id = e.target.value;
    f.setValores({ ...v, requisicionId: id, proveedorId: String(requisiciones.find((r) => r.id === Number(id))?.proveedor_sugerido_id ?? v.proveedorId) });
    const r = requisiciones.find((x) => x.id === Number(id));
    if (r) setLineas(r.detalle.map((l) => ({ materialId: String(l.material_id), cantidad: String(l.cantidad), precio: String(l.precio_estimado) })));
  };

  return (
    <Modal ancho={760} titulo="Crear orden de compra" alCerrar={alCerrar} alEnviar={f.alEnviar} enviando={f.enviando} error={f.error} textoEnviar="Crear orden">
      <div className="rejilla" style={{ marginBottom: 14 }}>
        <Campo etiqueta="Requisición aprobada" value={v.requisicionId} onChange={elegirRequisicion} ayuda="Sin requisición, la orden queda pendiente de aprobación.">
          <option value="">Orden directa</option>
          {requisiciones.map((r) => <option key={r.id} value={r.id}>{r.numero}</option>)}
        </Campo>
        <Campo etiqueta="Proveedor" required value={v.proveedorId} onChange={f.cambiar('proveedorId')}>
          <option value="">Seleccione</option>
          {proveedores.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </Campo>
        {!v.requisicionId && (
          <>
            <Campo etiqueta="Área solicitante" required value={v.areaId} onChange={f.cambiar('areaId')}>
              <option value="">Seleccione</option>
              {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </Campo>
            <Campo etiqueta="Cotizaciones" type="number" min="0" max="20" value={v.cotizaciones} onChange={f.cambiar('cotizaciones')} />
          </>
        )}
        <Campo etiqueta="Fecha de emisión" type="date" value={v.fechaEmision} onChange={f.cambiar('fechaEmision')} />
      </div>
      <LineasForm lineas={lineas} setLineas={setLineas} materiales={materiales} />
    </Modal>
  );
}

const pendiente = (d) => Number(d.cantidad) - d.recepciones.reduce((s, r) => s + Number(r.cantidad_recibida), 0);

function FormRecepcion({ orden, bodegas, alCerrar, alGuardar }) {
  const [clave] = useState(nuevaClave);
  const lineasPendientes = orden.detalle.filter((d) => pendiente(d) > 0);
  const [cantidades, setCantidades] = useState(() => Object.fromEntries(lineasPendientes.map((d) => [d.material_id, String(pendiente(d))])));
  const f = useFormulario(
    { bodegaId: '', observaciones: '' },
    (v) => recepcionesApi.crear({
      ordenCompraId: orden.id,
      bodegaId: Number(v.bodegaId),
      claveIdempotencia: clave,
      ...(v.observaciones ? { observaciones: v.observaciones } : {}),
      lineas: Object.entries(cantidades).filter(([, c]) => Number(c) > 0).map(([m, c]) => ({ materialId: Number(m), cantidad: Number(c) })),
    }),
    { mensaje: 'Recepción registrada. El stock se actualizó.', alTerminar: alGuardar },
  );
  return (
    <Modal titulo={`Recibir ${orden.numero}`} alCerrar={alCerrar} alEnviar={f.alEnviar} enviando={f.enviando} error={f.error} textoEnviar="Registrar recepción">
      <div className="rejilla">
        <Campo clase="ancho" etiqueta="Bodega que recibe" required value={f.valores.bodegaId} onChange={f.cambiar('bodegaId')}>
          <option value="">Seleccione</option>
          {bodegas.map((b) => <option key={b.id} value={b.id}>{b.nombre}</option>)}
        </Campo>
        {lineasPendientes.map((d) => (
          <Campo key={d.id} etiqueta={d.material.nombre} type="number" min="0" max={pendiente(d)} step="any" value={cantidades[d.material_id]} ayuda={`Pendiente: ${numero(pendiente(d))} ${d.material.unidad}`} onChange={(e) => setCantidades({ ...cantidades, [d.material_id]: e.target.value })} />
        ))}
        <Campo clase="ancho" etiqueta="Observaciones" rows={2} value={f.valores.observaciones} onChange={f.cambiar('observaciones')} />
      </div>
    </Modal>
  );
}

function FormMotivo({ titulo, etiqueta, textoEnviar, enviar, mensaje, alCerrar, alGuardar }) {
  const f = useFormulario({ comentario: '' }, ({ comentario }) => enviar(comentario), { mensaje, alTerminar: alGuardar });
  return (
    <Modal titulo={titulo} alCerrar={alCerrar} alEnviar={f.alEnviar} enviando={f.enviando} error={f.error} textoEnviar={textoEnviar}>
      <Campo etiqueta={etiqueta} rows={3} required minLength={5} value={f.valores.comentario} onChange={f.cambiar('comentario')} />
    </Modal>
  );
}

function Duplicados({ puedeRevisar }) {
  const [estadoLista, setEstadoLista] = useState('PENDIENTE');
  const estado = useDatos(() => ordenesApi.duplicados(estadoLista), [estadoLista]);
  const [accion, setAccion] = useState(null);

  return (
    <>
      <Pestanas activa={estadoLista} alCambiar={setEstadoLista} opciones={[['PENDIENTE', 'Por revisar'], ['CONFIRMADA', 'Confirmadas'], ['DESCARTADA', 'Descartadas']]} />
      <Carga estado={estado}>
        {(d) => (d.length === 0 ? <p className="vacio">No hay sospechas en este estado.</p> : d.map((s) => (
          <article className="panel" key={s.id}>
            <div className="encabezado" style={{ marginBottom: 4 }}>
              <h3>{s.orden_a.numero} y {s.orden_b.numero}: {s.material.nombre}</h3>
              <div className="acciones">
                <span className={`estado ${s.confianza === 'ALTA' ? 'peligro' : 'aviso'}`}>Confianza {s.confianza === 'ALTA' ? 'alta' : 'media'}</span>
                {puedeRevisar && s.estado === 'PENDIENTE' && (
                  <>
                    <button type="button" className="chico" onClick={() => setAccion({ s, estado: 'CONFIRMADA' })}>Confirmar duplicado</button>
                    <button type="button" className="secundario chico" onClick={() => setAccion({ s, estado: 'DESCARTADA' })}>Descartar</button>
                  </>
                )}
              </div>
            </div>
            <ul className="motivos">{s.motivos.map((m) => <li key={m}>{m}</li>)}</ul>
            {s.comentario && <p style={{ marginTop: 8 }}>Revisión de {s.revisado_por?.nombre}: {s.comentario}</p>}
          </article>
        )))}
      </Carga>
      {accion && (
        <FormMotivo
          titulo={accion.estado === 'CONFIRMADA' ? 'Confirmar duplicado' : 'Descartar sospecha'}
          etiqueta="Resultado de la revisión"
          textoEnviar={accion.estado === 'CONFIRMADA' ? 'Confirmar duplicado' : 'Descartar sospecha'}
          mensaje="Revisión registrada."
          enviar={(comentario) => ordenesApi.revisarDuplicado(accion.s.id, { estado: accion.estado, comentario })}
          alCerrar={() => setAccion(null)}
          alGuardar={() => { setAccion(null); estado.recargar(); }}
        />
      )}
    </>
  );
}

export default function OrdenesPage() {
  const { puede } = useAuth();
  const [pestana, setPestana] = useState('ordenes');
  const estado = useDatos(() => ordenesApi.listar());
  const catalogos = useDatos(() => Promise.all([materialesApi.listar(), catalogosApi.areas(), catalogosApi.proveedores(), requisicionesApi.listar(), catalogosApi.bodegas()]));
  const [accion, setAccion] = useState(null);
  const terminar = () => { setAccion(null); estado.recargar(); catalogos.recargar(); };

  return (
    <>
      <Encabezado titulo="Órdenes de compra" descripcion="Una sospecha de duplicado avisa para revisar, nunca bloquea la orden.">
        {puede(PUEDE.crearOrden) && <button type="button" disabled={!catalogos.datos} onClick={() => setAccion({ tipo: 'crear' })}>Crear orden</button>}
      </Encabezado>
      <Pestanas activa={pestana} alCambiar={setPestana} opciones={[['ordenes', 'Órdenes'], ['duplicados', 'Posibles duplicados']]} />
      {pestana === 'duplicados' ? <Duplicados puedeRevisar={puede(PUEDE.revisarDuplicados)} /> : (
        <section className="panel">
          <Carga estado={estado}>
            {(d) => (
              <Tabla
                filas={d}
                vacio="Todavía no hay órdenes."
                columnas={[
                  { titulo: 'Orden', render: (o) => <>{o.numero}<span className="codigo">{fecha(o.fecha_emision)}</span></> },
                  { titulo: 'Proveedor', render: (o) => o.proveedor.nombre },
                  { titulo: 'Área', render: (o) => o.area.nombre },
                  { titulo: 'Detalle', render: (o) => o.detalle.map((l) => `${numero(l.cantidad)} ${l.material.nombre}`).join(', ') },
                  { titulo: 'Total', num: true, render: (o) => colones(o.total) },
                  { titulo: 'Estado', render: (o) => <><Estado valor={o.estado} />{o.fraccionamiento_sospechoso && <span className="codigo">{o.fraccionamiento_detalle.mensaje}</span>}</> },
                  {
                    titulo: 'Acciones',
                    render: (o) => (
                      <div className="acciones">
                        {puede(PUEDE.recibir) && ['EMITIDA', 'RECIBIDA_PARCIAL'].includes(o.estado) && <button type="button" className="chico" disabled={!catalogos.datos} onClick={() => setAccion({ tipo: 'recibir', orden: o })}>Recibir</button>}
                        {puede(PUEDE.crearOrden) && ['PENDIENTE_APROBACION', 'EMITIDA'].includes(o.estado) && <button type="button" className="peligro chico" onClick={() => setAccion({ tipo: 'anular', orden: o })}>Anular</button>}
                      </div>
                    ),
                  },
                ]}
              />
            )}
          </Carga>
        </section>
      )}
      {accion?.tipo === 'crear' && <FormOrden catalogos={[catalogos.datos[0], catalogos.datos[1], catalogos.datos[2], catalogos.datos[3].filter((r) => r.estado === 'APROBADA')]} alCerrar={() => setAccion(null)} alGuardar={terminar} />}
      {accion?.tipo === 'recibir' && <FormRecepcion orden={accion.orden} bodegas={catalogos.datos[4]} alCerrar={() => setAccion(null)} alGuardar={terminar} />}
      {accion?.tipo === 'anular' && <FormMotivo titulo={`Anular ${accion.orden.numero}`} etiqueta="Motivo de la anulación" textoEnviar="Anular orden" mensaje="Orden anulada." enviar={(c) => ordenesApi.anular(accion.orden.id, c)} alCerrar={() => setAccion(null)} alGuardar={terminar} />}
    </>
  );
}
