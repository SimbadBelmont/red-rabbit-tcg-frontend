import { createContext, useCallback, useContext, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

const leerUsuario = () => {
    try { return localStorage.getItem('token') ? JSON.parse(localStorage.getItem('usuario')) : null; } catch { return null; }
};

export const AuthProvider = ({ children }) => {
    // Al cargar la app, revisamos si ya hay sesión guardada
    const [user, setUser] = useState(leerUsuario);

    const guardarSesion = ({ token, usuario }) => {
        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(usuario));
        setUser(usuario);
    };

    const login = async (email, password) => guardarSesion(await authService.login(email, password));
    const registrar = async (datos) => guardarSesion(await authService.registrar(datos));
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setUser(null);
    };
    const esStaff = user?.rol === 'staff' || user?.rol === 'admin';

    // Ventana emergente de acceso: modo 'login' o 'registro'; 'desde' = a dónde ir al entrar
    const [acceso, setAcceso] = useState({ abierto: false, modo: 'login', desde: null });
    const abrirAcceso = useCallback((modo = 'login', desde = null) => setAcceso({ abierto: true, modo, desde }), []);
    const cerrarAcceso = useCallback(() => setAcceso((a) => ({ ...a, abierto: false })), []);

    return (
        <AuthContext.Provider value={{ user, setUser, login, registrar, logout, esStaff, acceso, abrirAcceso, cerrarAcceso }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
