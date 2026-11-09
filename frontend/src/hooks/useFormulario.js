import { useState } from 'react';
import { useAvisos } from '../components/Avisos';

/** Estado de un formulario modal: valores, envío y errores de la API. */
export function useFormulario(inicial, enviar, { mensaje, alTerminar } = {}) {
  const [valores, setValores] = useState(inicial);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const { avisar } = useAvisos();

  const cambiar = (campo) => (e) => setValores((v) => ({ ...v, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const alEnviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const r = await enviar(valores);
      if (mensaje) avisar(typeof mensaje === 'function' ? mensaje(r) : mensaje);
      alTerminar?.(r);
    } catch (err) {
      setError({ mensaje: err.message, detalles: err.detalles });
    } finally {
      setEnviando(false);
    }
  };

  return { valores, setValores, cambiar, alEnviar, error, enviando };
}
