import { useEffect, useState } from 'react';
import { TIPOS, WIZARDS_LOCATOR, actualizarEvento, crearEvento, eliminarEvento, gestionEventos, inscritosEvento } from '../services/eventoService';
import { JUEGOS } from '../services/inventarioService';
import { fechaLarga, hora, mxn } from '../utils/formato';

// datetime-local necesita "AAAA-MM-DDTHH:MM" en hora local
const aCampoFecha = (f) => {
    const d = new Date(f);
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
const VACIO = { titulo: '', juego: 'Magic: The Gathering', tipo: 'Torneo', formato: '', descripcion: '', fecha: '', lugar: 'Mesa central', cupo: 16, cuota: 0, wotcUrl: '', publicado: true };

// Staff: crear, editar, ocultar y borrar eventos; ver inscritos
export default function GestionEventos() {
    const [cuando, setCuando] = useState('proximos');
    const [eventos, setEventos] = useState([]);
    const [recarga, setRecarga] = useState(0);
    const [form, setForm] = useState(null);           // { id?, ...campos }
    const [inscritos, setInscritos] = useState(null);  // { evento, lista }
    const [confirmarBorrar, setConfirmarBorrar] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    useEffect(() => {
        let vigente = true;
        gestionEventos(cuando).then((l) => vigente && setEventos(l)).catch((e) => vigente && setMensaje({ tipo: 'error', texto: e.message }));
        return () => { vigente = false; };
    }, [cuando, recarga]);

    const campo = (k) => ({ value: form[k] ?? '', onChange: (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }) });

    const abrirNuevo = () => { setMensaje(null); setInscritos(null); setForm({ ...VACIO }); };
    const abrirEditar = (ev) => { setMensaje(null); setInscritos(null); setForm({ ...VACIO, ...ev, id: ev._id, fecha: aCampoFecha(ev.fecha), wotcUrl: ev.wotcUrl || '' }); };
    // Duplicar: mismo evento, una semana después (ideal para torneos semanales)
    const duplicar = (ev) => {
        const siguiente = new Date(ev.fecha);
        siguiente.setDate(siguiente.getDate() + 7);
        setMensaje(null); setInscritos(null);
        setForm({ ...VACIO, ...ev, id: undefined, _id: undefined, fecha: aCampoFecha(siguiente), wotcUrl: '' });
    };

    const guardar = async (e) => {
        e.preventDefault();
        setGuardando(true); setMensaje(null);
        // eslint-disable-next-line no-unused-vars
        const { id, _id, inscritosTotal, disponibles, createdAt, updatedAt, __v, ...datos } = form;
        const cuerpo = { ...datos, fecha: new Date(form.fecha).toISOString(), cupo: Number(form.cupo), cuota: Number(form.cuota) || 0 };
        try {
            if (id) await actualizarEvento(id, cuerpo); else await crearEvento(cuerpo);
            setMensaje({ tipo: 'ok', texto: id ? 'Evento actualizado.' : 'Evento creado. Ya aparece en el tablón de eventos.' });
            setForm(null);
            setRecarga((n) => n + 1);
        } catch (err) { setMensaje({ tipo: 'error', texto: err.message }); } finally { setGuardando(false); }
    };

    const borrar = async (ev) => {
        try {
            await eliminarEvento(ev._id);
            setConfirmarBorrar(null);
            setMensaje({ tipo: 'ok', texto: `${ev.titulo} se eliminó.` });
            setRecarga((n) => n + 1);
        } catch (e) { setMensaje({ tipo: 'error', texto: e.message }); }
    };

    const verInscritos = async (ev) => {
        setForm(null);
        try { setInscritos({ evento: ev, lista: await inscritosEvento(ev._id) }); } catch (e) { setMensaje({ tipo: 'error', texto: e.message }); }
    };

    const alternarPublicado = async (ev) => {
        try { await actualizarEvento(ev._id, { publicado: !ev.publicado }); setRecarga((n) => n + 1); } catch (e) { setMensaje({ tipo: 'error', texto: e.message }); }
    };

    return (
        <div className="contenedor pagina">
            <div className="encabezado-pagina">
                <div className="pila-chica">
                    <h1 className="titulo-pagina">Gestionar eventos</h1>
                    <p className="texto-suave texto-grande">Crea torneos, prereleases y ligas. Los publicados aparecen en el tablón de eventos.</p>
                </div>
                <button type="button" className="btn btn--rojo" onClick={abrirNuevo}>Nuevo evento</button>
            </div>

            {mensaje && <p className={`alerta ${mensaje.tipo === 'ok' ? 'alerta--ok' : 'alerta--error'}`} role="status">{mensaje.texto}</p>}

            {form && (
                <form className="tarjeta tarjeta--rosa pila" onSubmit={guardar} aria-labelledby="ev-form-t">
                    <div className="encabezado-seccion">
                        <h2 id="ev-form-t" className="titulo-tarjeta">{form.id ? 'Editar evento' : 'Nuevo evento'}</h2>
                        <button type="button" className="btn-texto" onClick={() => setForm(null)}>Cerrar</button>
                    </div>
                    <div className="rejilla-formulario">
                        <label className="etiqueta">Título<input className="campo" required maxLength={80} placeholder="Ej. Friday Night Magic - Modern" {...campo('titulo')} /></label>
                        <label className="etiqueta">Juego
                            <select className="campo" {...campo('juego')}>
                                {JUEGOS.map((j) => <option key={j.id} value={j.nombre}>{j.nombre}</option>)}
                            </select>
                        </label>
                        <label className="etiqueta">Tipo
                            <select className="campo" {...campo('tipo')}>{TIPOS.map((t) => <option key={t}>{t}</option>)}</select>
                        </label>
                        <label className="etiqueta">Formato<input className="campo" placeholder="Ej. Modern, Commander, Sellado" {...campo('formato')} /></label>
                        <label className="etiqueta">Fecha y hora<input className="campo" type="datetime-local" required {...campo('fecha')} /></label>
                        <label className="etiqueta">Lugar<input className="campo" {...campo('lugar')} /></label>
                        <label className="etiqueta">Cupo<input className="campo" type="number" min={Math.max(1, form.inscritosTotal || 0)} required {...campo('cupo')} /></label>
                        <label className="etiqueta">Cuota (MXN, 0 = gratis)<input className="campo" type="number" min="0" step="1" {...campo('cuota')} /></label>
                    </div>
                    <label className="etiqueta">Descripción<textarea className="campo" rows="3" placeholder="Premios, qué traer, reglas…" {...campo('descripcion')} /></label>
                    <label className="etiqueta">Enlace en Wizards Event Locator (opcional)
                        <input className="campo" type="url" placeholder="https://locator.wizards.com/…" {...campo('wotcUrl')} />
                    </label>
                    <span className="texto-suave texto-chico">Para eventos de Magic: publícalo en el <a href={WIZARDS_LOCATOR} target="_blank" rel="noreferrer">Wizards Event Locator</a> y pega aquí su enlace.</span>
                    <label className="casilla"><input type="checkbox" checked={!!form.publicado} onChange={(e) => setForm({ ...form, publicado: e.target.checked })} />Publicado (visible en el tablón)</label>
                    <div className="fila-botones">
                        <button type="submit" className="btn btn--rojo" disabled={guardando}>{guardando ? 'Guardando…' : form.id ? 'Guardar cambios' : 'Crear evento'}</button>
                        <button type="button" className="btn btn--contorno" onClick={() => setForm(null)}>Cancelar</button>
                    </div>
                </form>
            )}

            {inscritos && (
                <section className="tarjeta pila" aria-labelledby="ins-t">
                    <div className="encabezado-seccion">
                        <h2 id="ins-t" className="titulo-tarjeta">Inscritos · {inscritos.evento.titulo} ({inscritos.lista.length}/{inscritos.evento.cupo})</h2>
                        <button type="button" className="btn-texto" onClick={() => setInscritos(null)}>Cerrar</button>
                    </div>
                    {inscritos.lista.length === 0 ? <p className="texto-suave">Nadie se ha inscrito todavía.</p> : (
                        <div className="tabla-caja">
                            <table className="tabla">
                                <thead><tr><th>#</th><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Wizards Account</th></tr></thead>
                                <tbody>{inscritos.lista.map((u, i) => <tr key={u._id}><td>{i + 1}</td><td>{u.nombre}</td><td>{u.email}</td><td>{u.telefono || '—'}</td><td>{u.wizardsId || '—'}</td></tr>)}</tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

            <div role="tablist" aria-label="Cuándo" className="pestanas">
                {[['proximos', 'Próximos'], ['pasados', 'Pasados']].map(([id, l]) => (
                    <button key={id} type="button" role="tab" aria-selected={cuando === id} className={`pestana ${cuando === id ? 'activo' : ''}`} onClick={() => setCuando(id)}>{l}</button>
                ))}
            </div>

            <div className="tabla-caja">
                <table className="tabla tabla--editable">
                    <thead><tr><th>Evento</th><th>Fecha</th><th>Inscritos</th><th>Cuota</th><th>Estado</th><th><span className="sr-only">Acciones</span></th></tr></thead>
                    <tbody>
                        {eventos.map((ev) => (
                            <tr key={ev._id}>
                                <td><div className="pila-chica"><strong>{ev.titulo}</strong><span className="texto-suave texto-chico">{ev.tipo} · {ev.juego}{ev.formato ? ` · ${ev.formato}` : ''}</span></div></td>
                                <td className="capitalizar">{fechaLarga(ev.fecha)} · {hora(ev.fecha)}</td>
                                <td><button type="button" className="btn-texto" onClick={() => verInscritos(ev)}>{ev.inscritosTotal}/{ev.cupo}</button></td>
                                <td>{ev.cuota ? mxn(ev.cuota) : 'Gratis'}</td>
                                <td><button type="button" className={`pastilla ${ev.publicado ? 'pastilla--roja' : 'pastilla--gris'} pastilla--boton`} title="Cambiar" onClick={() => alternarPublicado(ev)}>{ev.publicado ? 'Publicado' : 'Oculto'}</button></td>
                                <td>
                                    {confirmarBorrar === ev._id ? (
                                        <div className="fila-botones fila-botones--fin">
                                            <span className="texto-chico">¿Eliminar{ev.inscritosTotal ? ` (${ev.inscritosTotal} inscritos)` : ''}?</span>
                                            <button type="button" className="btn btn--rojo btn--chico" onClick={() => borrar(ev)}>Sí</button>
                                            <button type="button" className="btn-texto" onClick={() => setConfirmarBorrar(null)}>No</button>
                                        </div>
                                    ) : (
                                        <div className="fila-botones fila-botones--fin">
                                            <button type="button" className="btn btn--contorno btn--chico" onClick={() => abrirEditar(ev)}>Editar</button>
                                            <button type="button" className="btn-texto" onClick={() => duplicar(ev)}>Repetir +7 días</button>
                                            <button type="button" className="btn-texto" onClick={() => setConfirmarBorrar(ev._id)}>Eliminar</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {eventos.length === 0 && <p className="texto-suave">{cuando === 'proximos' ? 'No hay eventos próximos. Crea uno con "Nuevo evento".' : 'No hay eventos pasados.'}</p>}
        </div>
    );
}
