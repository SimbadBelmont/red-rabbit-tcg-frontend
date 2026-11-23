import { api, urlApi } from './api';

export const JUEGOS = [
    { id: 'magic', nombre: 'Magic: The Gathering', corto: 'Magic' },
    { id: 'pokemon', nombre: 'Pokémon TCG', corto: 'Pokémon' },
    { id: 'onepiece', nombre: 'One Piece TCG', corto: 'One Piece' },
    { id: 'yugioh', nombre: 'Yu-Gi-Oh!', corto: 'Yu-Gi-Oh!' },
    { id: 'lorcana', nombre: 'Disney Lorcana', corto: 'Lorcana' },
    { id: 'otro', nombre: 'Accesorios y otros', corto: 'Otros' },
];
export const nombreJuego = (id) => JUEGOS.find((j) => j.id === id)?.corto || id;

export const CONDICIONES = { NM: 'Near Mint', LP: 'Lightly Played', MP: 'Moderately Played', HP: 'Heavily Played', DMG: 'Damaged' };
// Producto sellado: estado en lugar de condición
export const ESTADOS_SELLADO = { SELLADO: 'Sellado', DANADO: 'Empaque dañado', ABIERTO: 'Abierto' };
export const PRODUCTOS = {
    sobre: 'Sobre',
    caja: 'Caja de sobres',
    collector: 'Collector booster',
    bundle: 'Bundle / Fat pack',
    mazo: 'Mazo preconstruido',
    kit: 'Kit de prerelease',
    display: 'Display / Case',
    accesorio: 'Accesorio',
    otro: 'Otro producto',
};
// Texto corto de la condición o estado: "NM", "Sellado", "Empaque dañado"
export const etiquetaCondicion = (c) => ESTADOS_SELLADO[c] || c;
// Texto largo: "Near Mint", "Sellado"
export const nombreCondicion = (c) => CONDICIONES[c] || ESTADOS_SELLADO[c] || c;

export const catalogo = (filtros = {}) => {
    const params = new URLSearchParams(Object.entries(filtros).filter(([, v]) => v !== '' && v != null));
    return api(`/inventario/catalogo?${params}`);
};
// Una carta con todas sus condiciones (página propia)
export const verCarta = (id) => api(`/inventario/${id}`);
// Enlace con vista previa (imagen y precio) para WhatsApp/Facebook
export const urlCompartir = (id) => `${window.location.origin}/api/compartir/${id}`;
export const recientes = (cantidad = 8) => api(`/inventario/recientes?cantidad=${cantidad}`);

// --- Staff ---
// Editor de inventario: búsqueda y filtros (estado: activas | agotadas | baja)
export const listarInventario = (filtros = {}) => {
    const params = new URLSearchParams(Object.entries(filtros).filter(([, v]) => v !== '' && v != null));
    return api(`/inventario?${params}`);
};
export const actualizarCarta = (id, datos) => api(`/inventario/${id}`, { method: 'PUT', body: datos });
export const eliminarCarta = (id) => api(`/inventario/${id}`, { method: 'DELETE' });
// Alta manual: si ya existe la misma variante, el backend suma el stock
export const crearCarta = (datos) => api('/inventario', { method: 'POST', body: datos });
// Búsqueda en Scryfall (pasa por el backend, que respeta su límite de 2 consultas por segundo)
export const scryfallAutocompletar = (q) => api(`/inventario/scryfall/autocompletar?q=${encodeURIComponent(q)}`);
export const scryfallExpansiones = (q) => api(`/inventario/scryfall/expansiones?q=${encodeURIComponent(q)}`);
export const scryfallImpresiones = (nombre) => api(`/inventario/scryfall/impresiones?nombre=${encodeURIComponent(nombre)}`);
// Foto de carta (ya reducida en el navegador); devuelve { url }
export const subirImagen = (archivo) => {
    const fd = new FormData();
    fd.append('imagen', archivo, archivo.name || 'foto.jpg');
    return api('/inventario/imagenes', { method: 'POST', body: fd });
};
// Actualizar precios de Magic con el mercado (vista previa y aplicar)
export const previsualizarPrecios = () => api('/inventario/precios/previsualizar', { method: 'POST' });
export const aplicarPrecios = (cambios) => api('/inventario/precios/aplicar', { method: 'POST', body: { cambios } });
// Guarda las filas de la vista previa ya corregidas
export const importarLote = (cartas, modo, archivo, proveedor) => api('/inventario/lote', { method: 'POST', body: { cartas, modo, archivo, proveedor } });

const formCsv = (archivo, extra = {}) => {
    const fd = new FormData();
    fd.append('archivo', archivo);
    Object.entries(extra).forEach(([k, v]) => fd.append(k, v));
    return fd;
};
export const previsualizarCsv = (archivo) => api('/inventario/csv/previsualizar', { method: 'POST', body: formCsv(archivo) });
export const importarCsv = (archivo, modo) => api('/inventario/csv/importar', { method: 'POST', body: formCsv(archivo, { modo }) });

// La plantilla requiere token, así que se descarga con fetch y se guarda como archivo
export const descargarPlantilla = async () => {
    const res = await fetch(urlApi('/inventario/csv/plantilla'), { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    if (!res.ok) throw new Error('No se pudo descargar la plantilla');
    const url = URL.createObjectURL(await res.blob());
    const a = Object.assign(document.createElement('a'), { href: url, download: 'plantilla-inventario.csv' });
    a.click();
    URL.revokeObjectURL(url);
};
