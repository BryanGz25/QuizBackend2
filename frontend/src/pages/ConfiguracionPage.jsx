import { useState } from 'react';
import { Campo, Carga, Encabezado, Modal, Pestanas, Tabla } from '../components/Comunes';
import { useAvisos } from '../components/Avisos';
import { PUEDE } from '../config/permisos';
import { useAuth } from '../context/AuthContext';
import { useDatos } from '../hooks/useDatos';
import { useFormulario } from '../hooks/useFormulario';
import { adminApi } from '../services/gestion.service';
import { catalogosApi } from '../services/inventario.service';
import { colones, fechaHora } from '../utils/formato';

function FormUsuario({ roles, areas, alCerrar, alGuardar }) {
  const f = useFormulario(
    { nombre: '', email: '', password: '', rolId: '', areaId: '' },
    ({ rolId, areaId, ...v }) => adminApi.crearUsuario({ ...v, rolId: Number(rolId), ...(areaId ? { areaId: Number(areaId) } : {}) }),
    { mensaje: 'Usuario creado.', alTerminar: alGuardar },
  );
  const v = f.valores;
  return (
    <Modal titulo="Crear usuario" alCerrar={alCerrar} alEnviar={f.alEnviar} enviando={f.enviando} error={f.error} textoEnviar="Crear usuario">
      <div className="rejilla">
        <Campo etiqueta="Nombre" required value={v.nombre} onChange={f.cambiar('nombre')} />
        <Campo etiqueta="Correo" type="email" required value={v.email} onChange={f.cambiar('email')} />
        <Campo etiqueta="Contraseña" type="password" autoComplete="new-password" required minLength={8} value={v.password} onChange={f.cambiar('password')} />
        <Campo etiqueta="Rol" required value={v.rolId} onChange={f.cambiar('rolId')}>
          <option value="">Seleccione</option>
          {roles.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
        </Campo>
        <Campo etiqueta="Área" value={v.areaId} onChange={f.cambiar('areaId')}>
          <option value="">Sin área</option>
          {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
        </Campo>
      </div>
    </Modal>
  );
}

function Usuarios() {
  const { usuario } = useAuth();
  const { avisar } = useAvisos();
  const estado = useDatos(() => adminApi.usuarios());
  const catalogos = useDatos(() => Promise.all([adminApi.roles(), catalogosApi.areas()]));
  const [abierto, setAbierto] = useState(false);

  const alternar = async (u) => {
    try {
      await adminApi.actualizarUsuario(u.id, { activo: !u.activo });
      avisar(u.activo ? 'Usuario desactivado.' : 'Usuario activado.');
      estado.recargar();
    } catch (e) {
      avisar(e.message, 'error');
    }
  };

  return (
    <section className="panel">
      <div className="encabezado" style={{ marginBottom: 8 }}>
        <h2>Usuarios</h2>
        <button type="button" disabled={!catalogos.datos} onClick={() => setAbierto(true)}>Crear usuario</button>
      </div>
      <Carga estado={estado}>
        {(d) => (
          <Tabla
            filas={d}
            vacio="No hay usuarios."
            columnas={[
              { titulo: 'Nombre', render: (u) => <>{u.nombre}<span className="codigo">{u.email}</span></> },
              { titulo: 'Rol', render: (u) => u.rol.nombre },
              { titulo: 'Área', render: (u) => u.area?.nombre ?? 'Sin área' },
              { titulo: 'Estado', render: (u) => <span className={`estado ${u.activo ? 'ok' : ''}`}>{u.activo ? 'Activo' : 'Inactivo'}</span> },
              { titulo: 'Acción', render: (u) => (u.id === usuario.id ? 'Su usuario' : <button type="button" className="secundario chico" onClick={() => alternar(u)}>{u.activo ? 'Desactivar' : 'Activar'}</button>) },
            ]}
          />
        )}
      </Carga>
      {abierto && <FormUsuario roles={catalogos.datos[0]} areas={catalogos.datos[1]} alCerrar={() => setAbierto(false)} alGuardar={() => { setAbierto(false); estado.recargar(); }} />}
    </section>
  );
}

function FormParametro({ parametro, alCerrar, alGuardar }) {
  const f = useFormulario({ valor: parametro.valor }, ({ valor }) => adminApi.actualizarParametro(parametro.clave, Number(valor)), { mensaje: 'Regla actualizada.', alTerminar: alGuardar });
  return (
    <Modal titulo="Editar regla" alCerrar={alCerrar} alEnviar={f.alEnviar} enviando={f.enviando} error={f.error} textoEnviar="Guardar regla">
      <Campo etiqueta={parametro.descripcion} type="number" min="0" step="any" required value={f.valores.valor} onChange={f.cambiar('valor')} />
    </Modal>
  );
}

function FormTramo({ tramo, alCerrar, alGuardar }) {
  const f = useFormulario(
    { montoHasta: tramo.monto_hasta ?? '', cotizacionesRequeridas: tramo.cotizaciones_requeridas },
    (v) => adminApi.actualizarTramo(tramo.id, { montoHasta: v.montoHasta === '' ? null : Number(v.montoHasta), cotizacionesRequeridas: Number(v.cotizacionesRequeridas) }),
    { mensaje: 'Tramo actualizado.', alTerminar: alGuardar },
  );
  return (
    <Modal titulo={`Editar tramo de ${tramo.rol.nombre}`} alCerrar={alCerrar} alEnviar={f.alEnviar} enviando={f.enviando} error={f.error} textoEnviar="Guardar tramo">
      <div className="rejilla">
        <Campo etiqueta="Monto hasta" type="number" min="1" step="any" value={f.valores.montoHasta} onChange={f.cambiar('montoHasta')} ayuda="Déjelo vacío en el último tramo." />
        <Campo etiqueta="Cotizaciones" type="number" min="0" max="20" required value={f.valores.cotizacionesRequeridas} onChange={f.cambiar('cotizacionesRequeridas')} />
      </div>
    </Modal>
  );
}

function Reglas() {
  const { puede } = useAuth();
  const parametros = useDatos(() => adminApi.parametros());
  const matriz = useDatos(() => adminApi.matriz());
  const [edicion, setEdicion] = useState(null);
  const editar = puede(PUEDE.administrar);
  const terminar = () => { setEdicion(null); parametros.recargar(); matriz.recargar(); };

  return (
    <>
      <section className="panel">
        <h2 style={{ marginBottom: 10 }}>Matriz de aprobación</h2>
        <Carga estado={matriz}>
          {(d) => (
            <Tabla
              filas={d}
              vacio="La matriz está vacía."
              columnas={[
                { titulo: 'Monto hasta', num: true, render: (t) => (t.monto_hasta === null ? 'Sin tope' : colones(t.monto_hasta)) },
                { titulo: 'Aprueba', render: (t) => (t.requiere_comite ? `Comité de compras, luego ${t.rol.nombre}` : t.rol.nombre) },
                { titulo: 'Cotizaciones', num: true, render: (t) => t.cotizaciones_requeridas },
                ...(editar ? [{ titulo: 'Acción', render: (t) => <button type="button" className="secundario chico" onClick={() => setEdicion({ tramo: t })}>Editar</button> }] : []),
              ]}
            />
          )}
        </Carga>
      </section>
      <section className="panel">
        <h2 style={{ marginBottom: 10 }}>Reglas de detección</h2>
        <Carga estado={parametros}>
          {(d) => (
            <Tabla
              llave={(p) => p.clave}
              filas={d}
              vacio="No hay reglas."
              columnas={[
                { titulo: 'Regla', render: (p) => p.descripcion },
                { titulo: 'Valor', num: true, render: (p) => p.valor },
                ...(editar ? [{ titulo: 'Acción', render: (p) => <button type="button" className="secundario chico" onClick={() => setEdicion({ parametro: p })}>Editar</button> }] : []),
              ]}
            />
          )}
        </Carga>
      </section>
      {edicion?.tramo && <FormTramo tramo={edicion.tramo} alCerrar={() => setEdicion(null)} alGuardar={terminar} />}
      {edicion?.parametro && <FormParametro parametro={edicion.parametro} alCerrar={() => setEdicion(null)} alGuardar={terminar} />}
    </>
  );
}

function Auditoria() {
  const estado = useDatos(() => adminApi.auditoria());
  return (
    <section className="panel">
      <h2 style={{ marginBottom: 10 }}>Auditoría</h2>
      <Carga estado={estado}>
        {(d) => (
          <Tabla
            filas={d}
            vacio="Todavía no hay registros."
            columnas={[
              { titulo: 'Fecha', render: (a) => fechaHora(a.creado_en) },
              { titulo: 'Usuario', render: (a) => a.usuario?.nombre ?? 'Sistema' },
              { titulo: 'Acción', render: (a) => a.accion },
              { titulo: 'Entidad', render: (a) => `${a.entidad} ${a.entidad_id}` },
            ]}
          />
        )}
      </Carga>
    </section>
  );
}

export default function ConfiguracionPage() {
  const { puede } = useAuth();
  const opciones = [['reglas', 'Reglas y matriz']];
  if (puede(PUEDE.administrar)) opciones.unshift(['usuarios', 'Usuarios']);
  if (puede(PUEDE.verAuditoria)) opciones.push(['auditoria', 'Auditoría']);
  const [pestana, setPestana] = useState(opciones[0][0]);
  return (
    <>
      <Encabezado titulo="Usuarios y configuración" descripcion="Accesos y reglas del negocio. Se cambian aquí, sin tocar el código." />
      <Pestanas activa={pestana} alCambiar={setPestana} opciones={opciones} />
      {pestana === 'usuarios' && <Usuarios />}
      {pestana === 'reglas' && <Reglas />}
      {pestana === 'auditoria' && <Auditoria />}
    </>
  );
}
