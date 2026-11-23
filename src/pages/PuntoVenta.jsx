import { useState } from 'react';
import { catalogo, nombreJuego } from '../services/inventarioService';
import { ventaPos } from '../services/pedidoService';
import { mxn } from '../utils/formato';
import { etiquetaAcabado } from '../utils/acabados';

// Venta de mostrador: busca, agrega y cobra. Descuenta el stock al registrar la venta.
export default function PuntoVenta() {
    const [q, setQ] = useState('');
    const [resultados, setResultados] = useState([]);
    const [venta, setVenta] = useState([]);
    const [mensaje, setMensaje] = useState(null);

    const buscar = async (e) => {
        e.preventDefault();
        const d = await catalogo({ q, porPagina: 20 });
        // El catálogo agrupa por impresión; aquí se muestra una fila por condición
        setResultados(d.cartas.flatMap((g) => (g.variantes || [g]).map((v) => ({
            ...g, ...v, variantes: undefined, acabado: g.acabado,
        }))));
    };
    const agregar = (c) => setVenta((v) => {
        const ya = v.find((i) => i._id === c._id);
        if (ya) return v.map((i) => (i._id === c._id ? { ...i, cantidad: Math.min(i.cantidad + 1, c.stock) } : i));
        return [...v, { ...c, cantidad: 1 }];
    });
    const total = venta.reduce((s, i) => s + i.precio * i.cantidad, 0);

    const cobrar = async () => {
        try {
            const p = await ventaPos({ items: venta.map((i) => ({ carta: i._id, cantidad: i.cantidad })) });
            setMensaje({ tipo: 'ok', texto: `Venta ${p.folio} registrada por ${mxn(p.total)}` });
            setVenta([]); setResultados([]);
        } catch (e) {
            setMensaje({ tipo: 'error', texto: e.message });
        }
    };

    return (
        <div className="contenedor pagina">
            <h1 className="titulo-pagina">Punto de Venta</h1>
            <div className="con-lateral con-lateral--derecha">
                <div className="contenido pila">
                    <form className="fila-botones" onSubmit={buscar}>
                        <label className="sr-only" htmlFor="pos-q">Buscar carta</label>
                        <input id="pos-q" className="campo campo--ancho" placeholder="Buscar carta en inventario…" value={q} onChange={(e) => setQ(e.target.value)} />
                        <button type="submit" className="btn btn--rojo">Buscar</button>
                    </form>
                    {resultados.map((c) => (
                        <div key={c._id} className="tarjeta fila-lista">
                            <div className="pila-chica fila-lista__info"><strong>{c.nombre}</strong><span className="texto-suave texto-chico">{[nombreJuego(c.juego), c.expansion, c.condicion, etiquetaAcabado(c.acabado)].filter(Boolean).join(' · ')} · stock {c.stock}</span></div>
                            <strong>{mxn(c.precio)}</strong>
                            <button type="button" className="btn btn--contorno-rojo btn--chico" onClick={() => agregar(c)}>Agregar</button>
                        </div>
                    ))}
                </div>
                <aside className="tarjeta lateral pila" aria-label="Venta actual">
                    <h2 className="titulo-tarjeta">Venta actual</h2>
                    {venta.map((i) => (
                        <div key={i._id} className="total-fila texto-chico"><span>{i.cantidad} × {i.nombre} ({[i.condicion, etiquetaAcabado(i.acabado)].filter(Boolean).join(' · ')})</span><span>{mxn(i.precio * i.cantidad)}</span></div>
                    ))}
                    {venta.length === 0 && <p className="texto-suave">Sin artículos.</p>}
                    <div className="total-fila"><span>Total</span><strong>{mxn(total)}</strong></div>
                    {mensaje && <p className={`alerta ${mensaje.tipo === 'ok' ? 'alerta--ok' : 'alerta--error'}`}>{mensaje.texto}</p>}
                    <button type="button" className="btn btn--rojo btn--grande" disabled={venta.length === 0} onClick={cobrar}>Registrar venta</button>
                </aside>
            </div>
        </div>
    );
}
