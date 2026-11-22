import { useRef, useState } from 'react';
import { descargarPlantilla, importarCsv, nombreJuego, previsualizarCsv } from '../services/inventarioService';
import { mxn } from '../utils/formato';
import { IconoSubir } from '../components/Iconos';

const COLUMNAS = ['nombre', 'juego', 'expansion', 'numero', 'rareza', 'condicion', 'idioma', 'foil', 'precio', 'moneda', 'stock'];

export default function Inventario() {
    const input = useRef(null);
    const [archivo, setArchivo] = useState(null);
    const [vista, setVista] = useState(null);
    const [modo, setModo] = useState('sumar');
    const [resultado, setResultado] = useState(null);
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const [arrastrando, setArrastrando] = useState(false);

    const elegir = async (f) => {
        if (!f) return;
        setArchivo(f); setVista(null); setResultado(null); setError(''); setCargando(true);
        try { setVista(await previsualizarCsv(f)); } catch (e) { setError(e.message); } finally { setCargando(false); }
    };

    const confirmar = async () => {
        setCargando(true); setError('');
        try {
            setResultado(await importarCsv(archivo, modo));
            setVista(null); setArchivo(null);
        } catch (e) { setError(e.message); } finally { setCargando(false); }
    };

    return (
        <div className="contenedor pagina">
            <div className="encabezado-pagina">
                <div className="pila-chica">
                    <h1 className="titulo-pagina">Subir inventario</h1>
                    <p className="texto-suave texto-grande">Importa tu stock de cartas desde un archivo CSV. Previsualiza los datos antes de confirmar la carga.</p>
                </div>
                <button type="button" className="btn btn--contorno" onClick={() => descargarPlantilla().catch((e) => setError(e.message))}>Descargar plantilla</button>
            </div>

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

            {cargando && <p className="texto-suave" role="status">Procesando…</p>}
            {error && <p className="alerta alerta--error">{error}</p>}

            {vista && (
                <section className="tarjeta pila" aria-labelledby="vista-t">
                    <div className="encabezado-seccion">
                        <h2 id="vista-t" className="titulo-tarjeta">Vista previa · {archivo?.name}</h2>
                        <span className="texto-suave">{vista.validas} cartas listas de {vista.total} filas</span>
                    </div>
                    <p className="alerta alerta--info">
                        Formato detectado: <strong>{vista.formato === 'manabox' ? 'exportación de ManaBox' : 'plantilla de Red Rabbit'}</strong>.
                        {' '}Dólares a pesos: {vista.conversion.tipoCambioUSD ? `$${vista.conversion.tipoCambioUSD} por dólar` : 'sin tipo de cambio configurado'}
                        {vista.conversion.margen ? ` + ${vista.conversion.margen}% de margen` : ''}. Las filas repetidas se suman.
                    </p>
                    {vista.errores.length > 0 && (
                        <details className="alerta alerta--error">
                            <summary>{vista.errores.length} filas con errores (no se cargarán)</summary>
                            <ul>{vista.errores.slice(0, 50).map((e) => <li key={e.linea}>Línea {e.linea}{e.nombre ? ` (${e.nombre})` : ''}: {e.problemas.join(', ')}</li>)}</ul>
                        </details>
                    )}
                    <div className="tabla-caja">
                        <table className="tabla">
                            <thead><tr><th>Nombre</th><th>Juego</th><th>Expansión</th><th>Nº</th><th>Condición</th><th>Precio original</th><th>Precio en tienda</th><th>Stock</th></tr></thead>
                            <tbody>
                                {vista.muestra.map((c, i) => (
                                    <tr key={i}><td>{c.nombre}</td><td>{nombreJuego(c.juego)}</td><td>{c.expansion}</td><td>{c.numero}</td><td>{c.condicion}{c.foil ? ' · Foil' : ''}</td><td>{c.precioOriginal || '—'}</td><td>{mxn(c.precio)}</td><td>{c.stock}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <fieldset className="fila-botones">
                        <legend className="sobretitulo">SI LA CARTA YA EXISTE</legend>
                        <label className="casilla"><input type="radio" name="modo" checked={modo === 'sumar'} onChange={() => setModo('sumar')} />Sumar al stock actual</label>
                        <label className="casilla"><input type="radio" name="modo" checked={modo === 'reemplazar'} onChange={() => setModo('reemplazar')} />Reemplazar el stock</label>
                    </fieldset>
                    <div className="fila-botones">
                        <button type="button" className="btn btn--rojo" disabled={cargando || vista.validas === 0} onClick={confirmar}>Confirmar carga</button>
                        <button type="button" className="btn btn--contorno" onClick={() => { setVista(null); setArchivo(null); }}>Cancelar</button>
                    </div>
                </section>
            )}

            {resultado && (
                <p className="alerta alerta--ok" role="status">
                    Carga lista: {resultado.nuevas} cartas nuevas y {resultado.actualizadas} actualizadas.
                    Las imágenes de Magic se están descargando de Scryfall en segundo plano (pueden tardar un par de minutos).
                </p>
            )}
        </div>
    );
}
