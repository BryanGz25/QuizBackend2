import { useState } from 'react';
import { Campo, Carga, Encabezado, Estado, Modal, Tabla } from '../components/Comunes';
import LineasForm from '../components/LineasForm';
import { PUEDE } from '../config/permisos';
import { useAuth } from '../context/AuthContext';
import { useDatos } from '../hooks/useDatos';
import { useFormulario } from '../hooks/useFormulario';
import { requisicionesApi } from '../services/compras.service';
import { catalogosApi, materialesApi } from '../services/inventario.service';
import { colones, fechaHora } from '../utils/formato';

function FormRequisicion({ catalogos, usuario, alCerrar, alGuardar }) {
  const [materiales, areas, proveedores] = catalogos;
  const [lineas, setLineas] = useState([{ materialId: '', cantidad: '', precio: '' }]);
  const f = useFormulario(
    { areaId: usuario.areaId ? String(usuario.areaId) : '', proveedorSugeridoId: '', justificacion: '', cotizaciones: '' },
    (v) => requisicionesApi.crear({
      justificacion: v.justificacion,
      ...(v.areaId ? { areaId: Number(v.areaId) } : {}),
      ...(v.proveedorSugeridoId ? { proveedorSugeridoId: Number(v.proveedorSugeridoId) } : {}),
      cotizaciones: Number(v.cotizaciones || 0),
      lineas: lineas.map((l) => ({ materialId: Number(l.materialId), cantidad: Number(l.cantidad), precioEstimado: Number(l.precio) })),
    }),
    {
      mensaje: (r) => (r.fraccionamiento_sospechoso ? `${r.numero} creada. Se escaló por posible fraccionamiento.` : `${r.numero} creada. Aprueba: ${r.aprobaciones[0].rol.nombre}.`),
      alTerminar: alGuardar,
    },
  );
  const v = f.valores;
  return (
    <Modal ancho={760} titulo="Crear requisición" alCerrar={alCerrar} alEnviar={f.alEnviar} enviando={f.enviando} error={f.error} textoEnviar="Crear requisición">
      <div className="rejilla" style={{ marginBottom: 14 }}>
        <Campo etiqueta="Área solicitante" required value={v.areaId} onChange={f.cambiar('areaId')}>
          <option value="">Seleccione</option>
          {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
        </Campo>
        <Campo etiqueta="Proveedor sugerido" value={v.proveedorSugeridoId} onChange={f.cambiar('proveedorSugeridoId')}>
          <option value="">Sin sugerencia</option>
          {proveedores.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </Campo>
        <Campo etiqueta="Cotizaciones" type="number" min="0" max="20" value={v.cotizaciones} onChange={f.cambiar('cotizaciones')} />
        <Campo clase="ancho" etiqueta="Justificación" rows={2} required minLength={5} value={v.justificacion} onChange={f.cambiar('justificacion')} />
      </div>
      <LineasForm lineas={lineas} setLineas={setLineas} materiales={materiales} />
    </Modal>
  );
}

export default function RequisicionesPage() {
  const { puede, usuario } = useAuth();
  const estado = useDatos(() => requisicionesApi.listar());
  const catalogos = useDatos(() => Promise.all([materialesApi.listar(), catalogosApi.areas(), catalogosApi.proveedores()]));
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <Encabezado titulo="Requisiciones" descripcion="El sistema decide quién aprueba según el monto y lo acumulado por área y categoría.">
        {puede(PUEDE.solicitar) && <button type="button" disabled={!catalogos.datos} onClick={() => setAbierto(true)}>Crear requisición</button>}
      </Encabezado>
      <section className="panel">
        <Carga estado={estado}>
          {(d) => (
            <Tabla
              filas={d}
              vacio="Todavía no hay requisiciones."
              columnas={[
                { titulo: 'Número', render: (r) => <>{r.numero}<span className="codigo">{fechaHora(r.creado_en)}</span></> },
                { titulo: 'Área', render: (r) => r.area.nombre },
                { titulo: 'Detalle', render: (r) => r.detalle.map((l) => l.material.nombre).join(', ') },
                { titulo: 'Proveedor', render: (r) => r.proveedor?.nombre ?? 'Sin sugerencia' },
                { titulo: 'Monto', num: true, render: (r) => colones(r.monto_total) },
                { titulo: 'Cotizaciones', num: true, render: (r) => `${r.cotizaciones} de ${r.cotizaciones_requeridas}` },
                { titulo: 'Aprueba', render: (r) => r.aprobaciones.map((a) => a.rol.nombre).join(', luego ') },
                { titulo: 'Estado', render: (r) => <><Estado valor={r.estado} />{r.fraccionamiento_sospechoso && <span className="codigo">{r.fraccionamiento_detalle.mensaje}</span>}</> },
              ]}
            />
          )}
        </Carga>
      </section>
      {abierto && <FormRequisicion catalogos={catalogos.datos} usuario={usuario} alCerrar={() => setAbierto(false)} alGuardar={() => { setAbierto(false); estado.recargar(); }} />}
    </>
  );
}
