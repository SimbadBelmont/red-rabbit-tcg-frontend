import { useEffect, useState } from 'react';
import CartaCard from '../components/CartaCard';
import { ACABADOS } from '../utils/acabados';
import { CONDICIONES, JUEGOS, PRODUCTOS, catalogo } from '../services/inventarioService';

const RAREZAS = [['common', 'Común'], ['uncommon', 'Infrecuente'], ['rare', 'Rara'], ['mythic', 'Mítica / Secreta']];
const ORDENES = [['recientes', 'Más recientes'], ['precio_asc', 'Precio: menor a mayor'], ['precio_desc', 'Precio: mayor a menor'], ['nombre', 'Nombre A–Z']];

export default function Catalogo() {
    const [filtros, setFiltros] = useState({ juego: '', q: '', orden: 'recientes', rareza: [], condicion: [], acabado: [], tipo: '', producto: [], pagina: 1 });
    const [busqueda, setBusqueda] = useState('');
    const [datos, setDatos] = useState({ cartas: [], total: 0, paginas: 0 });
    const [error, setError] = useState('');
    // Se considera "cargando" mientras la última respuesta no corresponda a los filtros actuales
    const clave = JSON.stringify(filtros);
    const [cargadoPara, setCargadoPara] = useState(null);
    const cargando = cargadoPara !== clave;

    // Espera a que el usuario deje de escribir antes de buscar
    useEffect(() => {
        const t = setTimeout(() => setFiltros((f) => (f.q === busqueda ? f : { ...f, q: busqueda, pagina: 1 })), 350);
        return () => clearTimeout(t);
    }, [busqueda]);

    useEffect(() => {
        let vigente = true;
        catalogo({ ...filtros, rareza: filtros.rareza.join(','), condicion: filtros.condicion.join(','), acabado: filtros.acabado.join(','), producto: filtros.producto.join(',') })
            .then((d) => { if (vigente) { setDatos(d); setError(''); } })
            .catch((e) => vigente && setError(e.message))
            .finally(() => vigente && setCargadoPara(JSON.stringify(filtros)));
        return () => { vigente = false; };
    }, [filtros]);

    const cambiar = (campo, valor) => setFiltros((f) => ({ ...f, [campo]: valor, pagina: 1 }));
    const alternar = (campo, valor) => setFiltros((f) => ({
        ...f, pagina: 1,
        [campo]: f[campo].includes(valor) ? f[campo].filter((v) => v !== valor) : [...f[campo], valor],
    }));

    return (
        <div className="contenedor pagina">
            <div className="encabezado-pagina">
                <div className="pila-chica">
                    <h1 className="titulo-pagina">Catálogo</h1>
                    <p className="texto-suave texto-grande">Cartas sueltas y producto sellado en existencia. Agrega lo que quieras a tu pedido y lo confirmamos por correo.</p>
                </div>
                <div className="fila-botones">
                    <label className="sr-only" htmlFor="buscar">Buscar carta</label>
                    <input id="buscar" type="search" className="campo" placeholder="Buscar carta…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                    <label className="sr-only" htmlFor="orden">Ordenar</label>
                    <select id="orden" className="campo" value={filtros.orden} onChange={(e) => cambiar('orden', e.target.value)}>
                        {ORDENES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                </div>
            </div>

            <div className="con-lateral">
                <aside className="tarjeta lateral" aria-label="Filtros">
                    <div className="pila-chica">
                        <h2 className="sobretitulo">QUÉ BUSCAS</h2>
                        {[['', 'Todo'], ['carta', 'Cartas sueltas'], ['sellado', 'Producto sellado']].map(([v, l]) => (
                            <button key={v || 'todo'} type="button" aria-pressed={filtros.tipo === v}
                                className={`filtro ${filtros.tipo === v ? 'activo' : ''}`}
                                onClick={() => setFiltros((f) => ({ ...f, tipo: v, producto: [], rareza: [], condicion: [], acabado: [], pagina: 1 }))}>{l}</button>
                        ))}
                    </div>
                    <div className="pila-chica">
                        <h2 className="sobretitulo">JUEGO</h2>
                        {[{ id: '', nombre: 'Todos' }, ...JUEGOS].map((j) => (
                            <button key={j.id} type="button" aria-pressed={filtros.juego === j.id}
                                className={`filtro ${filtros.juego === j.id ? 'activo' : ''}`} onClick={() => cambiar('juego', j.id)}>{j.nombre}</button>
                        ))}
                    </div>
                    {filtros.tipo === 'sellado' ? (
                        <fieldset className="pila-chica">
                            <legend className="sobretitulo">PRODUCTO</legend>
                            {Object.entries(PRODUCTOS).map(([v, l]) => (
                                <label key={v} className="casilla"><input type="checkbox" checked={filtros.producto.includes(v)} onChange={() => alternar('producto', v)} />{l}</label>
                            ))}
                        </fieldset>
                    ) : (
                        <>
                    <fieldset className="pila-chica">
                        <legend className="sobretitulo">RAREZA</legend>
                        {RAREZAS.map(([v, l]) => (
                            <label key={v} className="casilla"><input type="checkbox" checked={filtros.rareza.includes(v)} onChange={() => alternar('rareza', v)} />{l}</label>
                        ))}
                    </fieldset>
                    <fieldset className="pila-chica">
                        <legend className="sobretitulo">CONDICIÓN</legend>
                        {Object.entries(CONDICIONES).map(([v, l]) => (
                            <label key={v} className="casilla"><input type="checkbox" checked={filtros.condicion.includes(v)} onChange={() => alternar('condicion', v)} />{v} · {l}</label>
                        ))}
                    </fieldset>
                    <fieldset className="pila-chica">
                        <legend className="sobretitulo">ACABADO</legend>
                        {Object.entries(ACABADOS).map(([v, l]) => (
                            <label key={v} className="casilla"><input type="checkbox" checked={filtros.acabado.includes(v)} onChange={() => alternar('acabado', v)} />{l}</label>
                        ))}
                    </fieldset>
                        </>
                    )}
                </aside>

                <div className="contenido pila">
                    {error && <p className="alerta alerta--error">{error}</p>}
                    <span className="texto-suave texto-chico" aria-live="polite">{cargando ? 'Cargando…' : `${datos.total} cartas encontradas`}</span>
                    <div className="rejilla rejilla--210">
                        {datos.cartas.map((c) => <CartaCard key={c.clave || c._id} carta={c} />)}
                    </div>
                    {!cargando && datos.cartas.length === 0 && !error && <p className="texto-suave">No hay cartas con esos filtros.</p>}
                    {datos.paginas > 1 && (
                        <nav aria-label="Páginas" className="fila-botones paginacion">
                            <button type="button" className="btn btn--contorno" disabled={filtros.pagina <= 1} onClick={() => setFiltros((f) => ({ ...f, pagina: f.pagina - 1 }))}>Anterior</button>
                            <span className="texto-suave">Página {filtros.pagina} de {datos.paginas}</span>
                            <button type="button" className="btn btn--contorno" disabled={filtros.pagina >= datos.paginas} onClick={() => setFiltros((f) => ({ ...f, pagina: f.pagina + 1 }))}>Siguiente</button>
                        </nav>
                    )}
                </div>
            </div>
        </div>
    );
}
