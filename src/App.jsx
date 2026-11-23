import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RutaProtegida from './components/RutaProtegida';
import ModalAcceso from './components/ModalAcceso';
import Inicio from './pages/Inicio';
import Catalogo from './pages/Catalogo';
import Eventos from './pages/Eventos';
import MiPedido from './pages/MiPedido';
import Contacto from './pages/Contacto';
import Login from './pages/Login';
import MiCuenta from './pages/MiCuenta';
import Inventario from './pages/Inventario';
import PuntoVenta from './pages/PuntoVenta';
import Usuarios from './pages/Usuarios';
import Reportes from './pages/Reportes';
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
          <Route path="/pedido" element={<MiPedido />} />
          <Route path="/como-pedir" element={<Navigate to="/pedido" replace />} />
          <Route path="/contacto" element={<Contacto />} />

          <Route path="/login" element={user ? <Navigate to="/mi-cuenta" /> : <Login />} />
          <Route path="/registro" element={user ? <Navigate to="/mi-cuenta" /> : <Login modo="registro" />} />

          {/* Con sesión */}
          <Route path="/mi-cuenta" element={<RutaProtegida><MiCuenta /></RutaProtegida>} />

          {/* Solo personal de la tienda */}
          <Route path="/inventario" element={<RutaProtegida roles={['staff', 'encargado', 'admin']}><Inventario /></RutaProtegida>} />
          <Route path="/punto-de-venta" element={<RutaProtegida roles={['staff', 'encargado', 'admin']}><PuntoVenta /></RutaProtegida>} />

          {/* Encargado y administrador */}
          <Route path="/reportes" element={<RutaProtegida roles={['encargado', 'admin']}><Reportes /></RutaProtegida>} />
          {/* Solo administrador */}
          <Route path="/usuarios" element={<RutaProtegida roles={['admin']}><Usuarios /></RutaProtegida>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
      <ModalAcceso />
    </Router>
  );
}

export default App;
