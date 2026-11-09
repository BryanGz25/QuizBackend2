import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MENU } from '../config/permisos';

export default function Layout() {
  const { usuario, salir } = useAuth();
  const [abierto, setAbierto] = useState(false);
  useLocation();

  return (
    <div className="marco">
      <aside className={`lateral ${abierto ? 'abierto' : ''}`}>
        <div className="marca">
          Construct Inventory
          <small>Constructora Del Valle S.A.</small>
        </div>
        <nav aria-label="Principal">
          {MENU.map((g) => (
            <div key={g.grupo ?? 'inicio'}>
              {g.grupo && <div className="grupo">{g.grupo}</div>}
              {g.enlaces.map(([ruta, texto]) => (
                <NavLink key={ruta} to={ruta} end={ruta === '/'} onClick={() => setAbierto(false)}>{texto}</NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sesion">
          <strong>{usuario.nombre}</strong>
          {usuario.rolNombre}
          <div><button type="button" className="chico" onClick={salir}>Cerrar sesión</button></div>
        </div>
      </aside>
      <div style={{ minWidth: 0 }}>
        <div className="barra-movil">
          Construct Inventory
          <button type="button" className="chico" aria-expanded={abierto} onClick={() => setAbierto(!abierto)}>Menú</button>
        </div>
        <main className="contenido"><Outlet /></main>
      </div>
    </div>
  );
}
