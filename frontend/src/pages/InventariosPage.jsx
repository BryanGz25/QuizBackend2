import { useState } from 'react';
import { Campo, Carga, Encabezado, Tabla } from '../components/Comunes';
import { useDatos } from '../hooks/useDatos';
import { reportesApi } from '../services/gestion.service';
import { numero } from '../utils/formato';

export default function InventariosPage() {
  const estado = useDatos(() => reportesApi.inventario());
  const [bodega, setBodega] = useState('');
  const [obra, setObra] = useState('');

  return (
    <>
      <Encabezado titulo="Inventarios" descripcion="Existencias por bodega y obra, calculadas a partir de los movimientos." />
      <Carga estado={estado}>
        {(d) => {
          const bodegas = [...new Set(d.porUbicacion.map((f) => f.bodega))];
          const obras = [...new Set(d.porUbicacion.map((f) => f.obra).filter(Boolean))];
          const filas = d.porUbicacion.filter((f) => (!bodega || f.bodega === bodega) && (!obra || f.obra === obra));
          return (
            <section className="panel">
              <div className="rejilla" style={{ marginBottom: 14 }}>
                <Campo etiqueta="Bodega" value={bodega} onChange={(e) => setBodega(e.target.value)}>
                  <option value="">Todas</option>
                  {bodegas.map((b) => <option key={b}>{b}</option>)}
                </Campo>
                <Campo etiqueta="Obra" value={obra} onChange={(e) => setObra(e.target.value)}>
                  <option value="">Todas</option>
                  {obras.map((o) => <option key={o}>{o}</option>)}
                </Campo>
              </div>
              <Tabla
                llave={(f) => `${f.materialId}-${f.bodegaId}`}
                vacio="No hay existencias con estos filtros."
                filas={filas}
                columnas={[
                  { titulo: 'Material', render: (f) => <>{f.material}<span className="codigo">{f.codigo}</span></> },
                  { titulo: 'Bodega', render: (f) => f.bodega },
                  { titulo: 'Obra', render: (f) => f.obra ?? 'Sin obra asignada' },
                  { titulo: 'Cantidad', num: true, render: (f) => `${numero(f.cantidad)} ${f.unidad}` },
                ]}
              />
            </section>
          );
        }}
      </Carga>
    </>
  );
}
