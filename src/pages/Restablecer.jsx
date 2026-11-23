import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { restablecer } from '../services/authService';
import { useAuth } from '../context/AuthContext';

// Llega desde el enlace del correo: /restablecer?token=…
export default function Restablecer() {
    const [params] = useSearchParams();
    const token = params.get('token');
    const navigate = useNavigate();
    const { setUser, abrirAcceso } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmar, setConfirmar] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const enviar = async (e) => {
        e.preventDefault();
        if (password !== confirmar) return setError('Las contraseñas no coinciden');
        setCargando(true); setError('');
        try {
            const r = await restablecer(token, password);
            if (r.token) {
                // Queda con la sesión iniciada
                localStorage.setItem('token', r.token);
                localStorage.setItem('usuario', JSON.stringify(r.usuario));
                setUser(r.usuario);
                navigate('/mi-cuenta', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } catch (err) { setError(err.message); setCargando(false); }
    };

    if (!token) {
        return (
            <div className="contenedor pagina pagina--angosta">
                <div className="tarjeta pila">
                    <h1 className="titulo-seccion">Enlace incompleto</h1>
                    <p className="texto-suave">Abre el enlace completo que te llegó por correo, o pide uno nuevo.</p>
                    <button type="button" className="btn btn--rojo" onClick={() => abrirAcceso?.('olvide')}>Pedir un enlace nuevo</button>
                    <Link to="/" className="btn btn--contorno">Ir al inicio</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="contenedor pagina pagina--angosta">
            <form className="tarjeta pila" onSubmit={enviar}>
                <h1 className="titulo-seccion">Crea una contraseña nueva</h1>
                <label className="etiqueta">Contraseña nueva (mínimo 8 caracteres)
                    <input className="campo" type="password" minLength={8} required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>
                <label className="etiqueta">Repite la contraseña
                    <input className="campo" type="password" minLength={8} required autoComplete="new-password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
                </label>
                {error && <p className="alerta alerta--error">{error}</p>}
                <button type="submit" className="btn btn--rojo btn--grande" disabled={cargando}>{cargando ? 'Guardando…' : 'Guardar y entrar'}</button>
            </form>
        </div>
    );
}
