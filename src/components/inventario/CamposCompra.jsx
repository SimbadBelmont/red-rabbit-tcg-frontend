// Datos de compra opcionales (para costo y ganancia en los reportes)
export default function CamposCompra({ valores, onCambio }) {
    return (
        <details className="compra" open={Boolean(valores.costo || valores.proveedor)}>
            <summary className="texto-chico">Datos de compra (opcional): costo y a quién se le compró</summary>
            <div className="campos-carta">
                <label className="etiqueta etiqueta--chica">Costo unitario (MXN)
                    <input className="campo campo--chico" type="number" min="0" step="0.01" inputMode="decimal" value={valores.costo ?? ''}
                        onChange={(e) => onCambio({ ...valores, costo: e.target.value })} />
                </label>
                <label className="etiqueta etiqueta--chica">Comprada a
                    <input className="campo campo--chico" maxLength={80} placeholder="Ej. Colección de Juan" value={valores.proveedor ?? ''}
                        onChange={(e) => onCambio({ ...valores, proveedor: e.target.value })} />
                </label>
            </div>
        </details>
    );
}
