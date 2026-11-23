import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { nombreRol } from '../utils/roles';

const SECCIONES = [
    { seccion: 'wishlist', texto: 'Mi wishlist', icono: '♥' },
    { seccion: 'pedidos', texto: 'Mis pedidos', icono: '🧾' },
    { seccion: 'eventos', texto: 'Mis eventos', icono: '🏆' },
    { seccion: 'ajustes', texto: 'Ajustes de cuenta', icono: '⚙' },
];
// Enlaces de la tienda según el rol de la cuenta
const STAFF = [
    { to: '/gestion/pedidos', texto: 'Pedidos de clientes', icono: '📬', roles: ['staff', 'encargado', 'admin'] },
    { to: '/inventario', texto: 'Inventario', icono: '📦', roles: ['staff', 'encargado', 'admin'] },
    { to: '/punto-de-venta', texto: 'Punto de venta', icono: '🛒', roles: ['staff', 'encargado', 'admin'] },
    { to: '/gestion/eventos', texto: 'Gestionar eventos', icono: '🗓', roles: ['staff', 'encargado', 'admin'] },
    { to: '/reportes', texto: 'Ventas por empleado', icono: '📊', roles: ['encargado', 'admin'] },
    { to: '/usuarios', texto: 'Usuarios', icono: '👥', roles: ['admin'] },
];

const iniciales = (nombre = '') =>
    nombre.trim().split(/\s+/).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('') || '?';

// Botón "Mi cuenta" con menú desplegable
export default function MenuCuenta({ onNavegar }) {
    const { user, esStaff, logout } = useAuth();
    const [abierto, setAbierto] = useState(false);
    const contenedor = useRef(null);
    const location = useLocation();

    // Cerrar al hacer clic fuera o con Esc
    useEffect(() => {
        if (!abierto) return;
        const alClic = (e) => { if (!contenedor.current?.contains(e.target)) setAbierto(false); };
        const alTeclear = (e) => { if (e.key === 'Escape') setAbierto(false); };
        document.addEventListener('mousedown', alClic);
        document.addEventListener('keydown', alTeclear);
        return () => {
            document.removeEventListener('mousedown', alClic);
            document.removeEventListener('keydown', alTeclear);
        };
    }, [abierto]);

    const elegir = () => {
        setAbierto(false);
        onNavegar?.();
    };

    const salir = () => {
        elegir();
        logout(); // las rutas privadas mandan al inicio al cerrar sesión
    };

    const seccionActual = location.pathname === '/mi-cuenta' ? (new URLSearchParams(location.search).get('seccion') || 'wishlist') : null;

    return (
        <div className="menu-cuenta" ref={contenedor}>
            <button
                type="button"
                className="btn btn--rojo btn--chico menu-cuenta__boton"
                aria-haspopup="menu"
                aria-expanded={abierto}
                onClick={() => setAbierto((a) => !a)}
            >
                <span className="menu-cuenta__avatar" aria-hidden="true">{iniciales(user.nombre)}</span>
                <span className="menu-cuenta__texto">Mi cuenta</span>
                <span className={`menu-cuenta__flecha ${abierto ? 'girada' : ''}`} aria-hidden="true">▾</span>
            </button>

            {abierto && (
                <div className="menu-cuenta__panel" role="menu">
                    <div className="menu-cuenta__perfil">
                        <span className="menu-cuenta__avatar menu-cuenta__avatar--grande" aria-hidden="true">{iniciales(user.nombre)}</span>
                        <div className="menu-cuenta__datos">
                            <strong title={user.nombre}>{user.nombre}</strong>
                            <span title={user.email}>{user.email}</span>
                            <span className={`menu-cuenta__rol rol--${user.rol}`}>{nombreRol(user.rol)}</span>
                        </div>
                    </div>

                    <div className="menu-cuenta__grupo">
                        {SECCIONES.map((s) => (
                            <Link
                                key={s.seccion}
                                role="menuitem"
                                to={`/mi-cuenta?seccion=${s.seccion}`}
                                className={`menu-cuenta__item ${seccionActual === s.seccion ? 'activo' : ''}`}
                                onClick={elegir}
                            >
                                <span className="menu-cuenta__icono" aria-hidden="true">{s.icono}</span>{s.texto}
                            </Link>
                        ))}
                    </div>

                    {esStaff && (
                        <div className="menu-cuenta__grupo">
                            <span className="menu-cuenta__titulo">Tienda</span>
                            {STAFF.filter((s) => s.roles.includes(user.rol)).map((s) => (
                                <Link key={s.to} role="menuitem" to={s.to} className={`menu-cuenta__item ${location.pathname === s.to ? 'activo' : ''}`} onClick={elegir}>
                                    <span className="menu-cuenta__icono" aria-hidden="true">{s.icono}</span>{s.texto}
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="menu-cuenta__grupo">
                        <button type="button" role="menuitem" className="menu-cuenta__item menu-cuenta__salir" onClick={salir}>
                            <span className="menu-cuenta__icono" aria-hidden="true">↩</span>Cerrar sesión
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
