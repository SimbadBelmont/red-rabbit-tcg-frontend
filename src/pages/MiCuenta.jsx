import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as wishlist from '../services/wishlistService';
import { cancelarPedido, misPedidos, quitarArticulo } from '../services/pedidoService';
import { misEventos } from '../services/eventoService';
import { actualizarPerfil } from '../services/authService';
import { nombreJuego } from '../services/inventarioService';
import { fechaLarga, hora, mxn } from '../utils/formato';
import { etiquetaAcabado } from '../utils/acabados';
import { etiquetaCondicion } from '../services/inventarioService';
import { IconoUsuario } from '../components/Iconos';

const PESTANAS = [['wishlist', 'Wishlist'], ['pedidos', 'Pedidos'], ['eventos', 'Mis eventos'], ['ajustes', 'Ajustes']];

export default function MiCuenta() {
    const { user, setUser, logout } = useAuth();
    const [params, setParams] = useSearchParams();
    // La sección viene en la URL (?seccion=pedidos) para que el menú de la cuenta lleve directo
    const pestana = PESTANAS.some(([id]) => id === params.get('seccion')) ? params.get('seccion') : 'wishlist';
    const setPestana = (id) => setParams({ seccion: id }, { replace: true });
    const [deseos, setDeseos] = useState([]);
    const [pedidos, setPedidos] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [perfil, setPerfil] = useState({ nombre: user.nombre, telefono: user.telefono || '', wizardsId: user.wizardsId || '' });
    const [aviso, setAviso] = useState('');
    const [avisoPedido, setAvisoPedido] = useState(null);
    const [ocupado, setOcupado] = useState(null);
    const [confirmarCancelar, setConfirmarCancelar] = useState(null);

    const reemplazarPedido = (actualizado) => setPedidos((lista) => lista.map((x) => (x._id === actualizado._id ? actualizado : x)));

    const quitarDePedido = async (pedido, item) => {
        setOcupado(pedido._id); setAvisoPedido(null);
        try {
            const actualizado = await quitarArticulo(pedido._id, item.carta);
            reemplazarPedido(actualizado);
            setAvisoPedido({ tipo: 'ok', texto: actualizado.estado === 'cancelado' ? `Quitaste la última carta; el pedido ${pedido.folio} quedó cancelado.` : `Quitaste ${item.nombre} del pedido ${pedido.folio}.` });
        } catch (e) {
            setAvisoPedido({ tipo: 'error', texto: e.message });
        } finally { setOcupado(null); }
    };

    const cancelar = async (pedido) => {
        setOcupado(pedido._id); setAvisoPedido(null);
        try {
            reemplazarPedido(await cancelarPedido(pedido._id));
            setConfirmarCancelar(null);
            setAvisoPedido({ tipo: 'ok', texto: `Cancelaste el pedido ${pedido.folio}.` });
        } catch (e) {
            setAvisoPedido({ tipo: 'error', texto: e.message });
        } finally { setOcupado(null); }
    };

    useEffect(() => {
        wishlist.listar().then(setDeseos).catch(() => {});
        misPedidos().then(setPedidos).catch(() => {});
        misEventos().then(setEventos).catch(() => {});
    }, []);

    const quitarDeseo = async (id) => {
        await wishlist.quitar(id);
        setDeseos((d) => d.filter((x) => x._id !== id));
    };

    const guardarPerfil = async (e) => {
        e.preventDefault();
        const actualizado = await actualizarPerfil(perfil);
        localStorage.setItem('usuario', JSON.stringify(actualizado));
        setUser(actualizado);
        setAviso('Datos guardados');
    };

    return (
        <div className="contenedor pagina pagina--media">
            <div className="encabezado-pagina">
                <div className="perfil">
                    <span className="perfil__avatar"><IconoUsuario size={32} /></span>
                    <div className="pila-chica">
                        <h1 className="titulo-seccion">Hola, {user.nombre}</h1>
                        <span className="texto-suave">{user.email}{user.createdAt && ` · Miembro desde ${new Date(user.createdAt).getFullYear()}`}</span>
                    </div>
                </div>
                <div className="tarjeta contadores">
                    <div><strong>{deseos.length}</strong><span>Wishlist</span></div>
                    <div><strong>{pedidos.length}</strong><span>Pedidos</span></div>
                </div>
            </div>

            <div role="tablist" aria-label="Secciones de mi cuenta" className="pestanas">
                {PESTANAS.map(([id, l]) => (
                    <button key={id} type="button" role="tab" aria-selected={pestana === id} className={`pestana ${pestana === id ? 'activo' : ''}`} onClick={() => setPestana(id)}>{l}</button>
                ))}
            </div>

            {pestana === 'wishlist' && (
                <div className="pila">
                    {deseos.map((w) => (
                        <div key={w._id} className="tarjeta fila-lista">
                            <div className="pila-chica fila-lista__info"><strong>{w.carta.nombre}</strong><span className="texto-suave">{nombreJuego(w.carta.juego)}</span></div>
                            <div className="fila-lista__precio"><span className="texto-suave texto-chico">Precio objetivo</span><strong>{mxn(w.precioObjetivo)}</strong></div>
                            <span className={`pastilla ${w.carta.stock > 0 ? 'pastilla--roja' : 'pastilla--gris'}`}>{w.carta.stock > 0 ? 'Disponible' : 'Agotada'}</span>
                            <button type="button" className="btn-texto" onClick={() => quitarDeseo(w._id)}>Quitar</button>
                        </div>
                    ))}
                    {deseos.length === 0 && <p className="texto-suave">Tu wishlist está vacía.</p>}
                    <p className="alerta alerta--info">Te avisaremos por correo cuando alguna carta de tu wishlist baje al precio objetivo.</p>
                </div>
            )}

            {pestana === 'pedidos' && (
                <div className="pila">
                    {avisoPedido && <p className={`alerta ${avisoPedido.tipo === 'ok' ? 'alerta--ok' : 'alerta--error'}`} role="status">{avisoPedido.texto}</p>}
                    {pedidos.map((p) => {
                        const editable = p.estado === 'pendiente';
                        return (
                            <details key={p._id} className="tarjeta pedido" open={editable}>
                                <summary className="pedido__resumen">
                                    <div className="pila-chica fila-lista__info"><strong>{p.folio}</strong><span className="texto-suave">{new Date(p.createdAt).toLocaleDateString('es-MX')} · {p.items.reduce((s, i) => s + i.cantidad, 0)} artículos</span></div>
                                    <strong>{mxn(p.total)}</strong>
                                    <span className={`pastilla ${editable ? 'pastilla--aviso' : 'pastilla--gris'} capitalizar`}>{p.estado}</span>
                                </summary>
                                <ul className="pedido__items">
                                    {p.items.map((i) => (
                                        <li key={i.carta} className="pedido__item">
                                            <span>{i.cantidad} × {i.nombre}{(i.condicion || i.acabado) && <span className="texto-suave texto-chico"> · {[etiquetaCondicion(i.condicion), etiquetaAcabado(i.acabado)].filter(Boolean).join(' · ')}</span>}</span>
                                            <span className="pedido__item-fin">
                                                {mxn(i.precio * i.cantidad)}
                                                {editable && (
                                                    <button type="button" className="btn-texto" disabled={ocupado === p._id} onClick={() => quitarDePedido(p, i)}>Quitar</button>
                                                )}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                {editable ? (
                                    <div className="fila-botones">
                                        {confirmarCancelar === p._id ? (
                                            <>
                                                <span className="texto-chico">¿Cancelar todo el pedido? Las cartas regresan al inventario.</span>
                                                <button type="button" className="btn btn--rojo btn--chico" disabled={ocupado === p._id} onClick={() => cancelar(p)}>Sí, cancelar</button>
                                                <button type="button" className="btn-texto" onClick={() => setConfirmarCancelar(null)}>No</button>
                                            </>
                                        ) : (
                                            <button type="button" className="btn btn--contorno btn--chico" onClick={() => setConfirmarCancelar(p._id)}>Cancelar pedido</button>
                                        )}
                                    </div>
                                ) : p.estado !== 'cancelado' && p.estado !== 'entregado' && (
                                    <p className="texto-suave texto-chico">La tienda ya confirmó este pedido. Para cambiarlo, contáctanos.</p>
                                )}
                            </details>
                        );
                    })}
                    {pedidos.length === 0 && <p className="texto-suave">Aún no tienes pedidos.</p>}
                </div>
            )}

            {pestana === 'eventos' && (
                <div className="pila">
                    {eventos.map((e) => (
                        <div key={e._id} className="tarjeta fila-lista">
                            <div className="pila-chica fila-lista__info"><strong>{e.titulo}</strong><span className="texto-suave capitalizar">{fechaLarga(e.fecha)} · {hora(e.fecha)} h</span></div>
                            <span className="pastilla pastilla--roja">{e.tipo}</span>
                        </div>
                    ))}
                    {eventos.length === 0 && <p className="texto-suave">No tienes eventos reservados.</p>}
                </div>
            )}

            {pestana === 'ajustes' && (
                <form className="tarjeta pila formulario-angosto" onSubmit={guardarPerfil}>
                    <label className="etiqueta">Nombre<input className="campo" required maxLength={60} value={perfil.nombre} onChange={(e) => setPerfil({ ...perfil, nombre: e.target.value })} /></label>
                    <label className="etiqueta">Teléfono<input className="campo" type="tel" value={perfil.telefono} onChange={(e) => setPerfil({ ...perfil, telefono: e.target.value })} /></label>
                    <label className="etiqueta">Wizards Account (para eventos de Magic)<input className="campo" value={perfil.wizardsId} onChange={(e) => setPerfil({ ...perfil, wizardsId: e.target.value })} /></label>
                    {aviso && <p className="alerta alerta--ok">{aviso}</p>}
                    <div className="fila-botones">
                        <button type="submit" className="btn btn--rojo">Guardar</button>
                        <button type="button" className="btn btn--contorno" onClick={logout}>Cerrar sesión</button>
                    </div>
                </form>
            )}
        </div>
    );
}
