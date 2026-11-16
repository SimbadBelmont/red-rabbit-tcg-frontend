import { api } from './api';

export const crearPedido = (datos) => api('/pedidos', { method: 'POST', body: datos });
export const misPedidos = () => api('/pedidos/mios');
export const ventaPos = (datos) => api('/pedidos/pos', { method: 'POST', body: datos });
