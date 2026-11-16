import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const enviar = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError('');
        try {
            await login(form.email, form.password);
            navigate(location.state?.desde || '/mi-cuenta', { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="contenedor pagina pagina--angosta">
            <form className="tarjeta pila" onSubmit={enviar}>
                <h1 className="titulo-seccion">Entrar</h1>
                <label className="etiqueta">Correo electrónico<input className="campo" type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
                <label className="etiqueta">Contraseña<input className="campo" type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
                {error && <p className="alerta alerta--error">{error}</p>}
                <button type="submit" className="btn btn--rojo btn--grande" disabled={cargando}>{cargando ? 'Entrando…' : 'Entrar'}</button>
                <p className="texto-suave texto-chico">¿No tienes cuenta? <Link to="/registro">Crea una</Link></p>
            </form>
        </div>
    );
}
