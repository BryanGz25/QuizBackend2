import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Campo, Carga, Encabezado, Estado, Pestanas, Tabla } from '../components/Comunes';
import { useDatos } from '../hooks/useDatos';
import { reportesApi } from '../services/gestion.service';
import { colones, fecha, numero } from '../utils/formato';

function Inventario() {
  const estado = useDatos(() => reportesApi.inventario());
  return (
    <section className="panel">
      <h2>Niveles por material</h2>
      <p className="ayuda">Stock de seguridad y punto de reorden calculados con las fórmulas del ejercicio A5.</p>
      <Carga estado={estado}>
        {(d) => (
          <Tabla
            filas={d.materiales}
            vacio="No hay materiales."
            columnas={[
              { titulo: 'Material', render: (m) => m.nombre },
              { titulo: 'Promedio al día', num: true, render: (m) => numero(m.demanda_promedio_dia) },
              { titulo: 'Máxima al día', num: true, render: (m) => numero(m.demanda_maxima_dia) },
              { titulo: 'Entrega (días)', num: true, render: (m) => numero(m.tiempo_entrega_dias) },
              { titulo: 'Seguridad', num: true, render: (m) => numero(m.stock_seguridad) },
              { titulo: 'Reorden', num: true, render: (m) => numero(m.punto_reorden) },
              { titulo: 'Stock', num: true, render: (m) => numero(m.stock_actual) },
              { titulo: 'Diferencia', num: true, render: (m) => numero(m.diferencia) },
              { titulo: 'Estado', render: (m) => <Estado valor={m.estado} /> },
            ]}
          />
        )}
      </Carga>
    </section>
  );
}

function Consolidacion() {
  const estado = useDatos(() => reportesApi.consolidacion());
  return (
    <Carga estado={estado}>
      {(d) => (
        <>
          <div className="tiras">
            <span className="tira"><strong>{colones(d.ahorroTotal)}</strong>ahorro potencial, {numero(d.porcentajeTotal)} %</span>
            <span className="tira"><strong>{colones(d.ahorroSoloValidados)}</strong>sin contar lo que falta validar</span>
          </div>
          {d.insumos.map((i) => (
            <section className="panel" key={i.materialId}>
              <h2>{i.material}</h2>
              <p className="ayuda">{numero(i.cantidad)} unidades al menor precio observado, {colones(i.precioMinimo)}: de {colones(i.costoOriginal)} a {colones(i.costoConsolidado)}. Ahorro de {colones(i.ahorro)}, {numero(i.porcentaje)} %.</p>
              <Tabla
                llave={(l) => l.numero}
                filas={i.lineas}
                vacio=""
                columnas={[
                  { titulo: 'Descripción en el ERP', render: (l) => l.descripcion },
                  { titulo: 'Área', render: (l) => l.area },
                  { titulo: 'Proveedor', render: (l) => l.proveedor },
                  { titulo: 'Cantidad', num: true, render: (l) => numero(l.cantidad) },
                  { titulo: 'Precio', num: true, render: (l) => colones(l.precio) },
                  { titulo: 'Equivalencia', render: (l) => <><Estado valor={l.estado} /><span className="codigo">{l.justificacion}</span></> },
                ]}
              />
            </section>
          ))}
        </>
      )}
    </Carga>
  );
}

