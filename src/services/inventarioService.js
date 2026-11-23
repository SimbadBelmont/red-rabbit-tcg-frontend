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

export const catalogo = (filtros = {}) => {
    const params = new URLSearchParams(Object.entries(filtros).filter(([, v]) => v !== '' && v != null));
    return api(`/inventario/catalogo?${params}`);
};
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
export const scryfallImpresiones = (nombre) => api(`/inventario/scryfall/impresiones?nombre=${encodeURIComponent(nombre)}`);
// Foto de carta (ya reducida en el navegador); devuelve { url }
export const subirImagen = (archivo) => {
    const fd = new FormData();
    fd.append('imagen', archivo, archivo.name || 'foto.jpg');
    return api('/inventario/imagenes', { method: 'POST', body: fd });
};
// Guarda las filas de la vista previa ya corregidas
export const importarLote = (cartas, modo, archivo) => api('/inventario/lote', { method: 'POST', body: { cartas, modo, archivo } });

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
