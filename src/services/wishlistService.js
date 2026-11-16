import { api } from './api';

export const listar = () => api('/wishlist');
export const agregar = (carta, precioObjetivo) => api('/wishlist', { method: 'POST', body: { carta, precioObjetivo } });
export const quitar = (id) => api(`/wishlist/${id}`, { method: 'DELETE' });
