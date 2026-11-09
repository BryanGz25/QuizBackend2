import { useState } from 'react';
import { Campo, Carga, Encabezado, Modal, Tabla } from '../components/Comunes';
import { PUEDE } from '../config/permisos';
import { useAuth } from '../context/AuthContext';
import { useDatos } from '../hooks/useDatos';
import { useFormulario } from '../hooks/useFormulario';
import { catalogosApi } from '../services/inventario.service';
import { colones } from '../utils/formato';

function FormProveedor({ alCerrar, alGuardar }) {
  const f = useFormulario({ codigo: '', nombre: '' }, (v) => catalogosApi.crearProveedor(v), { mensaje: 'Proveedor registrado.', alTerminar: alGuardar });
  return (
    <Modal titulo="Registrar proveedor" alCerrar={alCerrar} alEnviar={f.alEnviar} enviando={f.enviando} error={f.error} textoEnviar="Registrar proveedor">
      <div className="rejilla">
        <Campo etiqueta="Código" required minLength={2} value={f.valores.codigo} onChange={f.cambiar('codigo')} />
        <Campo etiqueta="Nombre" required minLength={2} value={f.valores.nombre} onChange={f.cambiar('nombre')} />
      </div>
    </Modal>
  );
}

export default function ProveedoresPage() {
  const { puede } = useAuth();
  const estado = useDatos(() => catalogosApi.proveedores());
  const [abierto, setAbierto] = useState(false);
  return (
    <>
      <Encabezado titulo="Proveedores" descripcion="Empresas registradas y precios de sus contratos vigentes.">
        {puede(PUEDE.crearProveedor) && <button type="button" onClick={() => setAbierto(true)}>Registrar proveedor</button>}
      </Encabezado>
      <section className="panel">
        <Carga estado={estado}>
          {(d) => (
            <Tabla
              filas={d}
              vacio="Registre el primer proveedor."
              columnas={[
                { titulo: 'Código', render: (p) => p.codigo },
                { titulo: 'Nombre', render: (p) => p.nombre },
                { titulo: 'Contratos vigentes', render: (p) => (p.contratos.length ? p.contratos.map((c) => `${c.material.nombre}: ${colones(c.precio)}`).join('; ') : 'Sin contrato') },
              ]}
            />
          )}
        </Carga>
      </section>
      {abierto && <FormProveedor alCerrar={() => setAbierto(false)} alGuardar={() => { setAbierto(false); estado.recargar(); }} />}
    </>
  );
}
