import { useEffect, useId, useRef } from 'react';
import { textoEstado } from '../utils/formato';

export function Encabezado({ titulo, descripcion, children }) {
  return (
    <header className="encabezado">
      <div>
        <h1>{titulo}</h1>
        {descripcion && <p>{descripcion}</p>}
      </div>
      {children && <div className="acciones">{children}</div>}
    </header>
  );
}

export function Estado({ valor }) {
  const [texto, clase] = textoEstado(valor);
  return <span className={`estado ${clase}`}>{texto}</span>;
}

export function Campo({ etiqueta, ayuda, clase = '', children, ...props }) {
  const id = useId();
  return (
    <div className={`campo ${clase}`}>
      <label htmlFor={id}>{etiqueta}</label>
      {children ? <select id={id} {...props}>{children}</select> : props.rows ? <textarea id={id} {...props} /> : <input id={id} {...props} />}
      {ayuda && <small>{ayuda}</small>}
    </div>
  );
}

export function ErrorForm({ error }) {
  if (!error) return null;
  return (
    <div className="error-form" role="alert">
      {error.mensaje}
      {Array.isArray(error.detalles) && (
        <ul>{error.detalles.map((d) => <li key={`${d.campo}${d.mensaje}`}>{d.mensaje}</li>)}</ul>
      )}
    </div>
  );
}

export function Modal({ titulo, alCerrar, alEnviar, enviando, error, textoEnviar, children, ancho }) {
  const caja = useRef(null);

  useEffect(() => {
    caja.current?.querySelector('input, select, textarea')?.focus();
    const tecla = (e) => e.key === 'Escape' && alCerrar();
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [alCerrar]);

  return (
    <div className="velo">
      <form ref={caja} className="modal" role="dialog" aria-modal="true" aria-label={titulo} onSubmit={alEnviar} style={ancho ? { width: `min(${ancho}px, 100%)` } : undefined}>
        <h2 style={{ marginBottom: 14 }}>{titulo}</h2>
        <ErrorForm error={error} />
        {children}
        <div className="modal-pie">
          <button type="button" className="secundario" onClick={alCerrar}>Cancelar</button>
          <button type="submit" disabled={enviando}>{enviando ? 'Guardando' : textoEnviar}</button>
        </div>
      </form>
    </div>
  );
}

export function Tabla({ columnas, filas, vacio, llave = (f) => f.id }) {
  if (!filas.length) return <p className="vacio">{vacio}</p>;
  return (
    <div className="tabla-envoltura">
      <table>
        <thead>
          <tr>{columnas.map((c) => <th key={c.titulo} className={c.num ? 'num' : undefined}>{c.titulo}</th>)}</tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={llave(f)}>
              {columnas.map((c) => <td key={c.titulo} className={c.num ? 'num' : undefined}>{c.render(f)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Muestra carga o error y, cuando hay datos, el contenido. */
export function Carga({ estado, children }) {
  if (estado.error) return <div className="error-form" role="alert">{estado.error}</div>;
  if (estado.cargando || estado.datos === null) return <p className="vacio">Cargando datos</p>;
  return children(estado.datos);
}

export function Pestanas({ opciones, activa, alCambiar }) {
  return (
    <div className="pestanas" role="tablist">
      {opciones.map(([valor, texto]) => (
        <button key={valor} type="button" role="tab" aria-selected={activa === valor} onClick={() => alCambiar(valor)}>{texto}</button>
      ))}
    </div>
  );
}
