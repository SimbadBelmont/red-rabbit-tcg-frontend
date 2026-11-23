import { api } from './api';

export const crearPedido = (datos) => api('/pedidos', { method: 'POST', body: datos });
export const misPedidos = () => api('/pedidos/mios');
export const ventaPos = (datos) => api('/pedidos/pos', { method: 'POST', body: datos });

// Cliente: cambiar su pedido mientras siga pendiente
export const quitarArticulo = (pedidoId, cartaId) => api(`/pedidos/${pedidoId}/items/${cartaId}`, { method: 'DELETE' });
export const cancelarPedido = (pedidoId) => api(`/pedidos/${pedidoId}/cancelar`, { method: 'PATCH' });

// Staff: panel de pedidos
const consulta = (f) => new URLSearchParams(Object.entries(f).filter(([, v]) => v !== '' && v != null));
export const listarPedidos = (filtros = {}) => api(`/pedidos?${consulta(filtros)}`);
export const resumenPedidos = () => api('/pedidos/resumen');
export const cambiarEstadoPedido = (id, estado) => api(`/pedidos/${id}/estado`, { method: 'PATCH', body: { estado } });
export const extenderApartado = (id, dias) => api(`/pedidos/${id}/extender`, { method: 'PATCH', body: { dias } });
