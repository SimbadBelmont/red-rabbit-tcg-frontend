import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePedido } from '../context/PedidoContext';
import { useAuth } from '../context/AuthContext';
import { crearPedido } from '../services/pedidoService';
import { nombreJuego } from '../services/inventarioService';
import { mxn } from '../utils/formato';
import { IconoCheck } from '../components/Iconos';

const PASOS = [
    { titulo: 'Elige del catálogo', texto: 'Busca por juego, expansión o rareza. Solo ves lo que hay en existencia.' },
    { titulo: 'Envía tu pedido', texto: 'Al confirmar, a ti y a la tienda les llega un correo con el detalle y se apartan las cartas.' },
    { titulo: 'Recoge y paga en tienda', texto: 'Te avisamos por correo cuando esté listo. Pagas al recoger en Cuernavaca.' },
];

export default function ComoPedir() {
    const { items, cambiarCantidad, quitar, vaciar, total } = usePedido();
    const { user } = useAuth();
    const [form, setForm] = useState({ nombre: user?.nombre || '', email: user?.email || '', telefono: user?.telefono || '', notas: '' });
    const [enviando, setEnviando] = useState(false);
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
                <h1 className="titulo-pagina">Cómo pedir tus cartas</h1>
                <p className="texto-suave texto-grande">Sin pagos en línea: apartas desde la página y confirmamos por correo.</p>
            </div>
            <div className="rejilla rejilla--260">
                {PASOS.map((p, i) => (
                    <div key={p.titulo} className="tarjeta paso">
                        <span className="paso__numero">{i + 1}</span>
                        <h2 className="paso__titulo">{p.titulo}</h2>
                        <p className="texto-suave">{p.texto}</p>
                    </div>
                ))}
            </div>

            <div className="con-lateral con-lateral--derecha">
                <section className="tarjeta contenido pila" aria-labelledby="pedido-t">
                    <h2 id="pedido-t" className="titulo-tarjeta">Tu pedido</h2>
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
