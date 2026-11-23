import { useMemo, useState } from 'react';
import { aplicarPrecios, previsualizarPrecios } from '../../services/inventarioService';
import { etiquetaAcabado } from '../../utils/acabados';
import { mxn } from '../../utils/formato';

const UMBRALES = [[0, 'Todos los cambios'], [5, 'Cambios de 5% o más'], [10, 'Cambios de 10% o más'], [25, 'Cambios de 25% o más']];

// Recalcula precios de Magic con el mercado de Scryfall; nada cambia hasta "Aplicar"
export default function ActualizarPrecios() {
    const [datos, setDatos] = useState(null);
    const [elegidos, setElegidos] = useState(new Set());
    const [umbral, setUmbral] = useState(5);
    const [solo, setSolo] = useState('');          // '' | 'suben' | 'bajan'
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    const calcular = async () => {
        setCargando(true); setMensaje(null); setDatos(null);
        try {
            const d = await previsualizarPrecios();
            setDatos(d);
            setElegidos(new Set(d.cambios.filter((c) => Math.abs(c.cambioPct ?? 100) >= umbral).map((c) => c._id)));
        } catch (e) { setMensaje({ tipo: 'error', texto: e.message }); } finally { setCargando(false); }
    };

    const visibles = useMemo(() => (datos?.cambios || []).filter((c) => Math.abs(c.cambioPct ?? 100) >= umbral
        && (!solo || (solo === 'suben' ? c.precioNuevo > c.precioActual : c.precioNuevo < c.precioActual))), [datos, umbral, solo]);

    const alternar = (id) => setElegidos((prev) => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s; });
    const todosVisibles = visibles.length > 0 && visibles.every((c) => elegidos.has(c._id));
    const alternarTodos = () => setElegidos((prev) => {
        const s = new Set(prev);
        visibles.forEach((c) => (todosVisibles ? s.delete(c._id) : s.add(c._id)));
        return s;
    });

    const aplicar = async () => {
        const cambios = datos.cambios.filter((c) => elegidos.has(c._id)).map((c) => ({ id: c._id, precio: c.precioNuevo }));
        setCargando(true); setMensaje(null);
        try {
            const r = await aplicarPrecios(cambios);
            setMensaje({ tipo: 'ok', texto: `Listo: ${r.actualizadas} precios actualizados. A quien tenga esas cartas en su wishlist y bajaron a su precio objetivo le llegará un aviso.` });
            setDatos(null);
        } catch (e) { setMensaje({ tipo: 'error', texto: e.message }); } finally { setCargando(false); }
    };

    return (
        <div className="pila">
            <p className="texto-suave">
                Toma el precio de mercado actual de cada carta de Magic (TCGplayer vía Scryfall, según su acabado), lo convierte a pesos con tu tipo de cambio y margen,
                y le aplica un descuento por condición. Revisa la lista y aplica solo los que quieras.
            </p>
            <div className="fila-botones">
                <button type="button" className="btn btn--rojo" disabled={cargando} onClick={calcular}>{cargando && !datos ? 'Consultando precios… (puede tardar)' : 'Calcular precios nuevos'}</button>
            </div>
            {mensaje && <p className={`alerta ${mensaje.tipo === 'ok' ? 'alerta--ok' : 'alerta--error'}`} role="status">{mensaje.texto}</p>}

            {datos && (
                <section className="tarjeta pila" aria-labelledby="precios-t">
                    <div className="encabezado-seccion">
                        <h2 id="precios-t" className="titulo-tarjeta">{datos.cambios.length} precios cambiarían</h2>
                        <span className="texto-suave texto-chico">
                            {datos.revisadas} revisadas · {datos.iguales} sin cambio · {datos.sinPrecio} sin precio en Scryfall · dólar a ${datos.tipoCambio}{datos.margen ? ` + ${datos.margen}%` : ''}
                            · condición: {Object.entries(datos.factores).map(([k, v]) => `${k} ${Math.round(v * 100)}%`).join(', ')}
                        </span>
                    </div>
                    <div className="fila-botones">
                        <label className="sr-only" htmlFor="pr-umbral">Mostrar</label>
                        <select id="pr-umbral" className="campo campo--chico" value={umbral} onChange={(e) => setUmbral(Number(e.target.value))}>
                            {UMBRALES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                        {[['', 'Suben y bajan'], ['suben', 'Solo suben'], ['bajan', 'Solo bajan']].map(([v, l]) => (
                            <button key={v || 'ambos'} type="button" aria-pressed={solo === v} className={`chip ${solo === v ? 'activo' : ''}`} onClick={() => setSolo(v)}>{l}</button>
                        ))}
                    </div>
                    <div className="tabla-caja">
                        <table className="tabla tabla--editable">
                            <thead><tr>
                                <th><input type="checkbox" aria-label="Elegir todos los visibles" checked={todosVisibles} onChange={alternarTodos} /></th>
                                <th>Carta</th><th>Mercado</th><th>Actual</th><th>Nuevo</th><th>Cambio</th>
                            </tr></thead>
                            <tbody>
                                {visibles.map((c) => (
                                    <tr key={c._id}>
                                        <td><input type="checkbox" aria-label={`Actualizar ${c.nombre}`} checked={elegidos.has(c._id)} onChange={() => alternar(c._id)} /></td>
                                        <td><div className="pila-chica"><strong>{c.nombre}</strong><span className="texto-suave texto-chico">{[`${c.expansion} ${c.numero}`, c.condicion, etiquetaAcabado(c.acabado), c.idioma?.toUpperCase(), `stock ${c.stock}`].filter(Boolean).join(' · ')}</span></div></td>
                                        <td>US${c.usd.toFixed(2)}</td>
                                        <td>{mxn(c.precioActual)}</td>
                                        <td><strong>{mxn(c.precioNuevo)}</strong></td>
                                        <td className={c.precioNuevo > c.precioActual ? 'movimiento__mas' : 'movimiento__menos'}>{c.cambioPct != null ? `${c.cambioPct > 0 ? '+' : ''}${c.cambioPct}%` : 'nuevo'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {visibles.length === 0 && <p className="texto-suave">Ningún cambio con ese filtro.</p>}
                    <div className="fila-botones">
                        <button type="button" className="btn btn--rojo" disabled={cargando || elegidos.size === 0} onClick={aplicar}>Aplicar {elegidos.size} {elegidos.size === 1 ? 'precio' : 'precios'}</button>
                        <button type="button" className="btn btn--contorno" onClick={() => setDatos(null)}>Descartar</button>
                    </div>
                </section>
            )}
        </div>
    );
}
