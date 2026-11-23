import { useEffect, useState } from 'react';
import { CONDICIONES, JUEGOS, crearCarta, scryfallAutocompletar, scryfallImpresiones, subirImagen } from '../../services/inventarioService';
import { nombreAcabado } from '../../utils/acabados';
import { mxn } from '../../utils/formato';
import { reducirImagen } from '../../utils/imagen';
import { IconoCartaVacia, IconoSubir } from '../Iconos';
import CamposCarta from './CamposCarta';
import { limpiar, problemasDe } from './editorCarta';

const BASE = { condicion: 'NM', idioma: 'es', stock: 1, precio: '', acabado: 'normal' };
const usd = (n) => (n == null ? 'sin precio' : `US$${n.toFixed(2)}`);

// Alta manual de cartas. Magic: se busca en Scryfall y se elige la impresión exacta.
// Otros juegos: formulario con foto opcional.
export default function AgregarCarta() {
    const [juego, setJuego] = useState('magic');
    const [mensaje, setMensaje] = useState(null);

    return (
        <div className="pila">
            <div className="fila-botones">
                <label className="etiqueta etiqueta--linea">Juego
                    <select className="campo" value={juego} onChange={(e) => { setJuego(e.target.value); setMensaje(null); }}>
                        {JUEGOS.map((j) => <option key={j.id} value={j.id}>{j.nombre}</option>)}
                    </select>
                </label>
                <span className="texto-suave texto-chico">
                    {juego === 'magic' ? 'Busca la carta por su nombre en inglés y elige la impresión exacta.' : 'Captura los datos y, si quieres, sube una foto de la carta.'}
                </span>
            </div>
            {mensaje && <p className={`alerta ${mensaje.tipo === 'ok' ? 'alerta--ok' : 'alerta--error'}`} role="status">{mensaje.texto}</p>}
            {juego === 'magic'
                ? <AltaMagic onMensaje={setMensaje} />
                : <AltaManual key={juego} juego={juego} onMensaje={setMensaje} />}
        </div>
    );
}

const textoResultado = (r, datos) => {
    const detalle = [datos.condicion, datos.acabado !== 'normal' && nombreAcabado(datos.acabado), datos.idioma?.toUpperCase()].filter(Boolean).join(' · ');
    return r.sumada
        ? `Se sumaron ${datos.stock} × ${r.carta.nombre} (${detalle}). Ahora hay ${r.carta.stock} en inventario.`
        : `Se agregó ${r.carta.nombre} (${detalle}) con ${r.carta.stock} en inventario.`;
};

