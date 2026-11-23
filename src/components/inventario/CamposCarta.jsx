import { CONDICIONES } from '../../services/inventarioService';

// Campos editables de una carta, compartidos por la vista previa del CSV y el editor de inventario
export default function CamposCarta({ valores, onCambio, id, conIdioma = false }) {
    const cambiar = (campo) => (e) => onCambio({ ...valores, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

    return (
        <div className="campos-carta">
            <label className="etiqueta etiqueta--chica">Precio (MXN)
                <input className="campo campo--chico" type="number" min="0" step="0.01" inputMode="decimal"
                    value={valores.precio ?? ''} onChange={cambiar('precio')} id={`${id}-precio`} />
            </label>
            <label className="etiqueta etiqueta--chica">Condición
                <select className="campo campo--chico" value={valores.condicion || 'NM'} onChange={cambiar('condicion')}>
                    {Object.entries(CONDICIONES).map(([v, l]) => <option key={v} value={v}>{v} · {l}</option>)}
                </select>
            </label>
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
            <label className="casilla casilla--campo"><input type="checkbox" checked={!!valores.foil} onChange={cambiar('foil')} />Foil</label>
        </div>
    );
}
