import { useEffect, useState } from 'react';
import { cambiarEstadoPedido, extenderApartado, listarPedidos, resumenPedidos } from '../services/pedidoService';
import { etiquetaCondicion } from '../services/inventarioService';
import { etiquetaAcabado } from '../utils/acabados';
import { mxn } from '../utils/formato';

const PESTANAS = [
    ['pendiente', 'Por confirmar'],
    ['confirmado', 'Confirmados'],
    ['listo', 'Listos para recoger'],
    ['entregado', 'Entregados'],
    ['cancelado', 'Cancelados'],
];
// Siguiente paso de cada estado (botón principal)
const SIGUIENTE = { pendiente: ['confirmado', 'Confirmar pedido'], confirmado: ['listo', 'Marcar listo para recoger'], listo: ['entregado', 'Marcar entregado'] };
const fecha = (f) => new Date(f).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const horasRestantes = (f) => Math.round((new Date(f) - Date.now()) / 3600000);
function Vence({ hasta }) {
    if (!hasta) return null;
    const h = horasRestantes(hasta);
    if (h < 0) return <span className="pastilla pastilla--roja">Apartado vencido</span>;
    return <span className={`pastilla ${h <= 24 ? 'pastilla--aviso' : 'pastilla--gris'}`}>Vence {h <= 24 ? `en ${h} h` : fecha(hasta)}</span>;
}

