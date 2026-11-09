import { Campo } from './Comunes';

/** Filas editables de material, cantidad y precio; se usa en requisiciones y órdenes. */
export default function LineasForm({ lineas, setLineas, materiales }) {
  const cambiar = (i, campo, valor) => setLineas(lineas.map((l, j) => (j === i ? { ...l, [campo]: valor } : l)));
  return (
    <div className="lineas-form">
      {lineas.map((l, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div className="linea-form" key={i}>
          <Campo etiqueta="Material" required value={l.materialId} onChange={(e) => cambiar(i, 'materialId', e.target.value)}>
            <option value="">Seleccione</option>
            {materiales.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </Campo>
          <Campo etiqueta="Cantidad" type="number" min="0.001" step="any" required value={l.cantidad} onChange={(e) => cambiar(i, 'cantidad', e.target.value)} />
          <Campo etiqueta="Precio unitario" type="number" min="0" step="any" required value={l.precio} onChange={(e) => cambiar(i, 'precio', e.target.value)} />
          <button type="button" className="peligro chico" disabled={lineas.length === 1} aria-label={`Quitar línea ${i + 1}`} onClick={() => setLineas(lineas.filter((_, j) => j !== i))}>Quitar</button>
        </div>
      ))}
      <div><button type="button" className="secundario chico" onClick={() => setLineas([...lineas, { materialId: '', cantidad: '', precio: '' }])}>Agregar línea</button></div>
    </div>
  );
}
