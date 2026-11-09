import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { configurarNoAutorizado, tokenStorage } from '../services/api';
import { authApi } from '../services/gestion.service';

const AuthContext = createContext(null);
const CLAVE_USUARIO = 'construct.usuario';

const leerUsuario = () => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_USUARIO));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => (tokenStorage.leer() ? leerUsuario() : null));

  const salir = useCallback(() => {
    tokenStorage.borrar();
    try {
      localStorage.removeItem(CLAVE_USUARIO);
    } catch {
      /* nada que borrar */
    }
    setUsuario(null);
  }, []);

  useEffect(() => configurarNoAutorizado(salir), [salir]);

  const entrar = useCallback(async (credenciales) => {
    const r = await authApi.login(credenciales);
    tokenStorage.guardar(r.token);
    try {
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(r.usuario));
    } catch {
      /* la sesión dura lo que la pestaña */
    }
    setUsuario(r.usuario);
  }, []);

  const puede = useCallback((roles) => Boolean(usuario && roles.includes(usuario.rol)), [usuario]);
  const valor = useMemo(() => ({ usuario, entrar, salir, puede }), [usuario, entrar, salir, puede]);
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
