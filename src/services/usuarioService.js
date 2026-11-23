import { api } from './api';

const consulta = (filtros) => new URLSearchParams(Object.entries(filtros).filter(([, v]) => v !== '' && v != null));

// Solo administrador
export const listarUsuarios = (filtros = {}) => api(`/usuarios?${consulta(filtros)}`);
export const verUsuario = (id) => api(`/usuarios/${id}`);
export const crearUsuario = (datos) => api('/usuarios', { method: 'POST', body: datos });
export const actualizarUsuario = (id, datos) => api(`/usuarios/${id}`, { method: 'PUT', body: datos });
