import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconoFlecha } from './Iconos';

const Destellos = ({ puntos }) => (
    <g fill="#F3B4B6">
        {puntos.map(([x, y, s], i) => (
            <path key={i} d={`M${x} ${y - 2 * s}l${s} ${s * 1.6} ${s * 1.6} ${s}-${s * 1.6} ${s}-${s} ${s * 1.6}-${s}-${s * 1.6}-${s * 1.6}-${s} ${s * 1.6}-${s}z`} />
        ))}
    </g>
);

const CartaBlanca = ({ rot }) => (
    <g transform={`rotate(${rot} 210 300)`}>
        <rect x="150" y="70" width="120" height="168" rx="12" fill="#fff" />
        <rect x="162" y="82" width="96" height="70" rx="6" fill="#F6DADA" />
        <rect x="162" y="164" width="96" height="8" rx="4" fill="#EBDDDD" />
        <rect x="162" y="180" width="70" height="8" rx="4" fill="#EBDDDD" />
    </g>
);

// Ilustraciones de presentación. Se pueden reemplazar por fotos de la tienda (prop "imagen" en cada slide).
const ILUSTRACIONES = [
    <svg key="0" viewBox="0 0 420 360" role="img" aria-label="Abanico de cartas con el conejo de Red Rabbit">
        <circle cx="210" cy="190" r="150" fill="#2C1F1F" /><circle cx="210" cy="190" r="110" fill="#3A2626" />
        <CartaBlanca rot={-18} /><CartaBlanca rot={16} />
        <rect x="146" y="56" width="128" height="180" rx="12" fill="#D7262D" />
        <rect x="156" y="66" width="108" height="160" rx="8" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" />
        <g fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round"><path d="M196 92c-6 12-6 30 0 42" /><path d="M224 92c6 12 6 30 0 42" /></g>
        <circle cx="210" cy="165" r="30" fill="#fff" /><circle cx="200" cy="160" r="4" fill="#1F1414" /><circle cx="220" cy="160" r="4" fill="#1F1414" />
        <path d="M205 174q5 5 10 0" fill="none" stroke="#D7262D" strokeWidth="3" strokeLinecap="round" />
        <text x="210" y="216" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="800" fontSize="14" fill="#fff">RED RABBIT</text>
        <Destellos puntos={[[70, 100, 6], [350, 75, 5], [360, 275, 4]]} />
    </svg>,
    <svg key="1" viewBox="0 0 420 360" role="img" aria-label="Mesa de torneo con trofeo y cartas">
        <circle cx="210" cy="190" r="150" fill="#2C1F1F" /><ellipse cx="210" cy="270" rx="170" ry="40" fill="#3A2626" />
        <g transform="rotate(-10 120 250)"><rect x="80" y="196" width="70" height="98" rx="8" fill="#fff" /><rect x="88" y="204" width="54" height="40" rx="4" fill="#F6DADA" /></g>
        <g transform="rotate(12 300 250)"><rect x="270" y="196" width="70" height="98" rx="8" fill="#fff" /><rect x="278" y="204" width="54" height="40" rx="4" fill="#F6DADA" /></g>
        <path d="M170 80h80v40a40 40 0 0 1-80 0z" fill="#D7262D" />
        <path d="M170 92h-22a22 22 0 0 0 26 28M250 92h22a22 22 0 0 1-26 28" fill="none" stroke="#D7262D" strokeWidth="8" strokeLinecap="round" />
        <rect x="202" y="158" width="16" height="34" fill="#B01A20" /><rect x="178" y="190" width="64" height="18" rx="4" fill="#D7262D" />
        <text x="210" y="118" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="800" fontSize="22" fill="#fff">1º</text>
        <Destellos puntos={[[80, 100, 6], [345, 110, 5]]} />
    </svg>,
    <svg key="2" viewBox="0 0 420 360" role="img" aria-label="Sobre de correo con una carta saliendo">
        <circle cx="210" cy="190" r="150" fill="#2C1F1F" />
        <rect x="160" y="70" width="100" height="140" rx="10" fill="#fff" /><rect x="170" y="80" width="80" height="60" rx="6" fill="#F6DADA" />
        <rect x="110" y="150" width="200" height="130" rx="14" fill="#D7262D" />
        <path d="M110 160l100 70 100-70" fill="none" stroke="#fff" strokeWidth="6" strokeLinejoin="round" />
        <circle cx="300" cy="150" r="26" fill="#fff" />
        <path d="M288 150l9 9 16-18" fill="none" stroke="#D7262D" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <Destellos puntos={[[80, 120, 6], [350, 260, 5]]} />
    </svg>,
];

const SLIDES = [
    { etiqueta: 'Tienda de cartas en Cuernavaca', titulo: 'Cartas, torneos y comunidad en un solo lugar.', texto: 'Consulta el inventario en tiempo real, aparta tus cartas por correo y reserva tu lugar en los torneos.', cta1: ['Ver catálogo', '/catalogo'], cta2: ['Próximos eventos', '/eventos'] },
    { etiqueta: 'Torneos cada semana', titulo: 'Juega Friday Night Magic con nosotros.', texto: 'Torneos, prereleases y ligas de Magic, Pokémon y One Piece. Reserva tu lugar desde la página.', cta1: ['Ver eventos', '/eventos'], cta2: ['Crear mi cuenta', '/registro'] },
    { etiqueta: 'Pedidos por correo', titulo: 'Aparta tus cartas sin salir de casa.', texto: 'Elige del catálogo, envía tu pedido y te confirmamos por correo. Pagas al recoger en tienda.', cta1: ['Cómo pedir', '/como-pedir'], cta2: ['Ver catálogo', '/catalogo'] },
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
