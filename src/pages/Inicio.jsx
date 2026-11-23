import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroCarrusel from '../components/HeroCarrusel';
import CartaCard from '../components/CartaCard';
import { JUEGOS, recientes } from '../services/inventarioService';
import { proximos } from '../services/eventoService';
import { diaMes, hora } from '../utils/formato';
import { usePedido } from '../context/PedidoContext';

const ACCESOS = [
    { titulo: 'Catálogo', texto: 'Todo lo que hay en existencia, con filtros por juego, expansión y rareza.', cta: 'Ver catálogo', to: '/catalogo' },
    { titulo: 'Eventos', texto: 'Torneos, prereleases y ligas. Reserva tu lugar en línea.', cta: 'Ver eventos', to: '/eventos' },
    { titulo: 'Mi pedido', texto: 'Revisa tus cartas apartadas y envía tu pedido por correo.', cta: 'Ver mi pedido', to: '/pedido' },
    { titulo: 'Contacto', texto: 'Dirección, horario y formas de contactarnos.', cta: 'Contáctanos', to: '/contacto' },
];

export default function Inicio() {
    const [cartas, setCartas] = useState([]);
    const [evento, setEvento] = useState(null);
    const [juego, setJuego] = useState('todos');
    const { cantidad } = usePedido();

    useEffect(() => {
        recientes(12).then(setCartas).catch(() => setCartas([]));
        proximos().then((e) => setEvento(e[0] || null)).catch(() => setEvento(null));
    }, []);

    const visibles = cartas.filter((c) => juego === 'todos' || c.juego === juego).slice(0, 4);
    const juegosConCartas = JUEGOS.filter((j) => cartas.some((c) => c.juego === j.id));

    return (
        <>
            <HeroCarrusel />

            {evento && (
                <section className="contenedor seccion-arriba">
                    <div className="aviso-evento">
                        <div className="aviso-evento__info">
                            <div className="fecha-caja"><strong>{diaMes(evento.fecha).dia}</strong><span>{diaMes(evento.fecha).mes}</span></div>
                            <div className="pila-chica">
                                <span className="sobretitulo sobretitulo--rojo">PRÓXIMO EVENTO</span>
                                <h2 className="titulo-tarjeta">{evento.titulo}</h2>
                                <span className="texto-suave texto-chico">{hora(evento.fecha)} h · {evento.disponibles} lugares disponibles</span>
                            </div>
                        </div>
                        <Link to="/eventos" className="btn btn--rojo">Reservar mi lugar</Link>
                    </div>
                </section>
            )}

            <section className="contenedor seccion">
                <h2 className="etiqueta-logo">EXPLORA LA TIENDA</h2>
                <div className="rejilla rejilla--260">
                    {ACCESOS.map((a) => (
                        <Link key={a.to} to={a.to} className="tarjeta tarjeta--enlace acceso">
                            <span className="titulo-tarjeta">{a.titulo}</span>
                            <span className="texto-suave">{a.texto}</span>
                            <span className="acceso__cta">{a.cta} →</span>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="banda">
                <div className="contenedor seccion pila">
                    <div className="encabezado-seccion">
                        <h2 className="titulo-seccion">Recién llegado</h2>
                        <Link to="/catalogo" className="btn btn--contorno">Ver todo el catálogo</Link>
                    </div>
                    {juegosConCartas.length > 1 && (
                        <div role="group" aria-label="Filtrar por juego" className="fila-botones">
                            {[{ id: 'todos', corto: 'Todos' }, ...juegosConCartas].map((j) => (
                                <button key={j.id} type="button" aria-pressed={juego === j.id}
                                    className={`chip ${juego === j.id ? 'activo' : ''}`} onClick={() => setJuego(j.id)}>{j.corto}</button>
                            ))}
                        </div>
                    )}
                    {visibles.length > 0
                        ? <div className="rejilla rejilla--220">{visibles.map((c) => <CartaCard key={c._id} carta={c} />)}</div>
                        : <p className="texto-suave">Pronto verás aquí lo más nuevo del inventario.</p>}
                    {cantidad > 0 && (
                        <div className="barra-pedido">
                            <span>Tienes {cantidad} {cantidad === 1 ? 'carta' : 'cartas'} en tu pedido</span>
                            <Link to="/pedido" className="btn btn--rojo btn--chico">Ir a mi pedido</Link>
                        </div>
                    )}
                </div>
            </section>

            <section className="contenedor seccion">
                <div className="cinta-rosa">
                    <div className="pila-chica">
                        <h2 className="titulo-seccion titulo-seccion--chico">Visítanos en Cuernavaca</h2>
                        <p>[DIRECCIÓN DE LA TIENDA] · [HORARIO]</p>
                    </div>
                    <Link to="/contacto" className="btn btn--rojo">Cómo llegar</Link>
                </div>
            </section>
        </>
    );
}
