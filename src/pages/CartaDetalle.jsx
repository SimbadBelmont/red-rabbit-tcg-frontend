import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { usePedido } from '../context/PedidoContext';
import { PRODUCTOS, nombreCondicion, nombreJuego, urlCompartir, verCarta } from '../services/inventarioService';
import { nombreAcabado } from '../utils/acabados';
import { mxn } from '../utils/formato';
import { IconoCartaVacia, IconoCheck } from '../components/Iconos';

// Página propia de una carta o producto: /carta/:id. El botón Compartir usa el enlace con vista previa.
export default function CartaDetalle() {
    const { id } = useParams();
    const { agregar, quitar, estaEnPedido } = usePedido();
    const [carta, setCarta] = useState(null);
    const [error, setError] = useState('');
    const [elegidaId, setElegidaId] = useState(id);
    const [copiado, setCopiado] = useState(false);

    useEffect(() => {
        let vigente = true;
        verCarta(id).then((c) => { if (vigente) { setCarta(c); setError(''); document.title = `${c.nombre} · Red Rabbit TCG Store`; } })
            .catch((e) => vigente && setError(e.message));
        return () => { vigente = false; document.title = 'Red Rabbit TCG Store · Cuernavaca'; };
    }, [id]);

    if (error) return <div className="contenedor pagina"><p className="alerta alerta--error">Esta carta ya no está disponible.</p><Link to="/catalogo" className="btn btn--rojo">Ver catálogo</Link></div>;
    if (!carta) return <div className="contenedor pagina"><p className="texto-suave">Cargando…</p></div>;

    const sellado = carta.tipo === 'sellado';
    const v = carta.variantes.find((x) => x._id === elegidaId) || carta.variantes[0];
    const dentro = v && estaEnPedido(v._id);
    const enlace = urlCompartir(carta._id);
    const textoCompartir = `${carta.nombre} — ${mxn(carta.precioDesde)} en Red Rabbit TCG Store`;

    const compartir = async () => {
        if (navigator.share) {
            try { await navigator.share({ title: carta.nombre, text: textoCompartir, url: enlace }); } catch { /* el usuario canceló */ }
            return;
        }
        try { await navigator.clipboard.writeText(enlace); setCopiado(true); setTimeout(() => setCopiado(false), 2500); } catch { window.prompt('Copia el enlace:', enlace); }
    };

    return (
        <div className="contenedor pagina">
            <nav aria-label="Ruta" className="texto-chico texto-suave"><Link to="/catalogo">Catálogo</Link> › {carta.nombre}</nav>
            <div className="detalle">
                <div className={`detalle__imagen ${sellado ? 'detalle__imagen--sellado' : ''}`}>
                    {carta.imagen ? <img src={carta.imagen} alt={carta.nombre} /> : <IconoCartaVacia />}
                </div>
                <div className="pila">
                    <div className="pila-chica">
                        <span className="sobretitulo sobretitulo--rojo">{sellado ? `${PRODUCTOS[carta.producto] || 'Producto sellado'} · ` : ''}{nombreJuego(carta.juego)}</span>
                        <h1 className="titulo-pagina">{carta.nombre}</h1>
                        <span className="texto-suave">
                            {[carta.expansion && `${carta.expansion}${carta.numero ? ` #${carta.numero}` : ''}`, carta.rareza, !sellado && carta.acabado !== 'normal' && nombreAcabado(carta.acabado), carta.idioma && carta.idioma.toUpperCase()].filter(Boolean).join(' · ')}
                        </span>
                        {carta.artista && <span className="carta__credito">Ilustración de {carta.artista} · imagen vía Scryfall</span>}
                    </div>

                    {v ? (
                        <div className="tarjeta pila">
                            <span className="sobretitulo">{sellado ? 'ESTADO' : 'CONDICIÓN'}</span>
                            <div role="radiogroup" aria-label={sellado ? 'Estado' : 'Condición'} className="condiciones condiciones--grandes">
                                {carta.variantes.map((x) => (
                                    <button key={x._id} type="button" role="radio" aria-checked={x._id === v._id}
                                        className={`condiciones__opcion ${x._id === v._id ? 'activo' : ''}`} onClick={() => setElegidaId(x._id)}>
                                        <span>{nombreCondicion(x.condicion)}</span><strong>{mxn(x.precio)}</strong>
                                    </button>
                                ))}
                            </div>
                            <div className="carta__precio-fila">
                                <span className="detalle__precio">{mxn(v.precio)}</span>
                                <span className={`pastilla ${v.stock <= 2 ? 'pastilla--aviso' : 'pastilla--roja'}`}>{v.stock === 0 ? 'Agotada' : v.stock <= 2 ? `Últimas ${v.stock}` : `${v.stock} disponibles`}</span>
                            </div>
                            {dentro
                                ? <button type="button" className="btn btn--rojo btn--grande" aria-pressed="true" onClick={() => quitar(v._id)}><IconoCheck /> En tu pedido · Quitar</button>
                                : <button type="button" className="btn btn--rojo btn--grande" disabled={v.stock === 0}
                                    onClick={() => agregar({ _id: v._id, nombre: carta.nombre, juego: carta.juego, imagen: carta.imagen, precio: v.precio, stock: v.stock, condicion: v.condicion, acabado: carta.acabado, expansion: carta.expansion, tipo: carta.tipo })}>
                                    Agregar al pedido
                                </button>}
                            {dentro && <Link to="/pedido" className="btn btn--contorno">Ir a mi pedido</Link>}
                        </div>
                    ) : <p className="alerta alerta--info">Por ahora no hay existencias.</p>}

                    <div className="fila-botones">
                        <button type="button" className="btn btn--contorno" onClick={compartir}>{copiado ? 'Enlace copiado ✓' : 'Compartir'}</button>
                        <a className="btn btn--contorno" href={`https://wa.me/?text=${encodeURIComponent(`${textoCompartir} ${enlace}`)}`} target="_blank" rel="noreferrer">Enviar por WhatsApp</a>
                    </div>
                    <p className="texto-suave texto-chico">Apartas en línea y pagas al recoger en la tienda. <Link to="/pedido">¿Cómo funciona?</Link></p>
                </div>
            </div>
        </div>
    );
}
