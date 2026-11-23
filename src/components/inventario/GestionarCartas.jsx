import { useEffect, useState } from 'react';
import { JUEGOS, PRODUCTOS, actualizarCarta, eliminarCarta, etiquetaCondicion, listarInventario, nombreCondicion, nombreJuego } from '../../services/inventarioService';
import { mxn } from '../../utils/formato';
import { etiquetaAcabado } from '../../utils/acabados';
import { IconoCartaVacia } from '../Iconos';
import CamposCarta from './CamposCarta';
import { limpiar, problemasDe } from './editorCarta';

const ESTADOS = [['activas', 'En catálogo'], ['agotadas', 'Agotadas'], ['baja', 'Dadas de baja']];

// Editor del personal: precio, stock, condición y baja de cartas existentes
export default function GestionarCartas() {
    const [filtros, setFiltros] = useState({ q: '', juego: '', tipo: '', estado: 'activas', pagina: 1 });
    const [busqueda, setBusqueda] = useState('');
    const [datos, setDatos] = useState({ cartas: [], total: 0, paginas: 0 });
    const [recarga, setRecarga] = useState(0);
    const [editando, setEditando] = useState(null);       // { id, valores }
    const [confirmarBaja, setConfirmarBaja] = useState(null);
    const [ocupado, setOcupado] = useState(null);
    const [mensaje, setMensaje] = useState(null);

    useEffect(() => {
        const t = setTimeout(() => setFiltros((f) => (f.q === busqueda ? f : { ...f, q: busqueda, pagina: 1 })), 350);
        return () => clearTimeout(t);
    }, [busqueda]);

    useEffect(() => {
        let vigente = true;
        listarInventario({ ...filtros, porPagina: 50 })
            .then((d) => vigente && setDatos(d))
            .catch((e) => vigente && setMensaje({ tipo: 'error', texto: e.message }));
        return () => { vigente = false; };
    }, [filtros, recarga]);

    const cambiar = (campo, valor) => { setFiltros((f) => ({ ...f, [campo]: valor, pagina: 1 })); setEditando(null); };
    const reemplazarEnLista = (carta) => setDatos((d) => ({ ...d, cartas: d.cartas.map((c) => (c._id === carta._id ? carta : c)) }));

    const guardar = async () => {
        const { id, valores } = editando;
        setOcupado(id); setMensaje(null);
        try {
            const { precio, stock, condicion, acabado = 'normal', idioma, producto, tipo } = limpiar(valores);
            const carta = await actualizarCarta(id, tipo === 'sellado' ? { precio, stock, condicion, idioma, producto } : { precio, stock, condicion, acabado, idioma });
            reemplazarEnLista(carta);
            setEditando(null);
            setMensaje({ tipo: 'ok', texto: `${carta.nombre}: guardado.` });
        } catch (e) {
            setMensaje({ tipo: 'error', texto: e.message });
        } finally { setOcupado(null); }
    };

    // Ajuste rápido de stock con − / +
    const ajustarStock = async (carta, delta) => {
        const stock = Math.max(carta.stock + delta, 0);
        if (stock === carta.stock) return;
        setOcupado(carta._id);
        try { reemplazarEnLista(await actualizarCarta(carta._id, { stock })); } catch (e) { setMensaje({ tipo: 'error', texto: e.message }); } finally { setOcupado(null); }
    };

    const darDeBaja = async (carta) => {
        setOcupado(carta._id);
        try {
            await eliminarCarta(carta._id);
            setConfirmarBaja(null);
            setMensaje({ tipo: 'ok', texto: `${carta.nombre} ya no aparece en el catálogo. Puedes reactivarla desde "Dadas de baja".` });
            setRecarga((n) => n + 1);
        } catch (e) { setMensaje({ tipo: 'error', texto: e.message }); } finally { setOcupado(null); }
    };

    const reactivar = async (carta) => {
        setOcupado(carta._id);
        try {
            await actualizarCarta(carta._id, { activa: true });
            setMensaje({ tipo: 'ok', texto: `${carta.nombre} volvió al catálogo.` });
            setRecarga((n) => n + 1);
        } catch (e) { setMensaje({ tipo: 'error', texto: e.message }); } finally { setOcupado(null); }
    };

    return (
        <div className="pila">
            <div className="fila-botones">
                <label className="sr-only" htmlFor="inv-buscar">Buscar carta</label>
                <input id="inv-buscar" type="search" className="campo campo--ancho" placeholder="Buscar por nombre o código de expansión (ej. FIN)…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                <label className="sr-only" htmlFor="inv-juego">Juego</label>
                <select id="inv-juego" className="campo" value={filtros.juego} onChange={(e) => cambiar('juego', e.target.value)}>
                    <option value="">Todos los juegos</option>
                    {JUEGOS.map((j) => <option key={j.id} value={j.id}>{j.nombre}</option>)}
                </select>
                <label className="sr-only" htmlFor="inv-tipo">Tipo</label>
                <select id="inv-tipo" className="campo" value={filtros.tipo} onChange={(e) => cambiar('tipo', e.target.value)}>
                    <option value="">Cartas y sellado</option><option value="carta">Solo cartas</option><option value="sellado">Solo producto sellado</option>
                </select>
            </div>
            <div role="tablist" aria-label="Estado de las cartas" className="pestanas">
                {ESTADOS.map(([id, l]) => (
                    <button key={id} type="button" role="tab" aria-selected={filtros.estado === id} className={`pestana ${filtros.estado === id ? 'activo' : ''}`} onClick={() => cambiar('estado', id)}>{l}</button>
                ))}
            </div>

            {mensaje && <p className={`alerta ${mensaje.tipo === 'ok' ? 'alerta--ok' : 'alerta--error'}`} role="status">{mensaje.texto}</p>}
            <span className="texto-suave texto-chico" aria-live="polite">{datos.total} cartas</span>

            <div className="tabla-caja">
                <table className="tabla tabla--editable">
                    <thead><tr><th>Carta</th><th>Condición</th><th>Precio</th><th>Stock</th><th><span className="sr-only">Acciones</span></th></tr></thead>
                    <tbody>
                        {datos.cartas.map((c) => (editando?.id === c._id ? (
                            <tr key={c._id} className="tabla__fila-edicion">
                                <td colSpan={5}>
                                    <div className="pila-chica">
                                        <strong>{c.nombre}</strong>
                                        <span className="texto-suave texto-chico">{nombreJuego(c.juego)} · {c.expansion} {c.numero}</span>
                                        <CamposCarta id={c._id} valores={editando.valores} conIdioma onCambio={(valores) => setEditando({ id: c._id, valores })} />
                                        {problemasDe(editando.valores).length > 0 && <span className="texto-error texto-chico">Revisa: {problemasDe(editando.valores).join(', ')}</span>}
                                        <div className="fila-botones">
                                            <button type="button" className="btn btn--rojo btn--chico" disabled={ocupado === c._id || problemasDe(editando.valores).length > 0} onClick={guardar}>Guardar</button>
                                            <button type="button" className="btn btn--contorno btn--chico" onClick={() => setEditando(null)}>Cancelar</button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            <tr key={c._id}>
                                <td>
                                    <div className="carta-fila">
                                        <span className="carta-fila__mini">{c.imagen ? <img src={c.imagen} alt="" loading="lazy" /> : <IconoCartaVacia />}</span>
                                        <div className="pila-chica">
                                            <strong>{c.nombre}</strong>
                                            <span className="texto-suave texto-chico">{c.tipo === 'sellado' ? `${PRODUCTOS[c.producto] || 'Sellado'} · ` : ''}{nombreJuego(c.juego)} · {c.expansion} {c.numero}{etiquetaAcabado(c.acabado) ? ` · ${etiquetaAcabado(c.acabado)}` : ''}{c.idioma ? ` · ${c.idioma.toUpperCase()}` : ''}</span>
                                        </div>
                                    </div>
                                </td>
                                <td title={nombreCondicion(c.condicion)}>{etiquetaCondicion(c.condicion)}</td>
                                <td>{mxn(c.precio)}</td>
                                <td>
                                    <div className="stock-control">
                                        <button type="button" className="stock-control__btn" aria-label={`Restar 1 a ${c.nombre}`} disabled={ocupado === c._id || c.stock === 0} onClick={() => ajustarStock(c, -1)}>−</button>
                                        <span className={c.stock === 0 ? 'texto-error' : ''}>{c.stock}</span>
                                        <button type="button" className="stock-control__btn" aria-label={`Sumar 1 a ${c.nombre}`} disabled={ocupado === c._id} onClick={() => ajustarStock(c, 1)}>+</button>
                                    </div>
                                </td>
                                <td>
                                    {filtros.estado === 'baja' ? (
                                        <button type="button" className="btn btn--contorno btn--chico" disabled={ocupado === c._id} onClick={() => reactivar(c)}>Reactivar</button>
                                    ) : confirmarBaja === c._id ? (
                                        <div className="fila-botones fila-botones--fin">
                                            <span className="texto-chico">¿Quitar del catálogo?</span>
                                            <button type="button" className="btn btn--rojo btn--chico" disabled={ocupado === c._id} onClick={() => darDeBaja(c)}>Sí, quitar</button>
                                            <button type="button" className="btn-texto" onClick={() => setConfirmarBaja(null)}>No</button>
                                        </div>
                                    ) : (
                                        <div className="fila-botones fila-botones--fin">
                                            <button type="button" className="btn btn--contorno btn--chico" onClick={() => { setConfirmarBaja(null); setEditando({ id: c._id, valores: { ...c } }); }}>Editar</button>
                                            <button type="button" className="btn-texto" onClick={() => setConfirmarBaja(c._id)}>Eliminar</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )))}
                    </tbody>
                </table>
            </div>
            {datos.cartas.length === 0 && <p className="texto-suave">No hay cartas con esos filtros.</p>}

            {datos.paginas > 1 && (
                <nav aria-label="Páginas del inventario" className="fila-botones paginacion">
                    <button type="button" className="btn btn--contorno btn--chico" disabled={filtros.pagina <= 1} onClick={() => setFiltros((f) => ({ ...f, pagina: f.pagina - 1 }))}>Anterior</button>
                    <span className="texto-suave">Página {filtros.pagina} de {datos.paginas}</span>
                    <button type="button" className="btn btn--contorno btn--chico" disabled={filtros.pagina >= datos.paginas} onClick={() => setFiltros((f) => ({ ...f, pagina: f.pagina + 1 }))}>Siguiente</button>
                </nav>
            )}
        </div>
    );
}