// Staff: pedidos web por estado; confirmar, marcar listo/entregado, cancelar o extender el apartado
export default function GestionPedidos() {
    const [estado, setEstado] = useState('pendiente');
    const [busqueda, setBusqueda] = useState('');
    const [q, setQ] = useState('');
    const [pagina, setPagina] = useState(1);
    const [datos, setDatos] = useState({ pedidos: [], total: 0, paginas: 0 });
    const [resumen, setResumen] = useState({ porEstado: {}, porVencer: 0 });
    const [recarga, setRecarga] = useState(0);
    const [ocupado, setOcupado] = useState(null);
    const [confirmarCancelar, setConfirmarCancelar] = useState(null);
    const [mensaje, setMensaje] = useState(null);

    useEffect(() => {
        const t = setTimeout(() => { setQ(busqueda); setPagina(1); }, 350);
        return () => clearTimeout(t);
    }, [busqueda]);

    useEffect(() => {
        let vigente = true;
        Promise.all([listarPedidos({ estado, q, pagina, origen: 'web' }), resumenPedidos()])
            .then(([d, r]) => { if (vigente) { setDatos(d); setResumen(r); } })
            .catch((e) => vigente && setMensaje({ tipo: 'error', texto: e.message }));
        return () => { vigente = false; };
    }, [estado, q, pagina, recarga]);

    const cambiarPestana = (id) => { setEstado(id); setPagina(1); setConfirmarCancelar(null); };

    const actuar = async (pedido, accion, texto) => {
        setOcupado(pedido._id); setMensaje(null);
        try {
            await accion();
            setMensaje({ tipo: 'ok', texto });
            setConfirmarCancelar(null);
            setRecarga((n) => n + 1);
        } catch (e) { setMensaje({ tipo: 'error', texto: e.message }); } finally { setOcupado(null); }
    };

    return (
        <div className="contenedor pagina">
            <div className="encabezado-pagina">
                <div className="pila-chica">
                    <h1 className="titulo-pagina">Pedidos</h1>
                    <p className="texto-suave texto-grande">Pedidos hechos desde la página. Al cambiar el estado, al cliente le llega un correo.</p>
                </div>
                <label className="sr-only" htmlFor="ped-buscar">Buscar pedido</label>
                <input id="ped-buscar" type="search" className="campo" placeholder="Folio, nombre, correo o teléfono…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>

            {resumen.porVencer > 0 && (
                <p className="alerta alerta--info">{resumen.porVencer} {resumen.porVencer === 1 ? 'apartado vence' : 'apartados vencen'} en las próximas 24 horas. Al vencer se cancelan solos y las cartas regresan al inventario.</p>
            )}

            <div role="tablist" aria-label="Estado de los pedidos" className="pestanas">
                {PESTANAS.map(([id, l]) => (
                    <button key={id} type="button" role="tab" aria-selected={estado === id} className={`pestana ${estado === id ? 'activo' : ''}`} onClick={() => cambiarPestana(id)}>
                        {l}{resumen.porEstado?.[id] ? ` (${resumen.porEstado[id]})` : ''}
                    </button>
                ))}
            </div>

            {mensaje && <p className={`alerta ${mensaje.tipo === 'ok' ? 'alerta--ok' : 'alerta--error'}`} role="status">{mensaje.texto}</p>}

            <div className="pila">
                {datos.pedidos.map((p) => {
                    const sig = SIGUIENTE[p.estado];
                    const activo = Boolean(sig);
                    return (
                        <article key={p._id} className="tarjeta pedido-staff">
                            <div className="pedido-staff__cabeza">
                                <div className="pila-chica">
                                    <strong className="pedido-staff__folio">{p.folio}</strong>
                                    <span className="texto-suave texto-chico">{fecha(p.createdAt)}</span>
                                </div>
                                <div className="pila-chica pedido-staff__cliente">
                                    <strong>{p.cliente.nombre}</strong>
                                    <span className="texto-chico"><a href={`mailto:${p.cliente.email}`}>{p.cliente.email}</a>{p.cliente.telefono && <> · <a href={`https://wa.me/${p.cliente.telefono.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">{p.cliente.telefono}</a></>}</span>
                                </div>
                                <div className="pila-chica pedido-staff__total">
                                    <strong>{mxn(p.total)}</strong>
                                    {activo && <Vence hasta={p.apartadoHasta} />}
                                    {p.estado === 'entregado' && p.atendidoPor && <span className="texto-suave texto-chico">Entregó: {p.atendidoPor.nombre}</span>}
                                </div>
                            </div>

                            <ul className="pedido__items">
                                {p.items.map((i) => (
                                    <li key={i.carta} className="pedido__item">
                                        <span><strong>{i.cantidad} ×</strong> {i.nombre}
                                            <span className="texto-suave texto-chico"> · {[i.expansion && `${i.expansion}${i.numero ? ` ${i.numero}` : ''}`, etiquetaCondicion(i.condicion), etiquetaAcabado(i.acabado), i.idioma?.toUpperCase()].filter(Boolean).join(' · ')}</span>
                                        </span>
                                        <span>{mxn(i.precio * i.cantidad)}</span>
                                    </li>
                                ))}
                            </ul>
                            {p.notas && <p className="texto-chico pedido-staff__notas"><strong>Notas del cliente:</strong> {p.notas}</p>}

                            {activo && (
                                <div className="fila-botones pedido-staff__acciones">
                                    <button type="button" className="btn btn--rojo btn--chico" disabled={ocupado === p._id}
                                        onClick={() => actuar(p, () => cambiarEstadoPedido(p._id, sig[0]), `${p.folio}: ${sig[1].toLowerCase()} ✓`)}>{sig[1]}</button>
                                    <button type="button" className="btn btn--contorno btn--chico" disabled={ocupado === p._id}
                                        onClick={() => actuar(p, () => extenderApartado(p._id, 3), `${p.folio}: apartado extendido 3 días`)}>+3 días de apartado</button>
                                    {confirmarCancelar === p._id ? (
                                        <>
                                            <span className="texto-chico">¿Cancelar? Las cartas regresan al inventario.</span>
                                            <button type="button" className="btn btn--rojo btn--chico" disabled={ocupado === p._id}
                                                onClick={() => actuar(p, () => cambiarEstadoPedido(p._id, 'cancelado'), `${p.folio}: cancelado`)}>Sí, cancelar</button>
                                            <button type="button" className="btn-texto" onClick={() => setConfirmarCancelar(null)}>No</button>
                                        </>
                                    ) : (
                                        <button type="button" className="btn-texto" onClick={() => setConfirmarCancelar(p._id)}>Cancelar pedido</button>
                                    )}
                                </div>
                            )}
                        </article>
                    );
                })}
                {datos.pedidos.length === 0 && <p className="texto-suave">No hay pedidos {PESTANAS.find(([id]) => id === estado)[1].toLowerCase()}.</p>}
            </div>

            {datos.paginas > 1 && (
                <nav aria-label="Páginas de pedidos" className="fila-botones paginacion">
                    <button type="button" className="btn btn--contorno btn--chico" disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)}>Anterior</button>
                    <span className="texto-suave">Página {pagina} de {datos.paginas}</span>
                    <button type="button" className="btn btn--contorno btn--chico" disabled={pagina >= datos.paginas} onClick={() => setPagina(pagina + 1)}>Siguiente</button>
                </nav>
            )}
        </div>
    );
}
