import { useState } from 'react';
import { Campo, Carga, Encabezado, Modal, Tabla } from '../components/Comunes';
import { PUEDE } from '../config/permisos';
import { useAuth } from '../context/AuthContext';
import { useDatos } from '../hooks/useDatos';
import { useFormulario } from '../hooks/useFormulario';
import { catalogosApi } from '../services/inventario.service';

function FormObra({ alCerrar, alGuardar }) {
  const f = useFormulario({ codigo: '', nombre: '' }, (v) => catalogosApi.crearObra(v), { mensaje: 'Obra registrada.', alTerminar: alGuardar });
  return (
    <Modal titulo="Registrar obra" alCerrar={alCerrar} alEnviar={f.alEnviar} enviando={f.enviando} error={f.error} textoEnviar="Registrar obra">
      <div className="rejilla">
        <Campo etiqueta="Código" required minLength={2} value={f.valores.codigo} onChange={f.cambiar('codigo')} />
        <Campo etiqueta="Nombre" required minLength={2} value={f.valores.nombre} onChange={f.cambiar('nombre')} />
      </div>
    </Modal>
  );
}

function FormBodega({ obras, alCerrar, alGuardar }) {
  const f = useFormulario(
    { codigo: '', nombre: '', obraId: '' },
    ({ obraId, ...v }) => catalogosApi.crearBodega({ ...v, ...(obraId ? { obraId: Number(obraId) } : {}) }),
    { mensaje: 'Bodega registrada.', alTerminar: alGuardar },
  );
  return (
    <Modal titulo="Registrar bodega" alCerrar={alCerrar} alEnviar={f.alEnviar} enviando={f.enviando} error={f.error} textoEnviar="Registrar bodega">
      <div className="rejilla">
        <Campo etiqueta="Código" required minLength={2} value={f.valores.codigo} onChange={f.cambiar('codigo')} />
        <Campo etiqueta="Nombre" required minLength={2} value={f.valores.nombre} onChange={f.cambiar('nombre')} />
        <Campo clase="ancho" etiqueta="Obra" value={f.valores.obraId} onChange={f.cambiar('obraId')}>
          <option value="">Bodega sin obra</option>
          {obras.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
        </Campo>
      </div>
    </Modal>
  );
}

export default function ObrasPage() {
  const { puede } = useAuth();
  const obras = useDatos(() => catalogosApi.obras());
  const bodegas = useDatos(() => catalogosApi.bodegas());
  const [abierto, setAbierto] = useState(null);
  const terminar = () => { setAbierto(null); obras.recargar(); bodegas.recargar(); };
  const crear = puede(PUEDE.crearObra);

  return (
    <>
      <Encabezado titulo="Obras y bodegas" descripcion="Cada existencia se ubica en una bodega; la bodega puede pertenecer a una obra.">
        {crear && <button type="button" className="secundario" onClick={() => setAbierto('obra')}>Registrar obra</button>}
        {crear && <button type="button" disabled={!obras.datos} onClick={() => setAbierto('bodega')}>Registrar bodega</button>}
      </Encabezado>
      <div className="columnas" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <section className="panel">
          <h2 style={{ marginBottom: 10 }}>Obras</h2>
          <Carga estado={obras}>
            {(d) => <Tabla filas={d} vacio="Registre la primera obra." columnas={[{ titulo: 'Código', render: (o) => o.codigo }, { titulo: 'Nombre', render: (o) => o.nombre }, { titulo: 'Bodegas', num: true, render: (o) => o.bodegas.length }]} />}
          </Carga>
        </section>
        <section className="panel">
          <h2 style={{ marginBottom: 10 }}>Bodegas</h2>
          <Carga estado={bodegas}>
            {(d) => <Tabla filas={d} vacio="Registre la primera bodega." columnas={[{ titulo: 'Código', render: (b) => b.codigo }, { titulo: 'Nombre', render: (b) => b.nombre }, { titulo: 'Obra', render: (b) => b.obra?.nombre ?? 'Sin obra asignada' }]} />}
          </Carga>
        </section>
      </div>
      {abierto === 'obra' && <FormObra alCerrar={() => setAbierto(null)} alGuardar={terminar} />}
      {abierto === 'bodega' && <FormBodega obras={obras.datos} alCerrar={() => setAbierto(null)} alGuardar={terminar} />}
    </>
  );
}
