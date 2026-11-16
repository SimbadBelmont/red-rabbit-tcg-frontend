import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Sin sesión → login. Con sesión pero sin el rol requerido → inicio.
export default function RutaProtegida({ children, roles }) {
    const { user } = useAuth();
    const location = useLocation();
    if (!user) return <Navigate to="/login" state={{ desde: location.pathname }} replace />;
    if (roles && !roles.includes(user.rol)) return <Navigate to="/" replace />;
    return children;
}
