import { api } from './api';

export const crearPedido = (datos) => api('/pedidos', { method: 'POST', body: datos });
export const misPedidos = () => api('/pedidos/mios');
export const ventaPos = (datos) => api('/pedidos/pos', { method: 'POST', body: datos });

// Cliente: cambiar su pedido mientras siga pendiente
export const quitarArticulo = (pedidoId, cartaId) => api(`/pedidos/${pedidoId}/items/${cartaId}`, { method: 'DELETE' });
export const cancelarPedido = (pedidoId) => api(`/pedidos/${pedidoId}/cancelar`, { method: 'PATCH' });