function FugaValor() {
  const [mes, setMes] = useState('2026-10');
  const estado = useDatos(() => reportesApi.fugaValor(mes), [mes]);
  return (
    <>
      <section className="panel">
        <Campo etiqueta="Mes" type="month" value={mes} onChange={(e) => e.target.value && setMes(e.target.value)} style={{ maxWidth: 220 }} />
      </section>
      <Carga estado={estado}>
        {(d) => (
          <>
            <section className="panel">
              <h2>Escenarios de fuga de valor</h2>
              <p className="ayuda">{d.nota}</p>
              <Tabla
                llave={(e) => e.nombre}
                filas={d.escenarios}
                vacio=""
                columnas={[
                  { titulo: 'Escenario', render: (e) => <>{e.nombre}{e.ordenesSospechosas.length > 0 && <span className="codigo">Órdenes: {e.ordenesSospechosas.join(', ')}</span>}</> },
                  { titulo: 'Mensual', num: true, render: (e) => colones(e.mensual) },
                  { titulo: 'Proyección anual', num: true, render: (e) => colones(e.anual) },
                ]}
              />
            </section>
            <section className="panel">
              <h2>Sobreprecio por orden</h2>
              <p className="ayuda">Gasto del mes: {colones(d.gasto)}. Fuera de contrato: {colones(d.gastoFueraContrato)}, {numero(d.porcentajeFueraContrato)} %.</p>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={d.lineas} margin={{ left: 8, right: 8 }} barCategoryGap={10}>
                  <CartesianGrid vertical={false} stroke="#c9cfce" />
                  <XAxis dataKey="numero" tick={{ fill: '#20262b', fontSize: 13 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => numero(v)} tick={{ fill: '#515c64', fontSize: 13 }} axisLine={false} tickLine={false} width={64} />
                  <Tooltip formatter={(v) => [colones(v), 'Sobreprecio']} cursor={{ fill: '#e6e9e9' }} />
                  <Bar dataKey="sobreprecioTotal" fill="#1f4e79" radius={[4, 4, 0, 0]} maxBarSize={44} />
                </BarChart>
              </ResponsiveContainer>
              <Tabla
                llave={(l) => l.numero + l.material}
                filas={d.lineas}
                vacio="No hay órdenes en este mes."
                columnas={[
                  { titulo: 'Orden', render: (l) => <>{l.numero}<span className="codigo">{fecha(l.fecha)}</span></> },
                  { titulo: 'Proveedor', render: (l) => l.proveedor },
                  { titulo: 'Artículo', render: (l) => l.material },
                  { titulo: 'Cantidad', num: true, render: (l) => numero(l.cantidad) },
                  { titulo: 'Precio', num: true, render: (l) => colones(l.precio) },
                  { titulo: 'Contrato', num: true, render: (l) => colones(l.precioContrato) },
                  { titulo: 'Sobreprecio', num: true, render: (l) => colones(l.sobreprecioTotal) },
                  { titulo: 'Clasificación', render: (l) => <Estado valor={l.clasificacion} /> },
                ]}
              />
            </section>
          </>
        )}
      </Carga>
    </>
  );
}

function Conciliacion() {
  const estado = useDatos(() => reportesApi.conciliacion());
  return (
    <section className="panel">
      <h2>Conciliación de stock</h2>
      <p className="ayuda">Compara el saldo guardado con el que resulta de sumar todos los movimientos.</p>
      <Carga estado={estado}>
        {(d) => (d.consistente
          ? <p><span className="estado ok">Sin diferencias</span> Se revisaron {d.filasRevisadas} combinaciones de material y bodega.</p>
          : <Tabla llave={(f) => `${f.materialId}-${f.bodegaId}`} filas={d.diferencias} vacio="" columnas={[{ titulo: 'Material', render: (f) => f.materialId }, { titulo: 'Bodega', render: (f) => f.bodegaId }, { titulo: 'Guardado', num: true, render: (f) => numero(f.guardado) }, { titulo: 'Calculado', num: true, render: (f) => numero(f.calculado) }]} />)}
      </Carga>
    </section>
  );
}

const VISTAS = { inventario: Inventario, consolidacion: Consolidacion, fuga: FugaValor, conciliacion: Conciliacion };

export default function ReportesPage() {
  const [pestana, setPestana] = useState('inventario');
  const Vista = VISTAS[pestana];
  return (
    <>
      <Encabezado titulo="Reportes" descripcion="Cifras calculadas en vivo desde la base de datos." />
      <Pestanas activa={pestana} alCambiar={setPestana} opciones={[['inventario', 'Inventario'], ['consolidacion', 'Consolidación de compras'], ['fuga', 'Fuga de valor'], ['conciliacion', 'Conciliación']]} />
      <Vista />
    </>
  );
}
