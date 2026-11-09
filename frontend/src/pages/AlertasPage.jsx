import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Campo, Carga, Encabezado, Estado, Modal, Pestanas, Tabla } from '../components/Comunes';
import { PUEDE } from '../config/permisos';
import { useAuth } from '../context/AuthContext';
import { useDatos } from '../hooks/useDatos';
import { useFormulario } from '../hooks/useFormulario';
import { alertasApi } from '../services/inventario.service';
import { fechaHora, numero } from '../utils/formato';

function FormCerrar({ alerta, estado, alCerrar, alGuardar }) {
  const f = useFormulario({ comentario: '' }, ({ comentario }) => alertasApi.cambiarEstado(alerta.id, { estado, comentario }), { mensaje: estado === 'CERRADA' ? 'Alerta cerrada.' : 'Alerta marcada como atendida.', alTerminar: alGuardar });
  return (
    <Modal titulo={`${estado === 'CERRADA' ? 'Cerrar' : 'Atender'} alerta de ${alerta.material.nombre}`} alCerrar={alCerrar} alEnviar={f.alEnviar} enviando={f.enviando} error={f.error} textoEnviar={estado === 'CERRADA' ? 'Cerrar alerta' : 'Marcar como atendida'}>
      <Campo etiqueta="Comentario" rows={3} required minLength={3} value={f.valores.comentario} onChange={f.cambiar('comentario')} />
    </Modal>
  );
}

function FormRequisicion({ alerta, alCerrar, alGuardar }) {
  const f = useFormulario(
    { precioEstimado: '', cotizaciones: '' },
    (v) => alertasApi.generarRequisicion(alerta.id, {
      ...(v.precioEstimado ? { precioEstimado: Number(v.precioEstimado) } : {}),
      ...(v.cotizaciones ? { cotizaciones: Number(v.cotizaciones) } : {}),
    }),
    { mensaje: (r) => `Requisición ${r.requisicion.numero} creada${r.sugerencia.recomendado ? ` con ${r.sugerencia.recomendado.proveedor}` : ''}.`, alTerminar: alGuardar },
  );
  return (
    <Modal titulo={`Generar requisición de ${alerta.material.nombre}`} alCerrar={alCerrar} alEnviar={f.alEnviar} enviando={f.enviando} error={f.error} textoEnviar="Generar requisición">
      <p style={{ marginBottom: 12 }}>El sistema propone la cantidad para llegar al stock máximo y el proveedor de menor precio entre contratos y últimas compras.</p>
      <div className="rejilla">
        <Campo etiqueta="Precio estimado" type="number" min="0.01" step="any" value={f.valores.precioEstimado} onChange={f.cambiar('precioEstimado')} ayuda="Obligatorio solo si el material no tiene contrato ni historial." />
        <Campo etiqueta="Cotizaciones disponibles" type="number" min="0" max="20" value={f.valores.cotizaciones} onChange={f.cambiar('cotizaciones')} />
      </div>
    </Modal>
  );
}

export default function AlertasPage() {
  const { puede } = useAuth();
  const [pestana, setPestana] = useState('PENDIENTE');
  const estado = useDatos(() => alertasApi.listar(pestana), [pestana]);
  const [accion, setAccion] = useState(null);
  const gestionar = puede(PUEDE.gestionarAlertas);
  const terminar = () => { setAccion(null); estado.recargar(); };

  const columnas = [
    { titulo: 'Prioridad', render: (a) => <Estado valor={a.prioridad} /> },
    { titulo: 'Material', render: (a) => <>{a.material.nombre}<span className="codigo">{a.material.codigo}</span></> },
    { titulo: 'Ubicación', render: (a) => a.ubicacion },
    { titulo: 'Stock', num: true, render: (a) => numero(a.stock_actual) },
    { titulo: 'Reorden', num: true, render: (a) => numero(a.punto_reorden) },
    { titulo: 'Faltante', num: true, render: (a) => numero(a.faltante) },
    { titulo: 'Fecha', render: (a) => fechaHora(a.creada_en) },
    { titulo: 'Seguimiento', render: (a) => (a.requisiciones.length ? <Link to="/requisiciones">{a.requisiciones[0].numero}</Link> : a.comentario ?? 'Sin gestión') },
  ];
  if (gestionar && pestana !== 'CERRADA') {
    columnas.push({
      titulo: 'Acciones',
      render: (a) => (
        <div className="acciones">
          {!a.requisiciones.some((r) => ['PENDIENTE', 'APROBADA'].includes(r.estado)) && <button type="button" className="chico" onClick={() => setAccion({ tipo: 'requisicion', alerta: a })}>Generar requisición</button>}
          {pestana === 'PENDIENTE' && <button type="button" className="secundario chico" onClick={() => setAccion({ tipo: 'ATENDIDA', alerta: a })}>Atender</button>}
          <button type="button" className="secundario chico" onClick={() => setAccion({ tipo: 'CERRADA', alerta: a })}>Cerrar</button>
        </div>
      ),
    });
  }

  return (
    <>
      <Encabezado titulo="Alertas" descripcion="Se abren cuando el stock llega al punto de reorden y se cierran solas cuando se recupera." />
      <Pestanas activa={pestana} alCambiar={setPestana} opciones={[['PENDIENTE', 'Pendientes'], ['ATENDIDA', 'Atendidas'], ['CERRADA', 'Cerradas']]} />
      <section className="panel">
        <Carga estado={estado}>{(d) => <Tabla columnas={columnas} filas={d} vacio="No hay alertas en este estado." />}</Carga>
      </section>
      {accion?.tipo === 'requisicion' && <FormRequisicion alerta={accion.alerta} alCerrar={() => setAccion(null)} alGuardar={terminar} />}
      {accion && accion.tipo !== 'requisicion' && <FormCerrar alerta={accion.alerta} estado={accion.tipo} alCerrar={() => setAccion(null)} alGuardar={terminar} />}
    </>
  );
}
