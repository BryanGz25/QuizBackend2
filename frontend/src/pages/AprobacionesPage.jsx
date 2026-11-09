import { useState } from 'react';
import { Campo, Carga, Encabezado, Estado, Modal, Pestanas, Tabla } from '../components/Comunes';
import { useDatos } from '../hooks/useDatos';
import { useFormulario } from '../hooks/useFormulario';
import { aprobacionesApi } from '../services/compras.service';
import { colones, fechaHora } from '../utils/formato';

function FormDecision({ item, decision, alCerrar, alGuardar }) {
  const aprobar = decision === 'aprobar';
  const f = useFormulario(
    { comentario: '' },
    ({ comentario }) => aprobacionesApi[decision](item.tipo, item.documentoId, comentario),
    { mensaje: aprobar ? `${item.numero} aprobada en este paso.` : `${item.numero} rechazada.`, alTerminar: alGuardar },
  );
  return (
    <Modal titulo={`${aprobar ? 'Aprobar' : 'Rechazar'} ${item.numero}`} alCerrar={alCerrar} alEnviar={f.alEnviar} enviando={f.enviando} error={f.error} textoEnviar={aprobar ? 'Aprobar' : 'Rechazar'}>
      <Campo etiqueta={aprobar ? 'Comentario (opcional)' : 'Motivo del rechazo'} rows={3} required={!aprobar} minLength={aprobar ? undefined : 5} value={f.valores.comentario} onChange={f.cambiar('comentario')} />
    </Modal>
  );
}

function Pendientes() {
  const estado = useDatos(() => aprobacionesApi.pendientes());
  const [accion, setAccion] = useState(null);
  return (
    <section className="panel">
      <Carga estado={estado}>
        {(d) => (
          <Tabla
            filas={d}
            vacio="No tiene documentos esperando su aprobación."
            columnas={[
              { titulo: 'Documento', render: (a) => <>{a.numero}<span className="codigo">{a.tipo === 'orden' ? 'Orden de compra' : 'Requisición'}</span></> },
              { titulo: 'Área', render: (a) => a.area },
              { titulo: 'Monto', num: true, render: (a) => colones(a.monto) },
              { titulo: 'Evaluado por', num: true, render: (a) => colones(a.montoEvaluado) },
              { titulo: 'Cotizaciones', num: true, render: (a) => `${a.cotizaciones} de ${a.cotizacionesRequeridas}` },
              { titulo: 'Corresponde a', render: (a) => <>{a.rolRequerido}{a.fraccionamientoSospechoso && <span className="codigo">{a.fraccionamientoDetalle.mensaje}</span>}</> },
              {
                titulo: 'Decisión',
                render: (a) => (a.puedoDecidir ? (
                  <div className="acciones">
                    <button type="button" className="chico" onClick={() => setAccion({ item: a, decision: 'aprobar' })}>Aprobar</button>
                    <button type="button" className="peligro chico" onClick={() => setAccion({ item: a, decision: 'rechazar' })}>Rechazar</button>
                  </div>
                ) : 'Solo consulta'),
              },
            ]}
          />
        )}
      </Carga>
      {accion && <FormDecision {...accion} alCerrar={() => setAccion(null)} alGuardar={() => { setAccion(null); estado.recargar(); }} />}
    </section>
  );
}

function Historial() {
  const estado = useDatos(() => aprobacionesApi.historial());
  return (
    <section className="panel">
      <Carga estado={estado}>
        {(d) => (
          <Tabla
            filas={d}
            vacio="Todavía no hay decisiones registradas."
            columnas={[
              { titulo: 'Documento', render: (a) => a.requisicion?.numero ?? a.orden?.numero },
              { titulo: 'Paso', render: (a) => `${a.paso}. ${a.rol.nombre}` },
              { titulo: 'Decisión', render: (a) => <Estado valor={a.estado} /> },
              { titulo: 'Responsable', render: (a) => a.usuario?.nombre ?? 'No aplica' },
              { titulo: 'Fecha', render: (a) => (a.fecha_decision ? fechaHora(a.fecha_decision) : 'No aplica') },
              { titulo: 'Comentario', render: (a) => a.comentario ?? 'Sin comentario' },
            ]}
          />
        )}
      </Carga>
    </section>
  );
}

export default function AprobacionesPage() {
  const [pestana, setPestana] = useState('pendientes');
  return (
    <>
      <Encabezado titulo="Aprobaciones" descripcion="Cada documento avanza solo con la firma del rol que le corresponde según su monto." />
      <Pestanas activa={pestana} alCambiar={setPestana} opciones={[['pendientes', 'Pendientes'], ['historial', 'Historial']]} />
      {pestana === 'pendientes' ? <Pendientes /> : <Historial />}
    </>
  );
}
