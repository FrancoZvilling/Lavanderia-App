import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import VentasPage from './pages/VentasPage';
import CajaPage from './pages/CajaPage';
import ClientesPage from './pages/ClientesPage';
import ConfiguracionPage from './pages/ConfiguracionPage';

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Routes>
        {/* Ruta pública para el Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas protegidas */}
        <Route 
          path="/*" // Captura todas las demás rutas
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Estas rutas anidadas se renderizarán dentro del Outlet del Layout */}
          <Route path="" element={<VentasPage />} /> {/* Ruta raíz */}
          <Route path="caja" element={<CajaPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          {/* 2. La ruta ahora apunta al componente importado */}
          <Route path="configuracion" element={<ConfiguracionPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
