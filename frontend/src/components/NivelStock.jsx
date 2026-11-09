import { numero } from '../utils/formato';

/** Barra de nivel: la marca roja es el punto de reorden; bajo ella la barra cambia a franjas de seguridad. */
export default function NivelStock({ stock, puntoReorden, unidad }) {
  if (puntoReorden === null || puntoReorden === undefined) return <span className="codigo">{numero(stock)} {unidad}</span>;
  const escala = Math.max(stock, puntoReorden) * 1.25 || 1;
  const bajo = stock <= puntoReorden;
  return (
    <div className={`nivel ${bajo ? 'bajo' : ''}`} role="img" aria-label={`Stock ${numero(stock)} ${unidad}, punto de reorden ${numero(puntoReorden)}`}>
      <div className="nivel-pista">
        <div className="nivel-relleno" style={{ width: `${(stock / escala) * 100}%` }} />
        <div className="nivel-marca" style={{ left: `${(puntoReorden / escala) * 100}%` }} />
      </div>
      <div className="nivel-texto">
        <span>{numero(stock)} {unidad}</span>
        <span>Reorden en {numero(puntoReorden)}</span>
      </div>
    </div>
  );
}
