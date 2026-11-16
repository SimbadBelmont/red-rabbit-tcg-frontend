const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api';

// Devuelve los datos o lanza un Error con el mensaje que mandó el servidor.
// Si el body es FormData (subida de CSV) no se fija Content-Type: el navegador pone el boundary.
export const api = async (endpoint, { method = 'GET', body } = {}) => {
    const token = localStorage.getItem('token');
    const esArchivo = body instanceof FormData;
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers: {
            ...(!esArchivo && body !== undefined && { 'Content-Type': 'application/json' }),
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        ...(body !== undefined && { body: esArchivo ? body : JSON.stringify(body) }),
    });
    let datos = null;
    try { datos = await res.json(); } catch { /* respuesta sin JSON */ }
    if (res.status === 401 && token) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
    }
    if (!res.ok) throw new Error(datos?.error || `Error ${res.status}`);
    return datos;
};

export const urlApi = (endpoint) => `${API_BASE}${endpoint}`;
