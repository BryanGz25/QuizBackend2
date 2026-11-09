import { useCallback, useEffect, useRef, useState } from 'react';

/** Carga datos de la API y expone recargar(). `cargar` debe devolver una promesa. */
export function useDatos(cargar, dependencias = []) {
  const [estado, setEstado] = useState({ datos: null, cargando: true, error: null });
  const vigente = useRef(0);

  const recargar = useCallback(async () => {
    const turno = ++vigente.current;
    try {
      const datos = await cargar();
      if (turno === vigente.current) setEstado({ datos, cargando: false, error: null });
    } catch (error) {
      if (turno === vigente.current) setEstado({ datos: null, cargando: false, error: error.message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencias);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { ...estado, recargar };
}
