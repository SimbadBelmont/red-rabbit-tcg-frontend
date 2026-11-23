import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconoFlecha } from './Iconos';
import logoBlanco from '../assets/logo-completo-blanco.png';

// Ilustraciones de presentación en trazo de línea, como el logo.
// Se pueden cambiar por fotos de la tienda.
const ROJO = '#DF0E10';
const ILUSTRACIONES = [
    <div key="0" className="hero__logo"><img src={logoBlanco} alt="Logo de Red Rabbit TCG Store" /></div>,
    <svg key="1" viewBox="0 0 420 380" role="img" aria-label="Trofeo entre dos cartas en una mesa de torneo">
        <g fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M40 320 Q210 290 380 320" />
            <g transform="rotate(-12 110 240)"><rect x="70" y="170" width="84" height="118" rx="10" /><rect x="78" y="162" width="84" height="118" rx="10" stroke={ROJO} /></g>
            <g transform="rotate(12 310 240)"><rect x="266" y="170" width="84" height="118" rx="10" /><rect x="258" y="162" width="84" height="118" rx="10" stroke={ROJO} /></g>
            <path d="M168 70h84v46a42 42 0 0 1-84 0z" stroke={ROJO} strokeWidth="5" />
            <path d="M168 84h-20a20 20 0 0 0 24 26M252 84h20a20 20 0 0 1-24 26" stroke={ROJO} strokeWidth="5" />
            <path d="M210 158v40M184 214h52M190 198h40" />
        </g>
        <text x="210" y="122" textAnchor="middle" fontFamily="Lilita One, sans-serif" fontSize="26" fill="#fff">1º</text>
    </svg>,
    <svg key="2" viewBox="0 0 420 380" role="img" aria-label="Carta saliendo de un sobre de correo">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <rect x="150" y="50" width="112" height="156" rx="12" stroke="#fff" strokeWidth="4" />
            <rect x="160" y="44" width="112" height="156" rx="12" stroke={ROJO} strokeWidth="4" />
            <path d="M196 78c-6 12-6 30 0 44M226 78c6 12 6 30 0 44" stroke={ROJO} strokeWidth="4" />
            <rect x="96" y="160" width="228" height="150" rx="16" stroke="#fff" strokeWidth="5" />
            <path d="M96 172l114 78 114-78" stroke="#fff" strokeWidth="5" />
            <circle cx="318" cy="160" r="28" stroke={ROJO} strokeWidth="5" />
            <path d="M305 160l9 9 17-19" stroke={ROJO} strokeWidth="5" />
        </g>
    </svg>,
];

const SLIDES = [
    { etiqueta: 'Tienda de cartas en Cuernavaca', titulo: 'Cartas, torneos y comunidad en un solo lugar.', texto: 'Consulta el inventario en tiempo real, aparta tus cartas por correo y reserva tu lugar en los torneos.', cta1: ['Ver catálogo', '/catalogo'], cta2: ['Próximos eventos', '/eventos'] },
    { etiqueta: 'Torneos cada semana', titulo: 'Juega Friday Night Magic con nosotros.', texto: 'Torneos, prereleases y ligas de Magic, Pokémon y One Piece. Reserva tu lugar desde la página.', cta1: ['Ver eventos', '/eventos'], cta2: ['Crear mi cuenta', '/registro'] },
    { etiqueta: 'Pedidos por correo', titulo: 'Aparta tus cartas sin salir de casa.', texto: 'Elige del catálogo, envía tu pedido y te confirmamos por correo. Pagas al recoger en tienda.', cta1: ['Ir a mi pedido', '/pedido'], cta2: ['Ver catálogo', '/catalogo'] },
];
const ETIQUETAS = ['Bienvenida', 'Torneos', 'Pedidos'];

export default function HeroCarrusel({ intervalo = 6000 }) {
    const [actual, setActual] = useState(0);
    const [pausado, setPausado] = useState(false);
    const s = SLIDES[actual];

    useEffect(() => {
        const reducir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if (pausado || reducir) return undefined;
        const t = setInterval(() => setActual((a) => (a + 1) % SLIDES.length), intervalo);
        return () => clearInterval(t);
    }, [pausado, intervalo]);

    const ir = (i) => setActual((i + SLIDES.length) % SLIDES.length);

    return (
        <section className="hero" aria-roledescription="carrusel" aria-label="Presentación"
            onMouseEnter={() => setPausado(true)} onMouseLeave={() => setPausado(false)}
            onFocus={() => setPausado(true)} onBlur={() => setPausado(false)}>
            <div className="contenedor hero__interior">
                <div className="hero__fila" key={actual}>
                    <div className="hero__texto aparecer" aria-live="polite">
                        <span className="pastilla pastilla--roja">{s.etiqueta}</span>
                        <h1 className="hero__titulo">{s.titulo}</h1>
                        <p className="hero__parrafo">{s.texto}</p>
                        <div className="fila-botones">
                            <Link to={s.cta1[1]} className="btn btn--rojo btn--grande">{s.cta1[0]}</Link>
                            <Link to={s.cta2[1]} className="btn btn--contorno-claro btn--grande">{s.cta2[0]}</Link>
                        </div>
                    </div>
                    <div className="hero__imagen aparecer">{ILUSTRACIONES[actual]}</div>
                </div>

                <div className="hero__controles">
                    <div role="tablist" aria-label="Elegir diapositiva" className="hero__puntos">
                        {ETIQUETAS.map((l, i) => (
                            <button key={l} type="button" role="tab" aria-selected={i === actual} aria-label={`Ir a: ${l}`}
                                className={`hero__punto ${i === actual ? 'activo' : ''}`} onClick={() => ir(i)}>
                                <span />
                            </button>
                        ))}
                    </div>
                    <div className="fila-botones">
                        <button type="button" className="btn-circulo btn-circulo--contorno" aria-label="Anterior" onClick={() => ir(actual - 1)}><IconoFlecha izquierda /></button>
                        <button type="button" className="btn-circulo" aria-label="Siguiente" onClick={() => ir(actual + 1)}><IconoFlecha /></button>
                    </div>
                </div>
            </div>
        </section>
    );
}
