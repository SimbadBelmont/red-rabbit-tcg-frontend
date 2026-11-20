import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// /login y /registro siguen funcionando (enlaces viejos, rutas protegidas):
// abren la ventana emergente y regresan al inicio.
export default function Login({ modo = 'login' }) {
    const { abrirAcceso } = useAuth();
    const location = useLocation();
    const desde = location.state?.desde || null;

    useEffect(() => { abrirAcceso(modo, desde); }, [abrirAcceso, modo, desde]);

    return <Navigate to="/" replace />;
}
