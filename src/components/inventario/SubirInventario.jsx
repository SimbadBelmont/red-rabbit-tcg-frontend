import { useMemo, useRef, useState } from 'react';
import { descargarPlantilla, importarLote, nombreJuego, previsualizarCsv } from '../../services/inventarioService';
import { mxn } from '../../utils/formato';
import { IconoSubir } from '../Iconos';
import CamposCarta from './CamposCarta';
import { limpiar, problemasDe } from './editorCarta';

const COLUMNAS = ['nombre', 'juego', 'expansion', 'numero', 'rareza', 'condicion', 'idioma', 'foil', 'precio', 'moneda', 'stock'];
const POR_PAGINA = 50;

// Junta las filas válidas y las que faltan por corregir en una sola lista editable
const armarFilas = (vista) => [
    ...(vista.errores || []).filter((e) => e.carta).map((e, i) => ({ ...e.carta, clave: `e${i}`, linea: e.linea })),
    ...(vista.cartas || vista.muestra || []).map((c, i) => ({ ...c, clave: `v${i}` })),
].map((f) => ({ ...f, problemas: problemasDe(f) }));

export default function SubirInventario() {
    const input = useRef(null);
    const [archivo, setArchivo] = useState(null);
    const [vista, setVista] = useState(null);
    const [filas, setFilas] = useState([]);
    const [filtro, setFiltro] = useState('corregir');
    const [pagina, setPagina] = useState(1);
    const [editando, setEditando] = useState(null);   // { clave, valores }
    const [modo, setModo] = useState('sumar');
    const [resultado, setResultado] = useState(null);
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const [arrastrando, setArrastrando] = useState(false);

    const elegir = async (f) => {
        if (!f) return;
        setArchivo(f); setVista(null); setFilas([]); setResultado(null); setError(''); setEditando(null); setCargando(true);
        try {
            const v = await previsualizarCsv(f);
            const lista = armarFilas(v);
            setVista(v);
            setFilas(lista);
            setFiltro(lista.some((x) => x.problemas.length) ? 'corregir' : 'listas');
            setPagina(1);
        } catch (e) { setError(e.message); } finally { setCargando(false); }
    };

    const porCorregir = filas.filter((f) => f.problemas.length);
    const listas = filas.filter((f) => !f.problemas.length);
    // Errores que no traen la carta leída (backend anterior o filas ilegibles): solo se informan
    const ilegibles = (vista?.errores || []).filter((e) => !e.carta);

    const visibles = useMemo(() => {
        const base = filtro === 'corregir' ? porCorregir : filtro === 'listas' ? listas : filas;
        return base.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
    }, [filas, filtro, pagina, porCorregir, listas]);
    const totalFiltro = filtro === 'corregir' ? porCorregir.length : filtro === 'listas' ? listas.length : filas.length;
    const paginas = Math.max(Math.ceil(totalFiltro / POR_PAGINA), 1);

    const cambiarFiltro = (f) => { setFiltro(f); setPagina(1); setEditando(null); };

    const guardarFila = () => {
        setFilas((prev) => prev.map((f) => (f.clave === editando.clave ? { ...editando.valores, problemas: problemasDe(editando.valores) } : f)));
        setEditando(null);
    };
    const quitarFila = (clave) => setFilas((prev) => prev.filter((f) => f.clave !== clave));

    const confirmar = async () => {
        setCargando(true); setError('');
        try {
            // eslint-disable-next-line no-unused-vars
            const cartas = listas.map(({ clave, linea, problemas, precioOriginal, ...c }) => limpiar(c));
            const r = await importarLote(cartas, modo);
            setResultado({ ...r, omitidas: porCorregir.length });
            setVista(null); setArchivo(null); setFilas([]);
        } catch (e) { setError(e.message); } finally { setCargando(false); }
    };

    return (
        <div className="pila">
            <div className="encabezado-seccion">
                <p className="texto-suave">Importa tu stock desde un CSV (plantilla propia o exportación de ManaBox). Revisa y corrige las cartas antes de cargarlas.</p>
                <button type="button" className="btn btn--contorno" onClick={() => descargarPlantilla().catch((e) => setError(e.message))}>Descargar plantilla</button>
            </div>

            {!vista && (
                <div className={`zona-carga ${arrastrando ? 'activa' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
                    onDragLeave={() => setArrastrando(false)}
                    onDrop={(e) => { e.preventDefault(); setArrastrando(false); elegir(e.dataTransfer.files[0]); }}>
                    <span className="zona-carga__icono"><IconoSubir /></span>
                    <h2 className="titulo-tarjeta">Arrastra tu archivo CSV aquí</h2>
                    <p className="texto-suave">o selecciónalo desde tu equipo. Formato máximo recomendado: 10.000 filas.</p>
                    <input ref={input} type="file" accept=".csv,text/csv" className="sr-only" id="csv" onChange={(e) => elegir(e.target.files[0])} />
                    <label htmlFor="csv" className="btn btn--rojo">Seleccionar archivo</label>
                    <div className="columnas-esperadas">
                        <span className="sobretitulo">COLUMNAS ESPERADAS</span>
                        <div className="fila-botones">{COLUMNAS.map((c) => <code key={c} className="codigo">{c}</code>)}</div>
                        <span className="texto-suave texto-chico">También puedes subir directo el CSV que exporta ManaBox.</span>
                    </div>
                </div>
            )}

            {cargando && <p className="texto-suave" role="status">Procesando…</p>}
            {error && <p className="alerta alerta--error">{error}</p>}

            {vista && (
                <section className="tarjeta pila" aria-labelledby="vista-t">
                    <div className="encabezado-seccion">
                        <h2 id="vista-t" className="titulo-tarjeta">Vista previa · {archivo?.name}</h2>
                        <button type="button" className="btn btn--contorno btn--chico" onClick={() => { setVista(null); setArchivo(null); setFilas([]); }}>Elegir otro archivo</button>
                    </div>

                    {vista.formato ? (
                        <p className="alerta alerta--info">
                            Formato detectado: <strong>{vista.formato === 'manabox' ? 'exportación de ManaBox' : 'plantilla de Red Rabbit'}</strong>.
                            {' '}Dólares a pesos: {vista.conversion?.tipoCambioUSD ? `$${vista.conversion.tipoCambioUSD} por dólar` : 'sin tipo de cambio configurado'}
                            {vista.conversion?.margen ? ` + ${vista.conversion.margen}% de margen` : ''}. Las filas repetidas se suman.
                        </p>
                    ) : (
                        <p className="alerta alerta--error">El servidor todavía tiene la versión anterior del backend. Actualiza la imagen del backend.</p>
                    )}

                    {ilegibles.length > 0 && (
                        <details className="alerta alerta--error">
                            <summary>{ilegibles.length} filas no se pudieron leer y no se cargarán</summary>
                            <ul>{ilegibles.slice(0, 50).map((e) => <li key={e.linea}>Línea {e.linea}: {e.problemas.join(', ')}</li>)}</ul>
                        </details>
                    )}

                    <div role="tablist" aria-label="Filtrar filas" className="pestanas">
                        {[['corregir', `Por corregir (${porCorregir.length})`], ['listas', `Listas (${listas.length})`], ['todas', `Todas (${filas.length})`]].map(([id, l]) => (
                            <button key={id} type="button" role="tab" aria-selected={filtro === id} className={`pestana ${filtro === id ? 'activo' : ''}`} onClick={() => cambiarFiltro(id)}>{l}</button>
                        ))}
                    </div>

                    {filtro === 'corregir' && porCorregir.length === 0 && <p className="alerta alerta--ok">No hay cartas pendientes: todas están listas para cargar.</p>}

                    <div className="tabla-caja">
                        <table className="tabla tabla--editable">
                            <thead><tr><th>Carta</th><th>Condición</th><th>Cant.</th><th>Precio original</th><th>Precio en tienda</th><th><span className="sr-only">Acciones</span></th></tr></thead>
                            <tbody>
                                {visibles.map((f) => (editando?.clave === f.clave ? (
                                    <tr key={f.clave} className="tabla__fila-edicion">
                                        <td colSpan={6}>
                                            <div className="pila-chica">
                                                <strong>{f.nombre}</strong>
                                                <span className="texto-suave texto-chico">{nombreJuego(f.juego)} · {f.expansion} {f.numero}{f.precioOriginal ? ` · precio original ${f.precioOriginal}` : ''}</span>
                                                <CamposCarta id={f.clave} valores={editando.valores} conIdioma onCambio={(valores) => setEditando({ clave: f.clave, valores })} />
                                                {problemasDe(editando.valores).length > 0 && <span className="texto-error texto-chico">Falta: {problemasDe(editando.valores).join(', ')}</span>}
                                                <div className="fila-botones">
                                                    <button type="button" className="btn btn--rojo btn--chico" onClick={guardarFila}>Guardar cambios</button>
                                                    <button type="button" className="btn btn--contorno btn--chico" onClick={() => setEditando(null)}>Cancelar</button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr key={f.clave} className={f.problemas.length ? 'tabla__fila-error' : ''}>
                                        <td>
                                            <div className="pila-chica">
                                                <strong>{f.nombre}</strong>
                                                <span className="texto-suave texto-chico">{nombreJuego(f.juego)} · {f.expansion} {f.numero}{f.foil ? ' · Foil' : ''}{f.idioma ? ` · ${f.idioma.toUpperCase()}` : ''}</span>
                                                {f.problemas.length > 0 && <span className="texto-error texto-chico">{f.problemas.join(', ')}</span>}
                                            </div>
                                        </td>
                                        <td>{f.condicion}</td>
                                        <td>{f.stock}</td>
                                        <td>{f.precioOriginal || '—'}</td>
                                        <td>{Number.isFinite(Number(f.precio)) && f.precio !== '' && f.precio != null ? mxn(f.precio) : <span className="texto-error">Sin precio</span>}</td>
                                        <td>
                                            <div className="fila-botones fila-botones--fin">
                                                <button type="button" className={`btn btn--chico ${f.problemas.length ? 'btn--rojo' : 'btn--contorno'}`}
                                                    onClick={() => setEditando({ clave: f.clave, valores: { ...f } })}>{f.problemas.length ? 'Corregir' : 'Editar'}</button>
                                                <button type="button" className="btn-texto" aria-label={`No cargar ${f.nombre}`} onClick={() => quitarFila(f.clave)}>Quitar</button>
                                            </div>
                                        </td>
                                    </tr>
                                )))}
                            </tbody>
                        </table>
                    </div>

                    {paginas > 1 && (
                        <nav aria-label="Páginas de la vista previa" className="fila-botones paginacion">
                            <button type="button" className="btn btn--contorno btn--chico" disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)}>Anterior</button>
                            <span className="texto-suave">Página {pagina} de {paginas}</span>
                            <button type="button" className="btn btn--contorno btn--chico" disabled={pagina >= paginas} onClick={() => setPagina(pagina + 1)}>Siguiente</button>
                        </nav>
                    )}

                    <fieldset className="fila-botones">
                        <legend className="sobretitulo">SI LA CARTA YA EXISTE EN EL INVENTARIO</legend>
                        <label className="casilla"><input type="radio" name="modo" checked={modo === 'sumar'} onChange={() => setModo('sumar')} />Sumar al stock actual</label>
                        <label className="casilla"><input type="radio" name="modo" checked={modo === 'reemplazar'} onChange={() => setModo('reemplazar')} />Reemplazar el stock</label>
                    </fieldset>
                    <div className="fila-botones">
                        <button type="button" className="btn btn--rojo" disabled={cargando || listas.length === 0} onClick={confirmar}>
                            Cargar {listas.length} {listas.length === 1 ? 'carta' : 'cartas'}
                        </button>
                        {porCorregir.length > 0 && <span className="texto-suave texto-chico">{porCorregir.length} por corregir no se cargarán hasta que las completes.</span>}
                    </div>
                </section>
            )}

            {resultado && (
                <p className="alerta alerta--ok" role="status">
                    Carga lista: {resultado.nuevas} cartas nuevas y {resultado.actualizadas} actualizadas
                    {resultado.omitidas ? ` (${resultado.omitidas} sin completar se omitieron)` : ''}.
                    Las imágenes de Magic se descargan de Scryfall en segundo plano (pueden tardar un par de minutos).
                </p>
            )}
        </div>
    );
}
