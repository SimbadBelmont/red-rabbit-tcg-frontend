import { CONDICIONES } from '../../services/inventarioService';

// Mismas reglas que valida el backend (services/csvService.js → validarCarta)
export function problemasDe(c) {
    const problemas = [];
    if (!c.nombre || !String(c.nombre).trim()) problemas.push('falta nombre');
    if (!CONDICIONES[c.condicion]) problemas.push('condición no válida');
    if (c.acabado && !['normal', 'foil', 'surge', 'etched'].includes(c.acabado)) problemas.push('acabado no válido');
    const precio = c.precio === '' || c.precio == null ? NaN : Number(c.precio);
    if (!Number.isFinite(precio) || precio < 0) problemas.push('sin precio');
    const stock = Number(c.stock);
    if (!Number.isInteger(stock) || stock < 0) problemas.push('cantidad inválida');
    return problemas;
}

// Convierte los valores de los campos (texto) a números antes de guardar
export const limpiar = (c) => ({ ...c, precio: Number(c.precio), stock: Number(c.stock) });
