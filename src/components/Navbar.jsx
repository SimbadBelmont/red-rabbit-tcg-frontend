import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePedido } from '../context/PedidoContext';
import { IconoCarrito, IconoMenu, IconoUsuario } from './Iconos';
import logoMarca from '../assets/logo-marca.png';
import logoTexto from '../assets/logo-texto.png';

const PUBLICAS = [
    { to: '/', label: 'Inicio', end: true },
    { to: '/catalogo', label: 'Catálogo' },
    { to: '/eventos', label: 'Eventos' },
    { to: '/como-pedir', label: 'Cómo pedir' },
    { to: '/contacto', label: 'Contacto' },
];
// Solo aparecen con una cuenta de la tienda
const STAFF = [
    { to: '/inventario', label: 'Inventario' },
    { to: '/punto-de-venta', label: 'Punto de Venta' },
];

export default function Navbar() {
    const { user, esStaff } = useAuth();
    const { cantidad } = usePedido();
    const [abierto, setAbierto] = useState(false);
    const enlaces = esStaff ? [...PUBLICAS, ...STAFF] : PUBLICAS;

    return (
        <header className="navbar">
            <div className="contenedor navbar__fila">
                <Link to="/" className="marca" aria-label="Red Rabbit TCG Store, inicio" onClick={() => setAbierto(false)}>
                    <img src={logoMarca} alt="" className="marca__simbolo" />
                    <img src={logoTexto} alt="Red Rabbit TCG Store" className="marca__texto" />
                </Link>

                <button type="button" className="navbar__menu" aria-label="Abrir menú" aria-expanded={abierto} onClick={() => setAbierto(!abierto)}>
                    <IconoMenu />
                </button>

                <nav aria-label="Principal" className={`navbar__enlaces ${abierto ? 'abierto' : ''}`}>
                    {enlaces.map((e) => (
                        <NavLink key={e.to} to={e.to} end={e.end} className="navbar__enlace" onClick={() => setAbierto(false)}>{e.label}</NavLink>
                    ))}
                </nav>

                <div className="navbar__acciones">
                    <Link to="/como-pedir" className="navbar__carrito" aria-label={`Mi pedido (${cantidad})`}>
                        <IconoCarrito />
                        {cantidad > 0 && <span className="navbar__burbuja">{cantidad}</span>}
                    </Link>
                    <Link to={user ? '/mi-cuenta' : '/login'} className="btn btn--rojo btn--chico">
                        <IconoUsuario /> {user ? 'Mi cuenta' : 'Entrar'}
                    </Link>
                </div>
            </div>
        </header>
    );
}
