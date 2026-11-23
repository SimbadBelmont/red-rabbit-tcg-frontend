import { CONDICIONES, ESTADOS_SELLADO, PRODUCTOS } from '../../services/inventarioService';

// Campos editables de una carta, compartidos por la vista previa del CSV y el editor de inventario
// Para producto sellado (valores.tipo === 'sellado') muestra estado y tipo de producto en lugar de condición y acabado
export default function CamposCarta({ valores, onCambio, id, conIdioma = false, conAcabado = true }) {
    const sellado = valores.tipo === 'sellado';
    const cambiar = (campo) => (e) => onCambio({ ...valores, [campo]: e.target.value });
    // Cartas guardadas antes de existir "acabado" traen solo foil: true/false
    const acabado = valores.acabado || (valores.foil ? 'foil' : 'normal');

    return (
        <div className="campos-carta">
            <label className="etiqueta etiqueta--chica">Precio (MXN)
                <input className="campo campo--chico" type="number" min="0" step="0.01" inputMode="decimal"
                    value={valores.precio ?? ''} onChange={cambiar('precio')} id={`${id}-precio`} />
            </label>
            {sellado ? (
                <>
                    <label className="etiqueta etiqueta--chica">Producto
                        <select className="campo campo--chico" value={valores.producto || ''} onChange={cambiar('producto')}>
                            <option value="" disabled>Elige…</option>
                            {Object.entries(PRODUCTOS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                    </label>
                    <label className="etiqueta etiqueta--chica">Estado
                        <select className="campo campo--chico" value={valores.condicion || 'SELLADO'} onChange={cambiar('condicion')}>
                            {Object.entries(ESTADOS_SELLADO).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                    </label>
                </>
            ) : (
                <label className="etiqueta etiqueta--chica">Condición
                    <select className="campo campo--chico" value={valores.condicion || 'NM'} onChange={cambiar('condicion')}>
                        {Object.entries(CONDICIONES).map(([v, l]) => <option key={v} value={v}>{v} · {l}</option>)}
                    </select>
                </label>
            )}
            <label className="etiqueta etiqueta--chica">Cantidad
                <input className="campo campo--chico" type="number" min="0" step="1" inputMode="numeric"
                    value={valores.stock ?? ''} onChange={cambiar('stock')} />
            </label>
            {conIdioma && (
                <label className="etiqueta etiqueta--chica">Idioma
                    <select className="campo campo--chico" value={valores.idioma || 'es'} onChange={cambiar('idioma')}>
                        <option value="es">Español</option><option value="en">Inglés</option><option value="ja">Japonés</option>
                        <option value="pt">Portugués</option><option value="fr">Francés</option><option value="de">Alemán</option><option value="it">Italiano</option>
                    </select>
                </label>
            )}
            {/* Acabado: casillas excluyentes (ninguna marcada = normal) */}
            {conAcabado && !sellado && <fieldset className="acabados">
                <legend className="etiqueta--chica">Acabado</legend>
                {[['foil', 'Foil'], ['surge', 'Surge foil'], ['etched', 'Etched']].map(([valor, texto]) => (
                    <label key={valor} className="casilla casilla--campo">
                        <input type="checkbox" checked={acabado === valor}
                            onChange={(e) => onCambio({ ...valores, acabado: e.target.checked ? valor : 'normal' })} />{texto}
                    </label>
                ))}
            </fieldset>}
        </div>
    );
}
