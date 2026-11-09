import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Campo, ErrorForm } from '../components/Comunes';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { usuario, entrar } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to="/" replace />;

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      await entrar({ email, password });
    } catch (err) {
      setError({ mensaje: err.message });
      setEnviando(false);
    }
  };

  return (
    <div className="login">
      <section className="login-lado">
        <h1>Cuánto hay, cuándo reponer y de dónde vino.</h1>
        <p>Control de materiales, compras y aprobaciones para las obras y bodegas de Constructora Del Valle.</p>
      </section>
      <section className="login-form">
        <h2>Iniciar sesión</h2>
        <form onSubmit={enviar}>
          <ErrorForm error={error} />
          <Campo etiqueta="Correo" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Campo etiqueta="Contraseña" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" disabled={enviando}>{enviando ? 'Entrando' : 'Entrar'}</button>
        </form>
        <p className="login-ayuda">Los usuarios de demostración están en el README del proyecto.</p>
      </section>
    </div>
  );
}
