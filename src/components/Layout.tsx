import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
// 1. Importamos el nuevo icono 'FaStar'
import { FaShoppingCart, FaCashRegister, FaUsers, FaSignOutAlt, FaCog } from 'react-icons/fa';
import HamburgerButton from './HamburgerButton';
import './Layout.css';

const Layout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Función para manejar el cierre de sesión del usuario
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // El componente ProtectedRoute se encargará de redirigir a /login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="layout-container">
      <HamburgerButton isOpen={isSidebarOpen} onClick={() => setSidebarOpen(!isSidebarOpen)} />
      
      <nav className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Administrador</h3>
        </div>
        <ul className="nav-list">
          <li onClick={() => setSidebarOpen(false)}>
            <NavLink to="/">
              <FaShoppingCart />
              <span>Ventas</span>
            </NavLink>
          </li>
          <li onClick={() => setSidebarOpen(false)}>
            <NavLink to="/caja">
              <FaCashRegister />
              <span>Caja</span>
            </NavLink>
          </li>
          <li onClick={() => setSidebarOpen(false)}>
            <NavLink to="/clientes">
              <FaUsers />
              <span>Clientes</span>
            </NavLink>
          </li>
          {/* 2. Añadimos el nuevo enlace a la lista de navegación */}
          <li onClick={() => setSidebarOpen(false)}>
            <NavLink to="/configuracion">
              <FaCog />
              <span>Configuración</span>
            </NavLink>
          </li>
        </ul>
        
        {/* Sección del Footer de la Barra Lateral */}
        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </nav>

      {/* Overlay para cerrar el menú al tocar fuera en móvil */}
      {isSidebarOpen && <div className="backdrop" onClick={() => setSidebarOpen(false)} />}

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;