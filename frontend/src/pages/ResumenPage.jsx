import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Carga, Encabezado, Estado, Tabla } from '../components/Comunes';
import NivelStock from '../components/NivelStock';
import { useAuth } from '../context/AuthContext';
import { useDatos } from '../hooks/useDatos';
import { reportesApi } from '../services/gestion.service';
import { colones, fechaHora, numero } from '../utils/formato';

const Tira = ({ valor, texto }) => <span className="tira"><strong>{numero(valor)}</strong>{texto}</span>;

function PorReponer({ datos }) {
  const orden = [...datos.stockVsReorden].sort((a, b) => a.porcentaje - b.porcentaje);
  return (
    <section className="panel">
      <h2>Niveles de stock</h2>
      <p className="ayuda">Ordenados del más comprometido al más holgado. La marca roja es el punto de reorden.</p>
      <ul className="reponer">
        {orden.map((m) => (
          <li key={m.material}>
            <strong>{m.material}</strong>
            <NivelStock stock={m.stock} puntoReorden={m.puntoReorden} unidad={m.unidad} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function GastoProveedor({ datos }) {
  return (
    <section className="panel">
      <h2>Gasto por proveedor</h2>
      <p className="ayuda">Total de órdenes vigentes, en colones.</p>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={datos} layout="vertical" margin={{ left: 12, right: 12 }} barCategoryGap={8}>
          <CartesianGrid horizontal={false} stroke="#c9cfce" />
          <XAxis type="number" tickFormatter={(v) => `${v / 1000000} M`} tick={{ fill: '#515c64', fontSize: 13 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="proveedor" width={92} tick={{ fill: '#20262b', fontSize: 14 }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(v) => [colones(v), 'Gasto']} cursor={{ fill: '#e6e9e9' }} />
          <Bar dataKey="total" fill="#1f4e79" radius={[0, 4, 4, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

export default function ResumenPage() {
  const { usuario } = useAuth();
  const estado = useDatos(() => reportesApi.dashboard(), [usuario.id]);

  return (
    <>
      <Encabezado titulo="Resumen" descripcion="Lo que requiere atención hoy en inventario y compras." />
      <Carga estado={estado}>
        {(d) => (
          <>
            <div className="tiras">
              <Tira valor={d.indicadores.bajoPuntoReorden} texto="por reponer" />
              <Tira valor={d.indicadores.alertasActivas} texto="alertas activas" />
              <Tira valor={d.indicadores.aprobacionesPendientes} texto="aprobaciones pendientes" />
              <Tira valor={d.indicadores.posiblesDuplicados} texto="posibles duplicados" />
              <Tira valor={d.indicadores.materiales} texto="materiales" />
              <Tira valor={d.indicadores.obras} texto="obras" />
              <Tira valor={d.indicadores.bodegas} texto="bodegas" />
            </div>
            <div className="columnas">
              <div>
                <PorReponer datos={d} />
                <section className="panel">
                  <h2>Movimientos recientes</h2>
                  <Tabla
                    vacio="Todavía no hay movimientos."
                    filas={d.movimientosRecientes}
                    columnas={[
                      { titulo: 'Fecha', render: (m) => fechaHora(m.fecha_movimiento) },
                      { titulo: 'Tipo', render: (m) => <Estado valor={m.tipo} /> },
                      { titulo: 'Material', render: (m) => m.material.nombre },
                      { titulo: 'Cantidad', num: true, render: (m) => `${numero(m.cantidad)} ${m.material.unidad}` },
                    ]}
                  />
                </section>
              </div>
              <div>
                <section className="panel">
                  <h2>Posibles compras duplicadas</h2>
                  <p className="ayuda">Requieren revisión. Una sospecha no confirma el duplicado.</p>
                  {d.posiblesDuplicados.length === 0 && <p className="vacio">No hay sospechas pendientes.</p>}
                  {d.posiblesDuplicados.map((s) => (
                    <p key={s.id} style={{ marginBottom: 8 }}>
                      <Link to="/ordenes">{s.orden_a.numero} y {s.orden_b.numero}</Link>, {s.material.nombre}. Confianza {s.confianza === 'ALTA' ? 'alta' : 'media'}.
                    </p>
                  ))}
                </section>
                <section className="panel">
                  <h2>Pendientes de aprobación</h2>
                  {d.aprobacionesPendientes.length === 0 && <p className="vacio">No hay documentos esperando aprobación.</p>}
                  {d.aprobacionesPendientes.map((a) => (
                    <p key={a.id} style={{ marginBottom: 8 }}>
                      <Link to="/aprobaciones">{a.numero}</Link>, {colones(a.monto)}. Corresponde a {a.rolRequerido}.
                    </p>
                  ))}
                </section>
                <GastoProveedor datos={d.gastoPorProveedor} />
              </div>
            </div>
          </>
        )}
      </Carga>
    </>
  );
}