function AltaMagic({ onMensaje }) {
    const [texto, setTexto] = useState('');
    const [sugerencias, setSugerencias] = useState([]);
    const [nombre, setNombre] = useState(null);
    const [impresiones, setImpresiones] = useState(null);
    const [impresion, setImpresion] = useState(null);
    const [valores, setValores] = useState(BASE);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    // Sugerencias mientras escribe (espera 300 ms; el backend limita el ritmo hacia Scryfall)
    useEffect(() => {
        if (nombre || texto.trim().length < 2) return undefined;
        let vigente = true;
        const t = setTimeout(() => {
            scryfallAutocompletar(texto.trim()).then((s) => vigente && setSugerencias(s)).catch(() => vigente && setSugerencias([]));
        }, 300);
        return () => { vigente = false; clearTimeout(t); };
    }, [texto, nombre]);

    const elegirNombre = async (n) => {
        setNombre(n); setTexto(n); setSugerencias([]); setImpresion(null); setError(''); setCargando(true);
        try {
            const lista = await scryfallImpresiones(n);
            setImpresiones(lista);
            if (lista.length === 1) elegirImpresion(lista[0]);
        } catch (e) { setError(e.message); } finally { setCargando(false); }
    };

    const elegirImpresion = (imp) => {
        setImpresion(imp);
        const primero = imp.acabados[0];
        setValores({ ...BASE, acabado: primero?.acabado || 'normal', precio: primero?.sugeridoMXN ?? '' });
    };

    const elegirAcabado = (a) => setValores((v) => ({ ...v, acabado: a.acabado, precio: a.sugeridoMXN ?? v.precio }));

    const reiniciar = () => { setTexto(''); setNombre(null); setImpresiones(null); setImpresion(null); setValores(BASE); setError(''); };

    const guardar = async (e) => {
        e.preventDefault();
        setCargando(true); setError('');
        const datos = limpiar({
            ...valores, juego: 'magic', nombre: impresion.nombre, expansion: impresion.expansion, numero: impresion.numero,
            rareza: impresion.rareza, scryfallId: impresion.scryfallId, imagen: impresion.imagen, artista: impresion.artista,
        });
        try {
            const r = await crearCarta(datos);
            onMensaje({ tipo: 'ok', texto: textoResultado(r, datos) });
            reiniciar();
        } catch (err) { setError(err.message); } finally { setCargando(false); }
    };

    const acabadoActual = impresion?.acabados.find((a) => a.acabado === valores.acabado);
    const faltan = problemasDe({ ...valores, nombre: impresion?.nombre });

    return (
        <div className="pila">
            <div className="buscador">
                <label className="etiqueta">Nombre de la carta
                    <input className="campo" type="search" autoComplete="off" placeholder="Ej. Sol Ring, Sheoldred…" value={texto}
                        onChange={(e) => { setTexto(e.target.value); setNombre(null); setImpresiones(null); setImpresion(null); }} />
                </label>
                {sugerencias.length > 0 && (
                    <ul className="buscador__lista" role="listbox" aria-label="Sugerencias">
                        {sugerencias.map((s) => (
                            <li key={s}><button type="button" role="option" aria-selected="false" className="buscador__opcion" onClick={() => elegirNombre(s)}>{s}</button></li>
                        ))}
                    </ul>
                )}
            </div>

            {cargando && !impresiones && <p className="texto-suave" role="status">Buscando en Scryfall…</p>}
            {error && <p className="alerta alerta--error">{error}</p>}

            {impresiones && !impresion && (
                <section className="pila-chica" aria-label="Impresiones">
                    <span className="sobretitulo">ELIGE LA IMPRESIÓN ({impresiones.length})</span>
                    {impresiones.length === 0 && <p className="texto-suave">Scryfall no encontró esa carta.</p>}
                    <div className="impresiones">
                        {impresiones.map((imp) => (
                            <button key={imp.scryfallId} type="button" className="impresion" onClick={() => elegirImpresion(imp)}>
                                <span className="impresion__imagen">{imp.imagen ? <img src={imp.imagen} alt="" loading="lazy" /> : <IconoCartaVacia />}</span>
                                <strong className="texto-chico">{imp.expansionNombre}</strong>
                                <span className="texto-suave texto-chico">{imp.expansion} #{imp.numero} · {imp.fecha?.slice(0, 4)}</span>
                                <span className="texto-chico">{imp.acabados.map((a) => nombreAcabado(a.acabado)).join(' / ')}</span>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {impresion && (
                <form className="tarjeta tarjeta--rosa alta" onSubmit={guardar}>
                    <div className="alta__imagen">{impresion.imagen ? <img src={impresion.imagen} alt={impresion.nombre} /> : <IconoCartaVacia />}</div>
                    <div className="pila">
                        <div className="pila-chica">
                            <h2 className="titulo-tarjeta">{impresion.nombre}</h2>
                            <span className="texto-suave">{impresion.expansionNombre} · {impresion.expansion} #{impresion.numero} · {impresion.rareza}</span>
                            {impresion.artista && <span className="carta__credito">Ilus. {impresion.artista} · Scryfall</span>}
                            <button type="button" className="btn-texto alta__cambiar" onClick={() => setImpresion(null)}>Cambiar impresión</button>
                        </div>

                        <fieldset className="pila-chica">
                            <legend className="sobretitulo">ACABADO</legend>
                            <div className="fila-botones">
                                {impresion.acabados.map((a) => (
                                    <button key={a.acabado} type="button" aria-pressed={valores.acabado === a.acabado}
                                        className={`chip ${valores.acabado === a.acabado ? 'activo' : ''}`} onClick={() => elegirAcabado(a)}>
                                        {nombreAcabado(a.acabado)} · {usd(a.usd)}
                                    </button>
                                ))}
                            </div>
                            <span className="texto-suave texto-chico">
                                {acabadoActual?.sugeridoMXN != null
                                    ? `Precio sugerido: ${mxn(acabadoActual.sugeridoMXN)} (mercado TCGplayer vía Scryfall, convertido con tu tipo de cambio y margen). Puedes cambiarlo.`
                                    : 'Sin precio sugerido (falta precio en Scryfall o el tipo de cambio en el servidor): escribe el precio.'}
                            </span>
                        </fieldset>

                        <CamposCarta id="alta-magic" valores={valores} conIdioma conAcabado={false} onCambio={setValores} />
                        {faltan.length > 0 && <span className="texto-error texto-chico">Falta: {faltan.join(', ')}</span>}
                        <div className="fila-botones">
                            <button type="submit" className="btn btn--rojo" disabled={cargando || faltan.length > 0 || Number(valores.stock) < 1}>{cargando ? 'Guardando…' : 'Agregar al inventario'}</button>
                            <button type="button" className="btn btn--contorno" onClick={reiniciar}>Empezar de nuevo</button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}

function AltaManual({ juego, onMensaje }) {
    const [datos, setDatos] = useState({ nombre: '', expansion: '', numero: '', rareza: '' });
    const [valores, setValores] = useState(BASE);
    const [foto, setFoto] = useState(null);           // { url, vista }
    const [subiendo, setSubiendo] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    const elegirFoto = async (archivo) => {
        if (!archivo) return;
        setSubiendo(true); setError('');
        try {
            const reducida = await reducirImagen(archivo);
            const { url } = await subirImagen(reducida);
            setFoto({ url, vista: URL.createObjectURL(reducida) });
        } catch (e) { setError(e.message || 'No se pudo subir la foto'); } finally { setSubiendo(false); }
    };

    const guardar = async (e) => {
        e.preventDefault();
        setGuardando(true); setError('');
        const completo = limpiar({ ...valores, ...datos, juego, imagen: foto?.url });
        try {
            const r = await crearCarta(completo);
            onMensaje({ tipo: 'ok', texto: textoResultado(r, completo) });
            setDatos({ nombre: '', expansion: datos.expansion, numero: '', rareza: '' });   // la expansión suele repetirse
            setValores(BASE); setFoto(null);
        } catch (err) { setError(err.message); } finally { setGuardando(false); }
    };

    const campo = (k) => ({ value: datos[k], onChange: (e) => setDatos({ ...datos, [k]: e.target.value }) });
    const faltan = problemasDe({ ...valores, nombre: datos.nombre });

    return (
        <form className="tarjeta tarjeta--rosa alta" onSubmit={guardar}>
            <div className="pila-chica">
                <div className="alta__imagen">{foto ? <img src={foto.vista} alt="Foto de la carta" /> : <IconoCartaVacia />}</div>
                <input type="file" accept="image/*" capture="environment" id="foto-carta" className="sr-only" onChange={(e) => elegirFoto(e.target.files[0])} />
                <label htmlFor="foto-carta" className="btn btn--contorno btn--chico"><IconoSubir size={16} /> {subiendo ? 'Subiendo…' : foto ? 'Cambiar foto' : 'Subir foto (opcional)'}</label>
            </div>
            <div className="pila">
                <div className="rejilla-formulario">
                    <label className="etiqueta">Nombre<input className="campo" required {...campo('nombre')} /></label>
                    <label className="etiqueta">Expansión (código o nombre)<input className="campo" {...campo('expansion')} /></label>
                    <label className="etiqueta">Número<input className="campo" {...campo('numero')} /></label>
                    <label className="etiqueta">Rareza<input className="campo" {...campo('rareza')} placeholder="Ej. rare, SR, secret" /></label>
                </div>
                <CamposCarta id="alta-manual" valores={valores} conIdioma onCambio={setValores} />
                <span className="texto-suave texto-chico">Condición: {CONDICIONES[valores.condicion]}. Si ya existe esta carta con la misma condición, acabado e idioma, se suma al stock.</span>
                {error && <p className="alerta alerta--error">{error}</p>}
                {faltan.length > 0 && <span className="texto-error texto-chico">Falta: {faltan.join(', ')}</span>}
                <div className="fila-botones">
                    <button type="submit" className="btn btn--rojo" disabled={guardando || subiendo || faltan.length > 0 || Number(valores.stock) < 1}>{guardando ? 'Guardando…' : 'Agregar al inventario'}</button>
                </div>
            </div>
        </form>
    );
}
