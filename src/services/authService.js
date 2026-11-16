import { api } from './api';

export const login = (email, password) => api('/auth/login', { method: 'POST', body: { email, password } });
export const registrar = (datos) => api('/auth/registrar', { method: 'POST', body: datos });
export const perfil = () => api('/auth/perfil');
export const actualizarPerfil = (datos) => api('/auth/perfil', { method: 'PUT', body: datos });
