import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const AvisosContext = createContext(null);

export function AvisosProvider({ children }) {
  const [lista, setLista] = useState([]);
  const avisar = useCallback((texto, tipo = 'ok') => {
    const id = crypto.randomUUID();
    setLista((l) => [...l, { id, texto, tipo }]);
    setTimeout(() => setLista((l) => l.filter((a) => a.id !== id)), 5000);
  }, []);
  const valor = useMemo(() => ({ avisar }), [avisar]);

  return (
    <AvisosContext.Provider value={valor}>
      {children}
      <div className="avisos" role="status" aria-live="polite">
        {lista.map((a) => (
          <div key={a.id} className={`aviso-toast ${a.tipo}`}>{a.texto}</div>
        ))}
      </div>
    </AvisosContext.Provider>
  );
}

export const useAvisos = () => useContext(AvisosContext);
