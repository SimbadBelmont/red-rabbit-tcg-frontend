import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { actualizarUsuario, crearUsuario, listarUsuarios, verUsuario } from '../services/usuarioService';
import { ROLES, nombreRol } from '../utils/roles';
import { mxn } from '../utils/formato';

const VACIO = { nombre: '', email: '', telefono: '', rol: 'cliente', password: '', activo: true };
const DESCRIPCION_ROL = {
    cliente: 'Compra en la página, reserva eventos y usa su wishlist.',
    staff: 'Empleado: inventario, punto de venta, pedidos y eventos.',
    encargado: 'Todo lo del empleado y además el resumen de ventas por empleado.',
    admin: 'Acceso total, incluida la gestión de usuarios.',
};

// Solo administrador: ver, buscar, crear y editar cuentas
export default function Usuarios() {
    const { user } = useAuth();
    const [filtros, setFiltros] = useState({ q: '', rol: '', estado: '', pagina: 1 });
    const [busqueda, setBusqueda] = useState('');
    const [datos, setDatos] = useState({ usuarios: [], total: 0, paginas: 0, porRol: {} });
    const [recarga, setRecarga] = useState(0);
    const [panel, setPanel] = useState(null);       // { modo: 'crear' | 'editar' | 'ver', usuario, form }
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    useEffect(() => {
        const t = setTimeout(() => setFiltros((f) => (f.q === busqueda ? f : { ...f, q: busqueda, pagina: 1 })), 350);
        return () => clearTimeout(t);
    }, [busqueda]);

    useEffect(() => {
        let vigente = true;
        listarUsuarios(filtros).then((d) => vigente && setDatos(d)).catch((e) => vigente && setMensaje({ tipo: 'error', texto: e.message }));
        return () => { vigente = false; };
    }, [filtros, recarga]);

    const cambiar = (campo, valor) => setFiltros((f) => ({ ...f, [campo]: valor, pagina: 1 }));

    const abrirCrear = () => { setMensaje(null); setPanel({ modo: 'crear', form: { ...VACIO } }); };
    const abrirEditar = (u) => { setMensaje(null); setPanel({ modo: 'editar', usuario: u, form: { ...VACIO, ...u, telefono: u.telefono || '', password: '' } }); };
    const abrirVer = async (u) => {
        setMensaje(null);
        setPanel({ modo: 'ver', usuario: u, cargando: true });
        try { setPanel({ modo: 'ver', usuario: await verUsuario(u.id) }); } catch (e) { setMensaje({ tipo: 'error', texto: e.message }); setPanel(null); }
    };
    const setForm = (cambios) => setPanel((p) => ({ ...p, form: { ...p.form, ...cambios } }));

    const guardar = async (e) => {
        e.preventDefault();
        setGuardando(true); setMensaje(null);
        const { nombre, email, telefono, rol, password, activo } = panel.form;
        try {
            if (panel.modo === 'crear') {
                const nuevo = await crearUsuario({ nombre, email, telefono, rol, password });
                setMensaje({ tipo: 'ok', texto: `Cuenta creada para ${nuevo.nombre} (${nombreRol(nuevo.rol)}).` });
            } else {
                const datosEditar = { nombre, email, telefono, rol, activo, ...(password && { password }) };
                const editado = await actualizarUsuario(panel.usuario.id, datosEditar);
                setMensaje({ tipo: 'ok', texto: `Cambios guardados para ${editado.nombre}.` });
            }
            setPanel(null);
            setRecarga((n) => n + 1);
        } catch (err) {
            setMensaje({ tipo: 'error', texto: err.message });
        } finally { setGuardando(false); }
    };

    const esYo = panel?.usuario?.id === user.id;

    return (
        <div className="contenedor pagina">
            <div className="encabezado-pagina">
                <div className="pila-chica">
                    <h1 className="titulo-pagina">Usuarios</h1>
                    <p className="texto-suave texto-grande">Crea cuentas para tu equipo, cambia roles y revisa a tus clientes.</p>
                </div>
                <button type="button" className="btn btn--rojo" onClick={abrirCrear}>Nuevo usuario</button>
            </div>

            <div className="contadores-rol">
                {Object.entries(ROLES).map(([id, nombre]) => (
                    <button key={id} type="button" aria-pressed={filtros.rol === id} className={`chip ${filtros.rol === id ? 'activo' : ''}`}
                        onClick={() => cambiar('rol', filtros.rol === id ? '' : id)}>
                        {nombre} · {datos.porRol?.[id] || 0}
                    </button>
                ))}
            </div>

            {mensaje && <p className={`alerta ${mensaje.tipo === 'ok' ? 'alerta--ok' : 'alerta--error'}`} role="status">{mensaje.texto}</p>}

            {panel && panel.modo !== 'ver' && (
                <form className="tarjeta tarjeta--rosa pila" onSubmit={guardar} aria-labelledby="panel-t">
                    <div className="encabezado-seccion">
                        <h2 id="panel-t" className="titulo-tarjeta">{panel.modo === 'crear' ? 'Nuevo usuario' : `Editar a ${panel.usuario.nombre}`}</h2>
                        <button type="button" className="btn-texto" onClick={() => setPanel(null)}>Cerrar</button>
                    </div>
                    <div className="rejilla-formulario">
                        <label className="etiqueta">Nombre<input className="campo" required maxLength={60} value={panel.form.nombre} onChange={(e) => setForm({ nombre: e.target.value })} /></label>
                        <label className="etiqueta">Correo<input className="campo" type="email" required value={panel.form.email} onChange={(e) => setForm({ email: e.target.value })} /></label>
                        <label className="etiqueta">Teléfono<input className="campo" type="tel" value={panel.form.telefono} onChange={(e) => setForm({ telefono: e.target.value })} /></label>
                        <label className="etiqueta">Rol
                            <select className="campo" value={panel.form.rol} disabled={esYo} onChange={(e) => setForm({ rol: e.target.value })}>
                                {Object.entries(ROLES).map(([id, nombre]) => <option key={id} value={id}>{nombre}</option>)}
                            </select>
                        </label>
                        <label className="etiqueta">{panel.modo === 'crear' ? 'Contraseña (mínimo 8)' : 'Nueva contraseña (opcional)'}
                            <input className="campo" type="password" autoComplete="new-password" minLength={8} required={panel.modo === 'crear'}
                                value={panel.form.password} onChange={(e) => setForm({ password: e.target.value })} />
                        </label>
                        {panel.modo === 'editar' && (
                            <label className="casilla casilla--campo">
                                <input type="checkbox" checked={panel.form.activo} disabled={esYo} onChange={(e) => setForm({ activo: e.target.checked })} />
                                Cuenta activa (si la desactivas, no puede entrar)
                            </label>
                        )}
                    </div>
                    <p className="texto-suave texto-chico">{DESCRIPCION_ROL[panel.form.rol]}{esYo ? ' · No puedes cambiar tu propio rol ni desactivar tu cuenta.' : ''}</p>
                    <div className="fila-botones">
                        <button type="submit" className="btn btn--rojo" disabled={guardando}>{guardando ? 'Guardando…' : panel.modo === 'crear' ? 'Crear cuenta' : 'Guardar cambios'}</button>
                        <button type="button" className="btn btn--contorno" onClick={() => setPanel(null)}>Cancelar</button>
                    </div>
                </form>
            )}

            {panel?.modo === 'ver' && (
                <section className="tarjeta pila" aria-labelledby="ver-t">
                    <div className="encabezado-seccion">
                        <h2 id="ver-t" className="titulo-tarjeta">{panel.usuario.nombre}</h2>
                        <span className="fila-botones">
                            <button type="button" className="btn btn--contorno btn--chico" onClick={() => abrirEditar(panel.usuario)}>Editar</button>
                            <button type="button" className="btn-texto" onClick={() => setPanel(null)}>Cerrar</button>
                        </span>
                    </div>
                    {panel.cargando ? <p className="texto-suave">Cargando…</p> : (
                        <>
                            <div className="rejilla rejilla--220">
                                <div className="pila-chica"><span className="sobretitulo">CORREO</span><span>{panel.usuario.email}</span></div>
                                <div className="pila-chica"><span className="sobretitulo">TELÉFONO</span><span>{panel.usuario.telefono || '—'}</span></div>
                                <div className="pila-chica"><span className="sobretitulo">ROL</span><span>{nombreRol(panel.usuario.rol)}</span></div>
                                <div className="pila-chica"><span className="sobretitulo">ESTADO</span><span>{panel.usuario.activo ? 'Activa' : 'Desactivada'}</span></div>
                                <div className="pila-chica"><span className="sobretitulo">ALTA</span><span>{new Date(panel.usuario.createdAt).toLocaleDateString('es-MX')}</span></div>
                                <div className="pila-chica"><span className="sobretitulo">WIZARDS ACCOUNT</span><span>{panel.usuario.wizardsId || '—'}</span></div>
                            </div>
                            <div className="pila-chica">
                                <span className="sobretitulo">ÚLTIMOS PEDIDOS</span>
                                {panel.usuario.pedidos?.length ? panel.usuario.pedidos.map((p) => (
                                    <span key={p._id} className="total-fila texto-chico">
                                        <span>{p.folio} · {new Date(p.createdAt).toLocaleDateString('es-MX')} · <span className="capitalizar">{p.estado}</span></span>
                                        <strong>{mxn(p.total)}</strong>
                                    </span>
                                )) : <span className="texto-suave texto-chico">Sin pedidos.</span>}
                            </div>
                        </>
                    )}
                </section>
            )}

            <div className="fila-botones">
                <label className="sr-only" htmlFor="u-buscar">Buscar usuario</label>
                <input id="u-buscar" type="search" className="campo campo--ancho" placeholder="Buscar por nombre, correo o teléfono…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                <label className="sr-only" htmlFor="u-estado">Estado</label>
                <select id="u-estado" className="campo" value={filtros.estado} onChange={(e) => cambiar('estado', e.target.value)}>
                    <option value="">Todas las cuentas</option><option value="activos">Activas</option><option value="inactivos">Desactivadas</option>
                </select>
            </div>

            <span className="texto-suave texto-chico" aria-live="polite">{datos.total} usuarios</span>
            <div className="tabla-caja">
                <table className="tabla tabla--editable">
                    <thead><tr><th>Nombre</th><th>Teléfono</th><th>Rol</th><th>Estado</th><th>Alta</th><th><span className="sr-only">Acciones</span></th></tr></thead>
                    <tbody>
                        {datos.usuarios.map((u) => (
                            <tr key={u.id}>
                                <td><div className="pila-chica"><strong>{u.nombre}{u.id === user.id ? ' (tú)' : ''}</strong><span className="texto-suave texto-chico">{u.email}</span></div></td>
                                <td>{u.telefono || '—'}</td>
                                <td><span className={`pastilla ${u.rol === 'cliente' ? 'pastilla--gris' : 'pastilla--roja'}`}>{nombreRol(u.rol)}</span></td>
                                <td>{u.activo ? 'Activa' : <span className="texto-error">Desactivada</span>}</td>
                                <td>{new Date(u.createdAt).toLocaleDateString('es-MX')}</td>
                                <td>
                                    <div className="fila-botones fila-botones--fin">
                                        <button type="button" className="btn-texto" onClick={() => abrirVer(u)}>Ver</button>
                                        <button type="button" className="btn btn--contorno btn--chico" onClick={() => abrirEditar(u)}>Editar</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {datos.usuarios.length === 0 && <p className="texto-suave">No hay usuarios con esos filtros.</p>}

            {datos.paginas > 1 && (
                <nav aria-label="Páginas de usuarios" className="fila-botones paginacion">
                    <button type="button" className="btn btn--contorno btn--chico" disabled={filtros.pagina <= 1} onClick={() => setFiltros((f) => ({ ...f, pagina: f.pagina - 1 }))}>Anterior</button>
                    <span className="texto-suave">Página {filtros.pagina} de {datos.paginas}</span>
                    <button type="button" className="btn btn--contorno btn--chico" disabled={filtros.pagina >= datos.paginas} onClick={() => setFiltros((f) => ({ ...f, pagina: f.pagina + 1 }))}>Siguiente</button>
                </nav>
            )}
        </div>
    );
}
