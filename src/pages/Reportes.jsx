import { useEffect, useState } from 'react';
import { detalleEmpleado, resumenEmpleados } from '../services/reporteService';
import { nombreRol } from '../utils/roles';
import { mxn } from '../utils/formato';

// Fecha local en formato AAAA-MM-DD (sin pasar por UTC)
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const haceDias = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return iso(d); };
const PRESETS = [
    ['Hoy', () => [iso(new Date()), iso(new Date())]],
    ['7 días', () => [haceDias(6), iso(new Date())]],
    ['30 días', () => [haceDias(29), iso(new Date())]],
    ['Este mes', () => { const d = new Date(); return [iso(new Date(d.getFullYear(), d.getMonth(), 1)), iso(d)]; }],
];
const TIPOS = { carga_csv: 'Carga de inventario', alta: 'Alta de carta', ajuste: 'Ajuste de stock', baja: 'Baja del catálogo', reactivacion: 'Reactivación' };
const num = (n) => new Intl.NumberFormat('es-MX').format(n || 0);
const fechaHora = (f) => new Date(f).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

// Encargado y administrador: ventas y entradas de inventario de cada empleado
export default function Reportes() {
    const [rango, setRango] = useState(() => PRESETS[2][1]());
    const [datos, setDatos] = useState(null);
    const [error, setError] = useState('');
    const [detalle, setDetalle] = useState(null);
    const [desde, hasta] = rango;
    // Al cambiar el periodo se cierra el detalle abierto (era de otro rango)
    const cambiarRango = (r) => { setRango(r); setDetalle(null); };

    useEffect(() => {
        let vigente = true;
        resumenEmpleados(desde, hasta)
            .then((d) => { if (vigente) { setDatos(d); setError(''); } })
            .catch((e) => vigente && setError(e.message));
        return () => { vigente = false; };
    }, [desde, hasta]);

    const verDetalle = async (empleado) => {
        setDetalle({ usuario: empleado.usuario, cargando: true });
        try { setDetalle(await detalleEmpleado(empleado.usuario.id, desde, hasta)); } catch (e) { setError(e.message); setDetalle(null); }
    };

    const totales = datos?.totales;

    return (
        <div className="contenedor pagina">
            <div className="pila-chica">
                <h1 className="titulo-pagina">Ventas por empleado</h1>
                <p className="texto-suave texto-grande">Lo que vendió cada empleado (mostrador y pedidos entregados) y lo que agregó al inventario.</p>
            </div>

            <div className="fila-botones">
                {PRESETS.map(([nombre, calcular]) => {
                    const [d, h] = calcular();
                    return <button key={nombre} type="button" aria-pressed={d === desde && h === hasta} className={`chip ${d === desde && h === hasta ? 'activo' : ''}`} onClick={() => cambiarRango([d, h])}>{nombre}</button>;
                })}
                <label className="etiqueta etiqueta--chica etiqueta--linea">Desde<input className="campo campo--chico" type="date" value={desde} max={hasta} onChange={(e) => e.target.value && cambiarRango([e.target.value, hasta])} /></label>
                <label className="etiqueta etiqueta--chica etiqueta--linea">Hasta<input className="campo campo--chico" type="date" value={hasta} min={desde} onChange={(e) => e.target.value && cambiarRango([desde, e.target.value])} /></label>
            </div>

            {error && <p className="alerta alerta--error">{error}</p>}

            {totales && (
                <div className="rejilla rejilla--210">
                    <div className="tarjeta indicador"><span className="sobretitulo">VENDIDO</span><strong>{mxn(totales.montoVendido)}</strong><span className="texto-suave texto-chico">{num(totales.ventas)} ventas · {num(totales.unidadesVendidas)} cartas</span></div>
                    <div className="tarjeta indicador"><span className="sobretitulo">INGRESADO AL INVENTARIO</span><strong>{num(totales.unidadesEntrada)} cartas</strong><span className="texto-suave texto-chico">Valor a precio de venta: {mxn(totales.valorEntrada)}</span></div>
                </div>
            )}

            {datos && (
                <div className="tabla-caja">
                    <table className="tabla tabla--editable">
                        <thead>
                            <tr><th>Empleado</th><th>Ventas</th><th>Cartas vendidas</th><th>Monto vendido</th><th>Cartas ingresadas</th><th>Valor ingresado</th><th>Salidas por ajuste</th><th><span className="sr-only">Detalle</span></th></tr>
                        </thead>
                        <tbody>
                            {datos.empleados.map((e) => (
                                <tr key={e.usuario.id} className={detalle?.usuario?.id === e.usuario.id || detalle?.usuario?._id === e.usuario.id ? 'tabla__fila-edicion' : ''}>
                                    <td><div className="pila-chica"><strong>{e.usuario.nombre}</strong><span className="texto-suave texto-chico">{e.usuario.rol ? nombreRol(e.usuario.rol) : '—'}{e.usuario.activo === false ? ' · desactivada' : ''}</span></div></td>
                                    <td><span title={`${e.ventasMostrador} en mostrador · ${e.pedidosWeb} pedidos web`}>{num(e.ventas)}</span></td>
                                    <td>{num(e.unidadesVendidas)}</td>
                                    <td><strong>{mxn(e.montoVendido)}</strong></td>
                                    <td>{num(e.unidadesEntrada)}</td>
                                    <td>{mxn(e.valorEntrada)}</td>
                                    <td>{num(e.unidadesSalida)}</td>
                                    <td><button type="button" className="btn btn--contorno btn--chico" onClick={() => verDetalle(e)}>Ver detalle</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {datos && datos.empleados.length === 0 && <p className="texto-suave">Aún no hay empleados registrados.</p>}

            {detalle && (
                <section className="tarjeta pila" aria-labelledby="detalle-t">
                    <div className="encabezado-seccion">
                        <h2 id="detalle-t" className="titulo-tarjeta">{detalle.usuario.nombre} · {desde} a {hasta}</h2>
                        <button type="button" className="btn-texto" onClick={() => setDetalle(null)}>Cerrar</button>
                    </div>
                    {detalle.cargando ? <p className="texto-suave">Cargando…</p> : (
                        <div className="con-lateral">
                            <div className="contenido pila-chica">
                                <span className="sobretitulo">VENTAS ({detalle.ventas.length})</span>
                                {detalle.ventas.length === 0 && <span className="texto-suave texto-chico">Sin ventas en este periodo.</span>}
                                {detalle.ventas.map((v) => (
                                    <details key={v._id} className="pedido">
                                        <summary className="pedido__resumen">
                                            <div className="pila-chica fila-lista__info"><strong>{v.folio}</strong><span className="texto-suave texto-chico">{fechaHora(v.entregadoEn)} · {v.origen === 'pos' ? 'Mostrador' : `Pedido web de ${v.cliente?.nombre || 'cliente'}`}</span></div>
                                            <strong>{mxn(v.total)}</strong>
                                        </summary>
                                        <ul className="pedido__items">
                                            {v.items.map((i, n) => <li key={n} className="pedido__item"><span>{i.cantidad} × {i.nombre}</span><span>{mxn(i.precio * i.cantidad)}</span></li>)}
                                        </ul>
                                    </details>
                                ))}
                            </div>
                            <div className="lateral pila-chica">
                                <span className="sobretitulo">INVENTARIO ({detalle.movimientos.length})</span>
                                {detalle.movimientos.length === 0 && <span className="texto-suave texto-chico">Sin movimientos en este periodo.</span>}
                                {detalle.movimientos.map((m) => (
                                    <div key={m._id} className="movimiento">
                                        <div className="pila-chica">
                                            <strong className="texto-chico">{TIPOS[m.tipo] || m.tipo}</strong>
                                            <span className="texto-suave texto-chico">{fechaHora(m.createdAt)}{m.detalle ? ` · ${m.detalle}` : ''}</span>
                                        </div>
                                        {m.unidades !== 0 && <span className={m.unidades > 0 ? 'movimiento__mas' : 'movimiento__menos'}>{m.unidades > 0 ? '+' : ''}{num(m.unidades)}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            )}

            <p className="texto-suave texto-chico">
                Una venta cuenta para el empleado que la registró en el punto de venta o que marcó el pedido web como entregado.
                Las entradas de inventario salen de las cargas de CSV y de los ajustes de stock. El valor se calcula a precio de venta; el costo de compra todavía no se registra.
            </p>
        </div>
    );
}
