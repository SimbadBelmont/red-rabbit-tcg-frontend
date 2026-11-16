import { api } from './api';

export const TIPOS = ['Torneo', 'Prerelease', 'Liga', 'Casual'];
export const WIZARDS_LOCATOR = 'https://locator.wizards.com';

export const proximos = (tipo) => api(`/eventos${tipo ? `?tipo=${encodeURIComponent(tipo)}` : ''}`);
export const misEventos = () => api('/eventos/mios');
export const reservar = (id) => api(`/eventos/${id}/reservar`, { method: 'POST' });
export const cancelarReserva = (id) => api(`/eventos/${id}/reservar`, { method: 'DELETE' });
