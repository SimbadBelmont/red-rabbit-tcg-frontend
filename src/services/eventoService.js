import { api } from './api';

export const TIPOS = ['Torneo', 'Prerelease', 'Liga', 'Casual'];
export const WIZARDS_LOCATOR = 'https://locator.wizards.com';

export const proximos = (tipo) => api(`/eventos${tipo ? `?tipo=${encodeURIComponent(tipo)}` : ''}`);
export const misEventos = () => api('/eventos/mios');
export const reservar = (id) => api(`/eventos/${id}/reservar`, { method: 'POST' });
export const cancelarReserva = (id) => api(`/eventos/${id}/reservar`, { method: 'DELETE' });

// Staff: gestión de eventos
export const gestionEventos = (cuando = 'proximos') => api(`/eventos/gestion?cuando=${cuando}`);
export const crearEvento = (datos) => api('/eventos', { method: 'POST', body: datos });
export const actualizarEvento = (id, datos) => api(`/eventos/${id}`, { method: 'PUT', body: datos });
export const eliminarEvento = (id) => api(`/eventos/${id}`, { method: 'DELETE' });
export const inscritosEvento = (id) => api(`/eventos/${id}/inscritos`);
