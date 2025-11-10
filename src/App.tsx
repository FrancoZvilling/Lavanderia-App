import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; // 1. Importar
import 'react-toastify/dist/ReactToastify.css'; // 2. Importar los estilos
import Layout from './components/Layout';
import VentasPage from './pages/VentasPage';
import CajaPage from './pages/CajaPage';
import ClientesPage from './pages/ClientesPage';

function App() {
  return (
    <BrowserRouter>
      {/* 3. Añadir el contenedor de notificaciones aquí */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<VentasPage />} />
          <Route path="caja" element={<CajaPage />} />
          <Route path="clientes" element={<ClientesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
