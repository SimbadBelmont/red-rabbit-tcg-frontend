import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RutaProtegida from './components/RutaProtegida';
import Inicio from './pages/Inicio';
import Catalogo from './pages/Catalogo';
import Eventos from './pages/Eventos';
import ComoPedir from './pages/ComoPedir';
import Contacto from './pages/Contacto';
import Login from './pages/Login';
import Registro from './pages/Registro';
import MiCuenta from './pages/MiCuenta';
import Inventario from './pages/Inventario';
import PuntoVenta from './pages/PuntoVenta';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          {/* Públicas: cada sección es su propia página */}
          <Route path="/" element={<Inicio />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/como-pedir" element={<ComoPedir />} />
          <Route path="/contacto" element={<Contacto />} />

          <Route path="/login" element={user ? <Navigate to="/mi-cuenta" /> : <Login />} />
          <Route path="/registro" element={user ? <Navigate to="/mi-cuenta" /> : <Registro />} />

          {/* Con sesión */}
          <Route path="/mi-cuenta" element={<RutaProtegida><MiCuenta /></RutaProtegida>} />

          {/* Solo personal de la tienda */}
          <Route path="/inventario" element={<RutaProtegida roles={['staff', 'admin']}><Inventario /></RutaProtegida>} />
          <Route path="/punto-de-venta" element={<RutaProtegida roles={['staff', 'admin']}><PuntoVenta /></RutaProtegida>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
