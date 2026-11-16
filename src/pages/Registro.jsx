import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Registro() {
    const { registrar } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ nombre: '', email: '', telefono: '', password: '' });
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const enviar = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError('');
        try {
            await registrar(form);
            navigate('/mi-cuenta', { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };
    const campo = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

    return (
        <div className="contenedor pagina pagina--angosta">
            <form className="tarjeta pila" onSubmit={enviar}>
                <h1 className="titulo-seccion">Crear cuenta</h1>
                <p className="texto-suave">Con tu cuenta reservas lugares en eventos, guardas tu wishlist y ves tus pedidos.</p>
                <label className="etiqueta">Nombre<input className="campo" required autoComplete="name" {...campo('nombre')} /></label>
                <label className="etiqueta">Correo electrónico<input className="campo" type="email" required autoComplete="email" {...campo('email')} /></label>
                <label className="etiqueta">Teléfono (opcional)<input className="campo" type="tel" autoComplete="tel" {...campo('telefono')} /></label>
                <label className="etiqueta">Contraseña (mínimo 8 caracteres)<input className="campo" type="password" minLength={8} required autoComplete="new-password" {...campo('password')} /></label>
                {error && <p className="alerta alerta--error">{error}</p>}
                <button type="submit" className="btn btn--rojo btn--grande" disabled={cargando}>{cargando ? 'Creando…' : 'Crear cuenta'}</button>
                <p className="texto-suave texto-chico">¿Ya tienes cuenta? <Link to="/login">Entra</Link></p>
            </form>
        </div>
    );
}
