import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { olvide } from '../services/authService';
import logoMarca from '../assets/logo-marca.png';

// Ventana emergente para entrar o crear cuenta, disponible desde cualquier página
export default function ModalAcceso() {
    const { acceso, cerrarAcceso } = useAuth();
    if (!acceso.abierto) return null;
    // key: reinicia los formularios cada vez que se abre
    return <Ventana key={`${acceso.modo}-${acceso.desde}`} modoInicial={acceso.modo} desde={acceso.desde} onCerrar={cerrarAcceso} />;
}

function Ventana({ modoInicial, desde, onCerrar }) {
    const [modo, setModo] = useState(modoInicial);
    const navigate = useNavigate();
    const panel = useRef(null);

    // Cerrar con Esc, bloquear el scroll del fondo y enfocar el primer campo
    useEffect(() => {
        const alTeclear = (e) => { if (e.key === 'Escape') onCerrar(); };
        document.addEventListener('keydown', alTeclear);
        const overflowPrevio = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', alTeclear);
            document.body.style.overflow = overflowPrevio;
        };
    }, [onCerrar]);

    useEffect(() => {
        panel.current?.querySelector('input')?.focus();
    }, [modo]);

    const alEntrar = () => {
        onCerrar();
        if (desde) navigate(desde, { replace: true });
    };

    return (
        <div className="modal" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
            <div className="modal__panel" role="dialog" aria-modal="true" aria-labelledby="modal-acceso-titulo" ref={panel}>
                <button type="button" className="modal__cerrar" aria-label="Cerrar" onClick={onCerrar}>×</button>
                <div className="modal__marca">
                    <img src={logoMarca} alt="" />
                    <h2 id="modal-acceso-titulo">{modo === 'login' ? '¡Qué bueno verte!' : modo === 'olvide' ? 'Recupera tu cuenta' : 'Únete a Red Rabbit'}</h2>
                </div>

                <div className="modal__pestanas" role="tablist">
                    <button type="button" role="tab" aria-selected={modo === 'login'} className={modo === 'login' ? 'activa' : ''} onClick={() => setModo('login')}>Entrar</button>
                    <button type="button" role="tab" aria-selected={modo === 'registro'} className={modo === 'registro' ? 'activa' : ''} onClick={() => setModo('registro')}>Crear cuenta</button>
                </div>

                {modo === 'login' && <FormEntrar onListo={alEntrar} onCambiar={() => setModo('registro')} onOlvide={() => setModo('olvide')} />}
                {modo === 'registro' && <FormRegistro onListo={alEntrar} onCambiar={() => setModo('login')} />}
                {modo === 'olvide' && <FormOlvide onVolver={() => setModo('login')} />}
            </div>
        </div>
    );
}

function FormEntrar({ onListo, onCambiar, onOlvide }) {
    const { login } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const enviar = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError('');
        try {
            await login(form.email, form.password);
            onListo();
        } catch (err) {
            setError(err.message);
            setCargando(false);
        }
    };

    return (
        <form className="pila" onSubmit={enviar}>
            <label className="etiqueta">Correo electrónico<input className="campo" type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label className="etiqueta">Contraseña<input className="campo" type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
            <button type="button" className="enlace-boton enlace-boton--derecha" onClick={onOlvide}>¿Olvidaste tu contraseña?</button>
            {error && <p className="alerta alerta--error">{error}</p>}
            <button type="submit" className="btn btn--rojo btn--grande" disabled={cargando}>{cargando ? 'Entrando…' : 'Entrar'}</button>
            <p className="texto-suave texto-chico centrado">¿No tienes cuenta? <button type="button" className="enlace-boton" onClick={onCambiar}>Crea una</button></p>
        </form>
    );
}

function FormRegistro({ onListo, onCambiar }) {
    const { registrar } = useAuth();
    const [form, setForm] = useState({ nombre: '', email: '', telefono: '', password: '' });
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const enviar = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError('');
        try {
            await registrar(form);
            onListo();
        } catch (err) {
            setError(err.message);
            setCargando(false);
        }
    };
    const campo = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

    return (
        <form className="pila" onSubmit={enviar}>
            <p className="texto-suave texto-chico">Con tu cuenta reservas lugares en eventos, guardas tu wishlist y ves tus pedidos.</p>
            <label className="etiqueta">Nombre<input className="campo" required autoComplete="name" {...campo('nombre')} /></label>
            <label className="etiqueta">Correo electrónico<input className="campo" type="email" required autoComplete="email" {...campo('email')} /></label>
            <label className="etiqueta">Teléfono (opcional)<input className="campo" type="tel" autoComplete="tel" {...campo('telefono')} /></label>
            <label className="etiqueta">Contraseña (mínimo 8 caracteres)<input className="campo" type="password" minLength={8} required autoComplete="new-password" {...campo('password')} /></label>
            {error && <p className="alerta alerta--error">{error}</p>}
            <button type="submit" className="btn btn--rojo btn--grande" disabled={cargando}>{cargando ? 'Creando…' : 'Crear cuenta'}</button>
            <p className="texto-suave texto-chico centrado">¿Ya tienes cuenta? <button type="button" className="enlace-boton" onClick={onCambiar}>Entra</button></p>
        </form>
    );
}

// Pide el enlace para crear una contraseña nueva (llega por correo y vence en 1 hora)
function FormOlvide({ onVolver }) {
    const [email, setEmail] = useState('');
    const [enviado, setEnviado] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const enviar = async (e) => {
        e.preventDefault();
        setCargando(true); setError('');
        try {
            const r = await olvide(email);
            setEnviado(r.mensaje);
        } catch (err) { setError(err.message); } finally { setCargando(false); }
    };

    return enviado ? (
        <div className="pila">
            <p className="alerta alerta--ok" role="status">{enviado} Revisa también tu carpeta de spam.</p>
            <button type="button" className="btn btn--contorno" onClick={onVolver}>Volver a entrar</button>
        </div>
    ) : (
        <form className="pila" onSubmit={enviar}>
            <p className="texto-suave">Escribe el correo de tu cuenta y te mandaremos un enlace para crear una contraseña nueva.</p>
            <label className="etiqueta">Correo electrónico<input className="campo" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
            {error && <p className="alerta alerta--error">{error}</p>}
            <button type="submit" className="btn btn--rojo btn--grande" disabled={cargando}>{cargando ? 'Enviando…' : 'Enviar enlace'}</button>
            <p className="texto-suave texto-chico centrado"><button type="button" className="enlace-boton" onClick={onVolver}>Volver a entrar</button></p>
        </form>
    );
}
