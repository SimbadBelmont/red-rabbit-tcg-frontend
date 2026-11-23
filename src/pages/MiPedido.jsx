import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePedido } from '../context/PedidoContext';
import { useAuth } from '../context/AuthContext';
import { crearPedido } from '../services/pedidoService';
import { nombreJuego } from '../services/inventarioService';
import { mxn } from '../utils/formato';
import { IconoCheck } from '../components/Iconos';

// Carrito + cómo pedir en una sola página. Los pasos quedan como guía corta arriba.
const PASOS = [
    { titulo: 'Elige del catálogo', texto: 'Solo ves lo que hay en existencia.' },
    { titulo: 'Envía tu pedido', texto: 'Te llega un correo y apartamos las cartas.' },
    { titulo: 'Recoge y paga en tienda', texto: 'Te avisamos cuando esté listo.' },
];

export default function MiPedido() {
    const { items, cambiarCantidad, quitar, vaciar, total } = usePedido();
    const { user } = useAuth();
    const [form, setForm] = useState({ nombre: user?.nombre || '', email: user?.email || '', telefono: user?.telefono || '', notas: '' });
    const [enviando, setEnviando] = useState(false);
    const [confirmarVaciar, setConfirmarVaciar] = useState(false);
    const [error, setError] = useState('');
    const [pedido, setPedido] = useState(null);

    const enviar = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setError('');
        try {
            const nuevo = await crearPedido({
                cliente: { nombre: form.nombre, email: form.email, telefono: form.telefono },
                notas: form.notas,
                items: items.map((i) => ({ carta: i._id, cantidad: i.cantidad })),
            });
            setPedido(nuevo);
            vaciar();
        } catch (err) {
            setError(err.message);
        } finally {
            setEnviando(false);
        }
    };

    const campo = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

    return (
        <div className="contenedor pagina">
            <div className="pila-chica">
                <h1 className="titulo-pagina">Mi pedido</h1>
                <p className="texto-suave texto-grande">Sin pagos en línea: apartas tus cartas aquí y confirmamos por correo. Pagas al recoger.</p>
            </div>
            <ol className="pasos-compactos" aria-label="Cómo funciona">
                {PASOS.map((p, i) => (
                    <li key={p.titulo} className="pasos-compactos__paso">
                        <span className="paso__numero paso__numero--chico">{i + 1}</span>
                        <span className="pila-chica"><strong>{p.titulo}</strong><span className="texto-suave texto-chico">{p.texto}</span></span>
                    </li>
                ))}
            </ol>

            <div className="con-lateral con-lateral--derecha">
                <section className="tarjeta contenido pila" aria-labelledby="pedido-t">
                    <div className="encabezado-seccion">
                        <h2 id="pedido-t" className="titulo-tarjeta">Cartas en tu pedido</h2>
                        {items.length > 0 && (
                            confirmarVaciar ? (
                                <span className="fila-botones">
                                    <span className="texto-chico">¿Quitar todas?</span>
                                    <button type="button" className="btn btn--rojo btn--chico" onClick={() => { vaciar(); setConfirmarVaciar(false); }}>Sí, vaciar</button>
                                    <button type="button" className="btn-texto" onClick={() => setConfirmarVaciar(false)}>No</button>
                                </span>
                            ) : (
                                <button type="button" className="btn-texto" onClick={() => setConfirmarVaciar(true)}>Vaciar pedido</button>
                            )
                        )}
                    </div>
                    {items.length === 0 && !pedido && (
                        <p className="texto-suave">Aún no agregas cartas. <Link to="/catalogo">Ve al catálogo</Link>.</p>
                    )}
                    {items.map((i) => (
                        <div key={i._id} className="linea-pedido">
                            <div className="linea-pedido__miniatura">{i.imagen && <img src={i.imagen} alt="" />}</div>
                            <div className="linea-pedido__info">
                                <strong>{i.nombre}</strong>
                                <span className="texto-suave texto-chico">{nombreJuego(i.juego)} · {mxn(i.precio)} c/u</span>
                            </div>
                            <label className="sr-only" htmlFor={`cant-${i._id}`}>Cantidad de {i.nombre}</label>
                            <input id={`cant-${i._id}`} type="number" min="0" max={i.stock} className="campo campo--cantidad"
                                value={i.cantidad} onChange={(e) => cambiarCantidad(i._id, Number(e.target.value))} />
                            <span className="linea-pedido__total">{mxn(i.precio * i.cantidad)}</span>
                            <button type="button" className="btn-texto" onClick={() => quitar(i._id)}>Quitar</button>
                        </div>
                    ))}
                    {items.length > 0 && (
                        <div className="total-fila"><span className="texto-suave">Total estimado</span><strong>{mxn(total)}</strong></div>
                    )}
                </section>

                <form className="tarjeta tarjeta--rosa lateral pila" onSubmit={enviar}>
                    {pedido ? (
                        <div className="pila" role="status">
                            <span className="circulo-ok"><IconoCheck size={24} /></span>
                            <h2 className="titulo-tarjeta">¡Pedido enviado!</h2>
                            <p>Tu folio es <strong>{pedido.folio}</strong>. Te mandamos un correo con el detalle y la tienda ya apartó tus cartas
                                hasta el {new Date(pedido.apartadoHasta).toLocaleDateString('es-MX')}.</p>
                            <Link to="/catalogo" className="btn btn--contorno">Seguir viendo cartas</Link>
                        </div>
                    ) : (
                        <>
                            <h2 className="titulo-tarjeta">Tus datos</h2>
                            <label className="etiqueta">Nombre<input className="campo" required {...campo('nombre')} /></label>
                            <label className="etiqueta">Correo electrónico<input className="campo" type="email" required {...campo('email')} /></label>
                            <label className="etiqueta">Teléfono (opcional)<input className="campo" type="tel" {...campo('telefono')} /></label>
                            <label className="etiqueta">Notas<textarea className="campo" rows="3" {...campo('notas')} /></label>
                            {error && <p className="alerta alerta--error">{error}</p>}
                            <button type="submit" className="btn btn--rojo btn--grande" disabled={enviando || items.length === 0}>
                                {enviando ? 'Enviando…' : 'Enviar pedido por correo'}
                            </button>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}
