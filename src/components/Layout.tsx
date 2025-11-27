import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useRole } from '../context/RoleContext';
import { FaShoppingCart, FaCashRegister, FaUsers, FaCog, FaSignOutAlt } from 'react-icons/fa';
import HamburgerButton from './HamburgerButton';
import Modal from './Modal';
import AdminPinModal from '../modules/configuracion/AdminPinModal';
import './Layout.css';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { mode, switchToEmpleadoMode, switchToAdminMode } = useRole();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login'); 
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // --- FUNCIÓN 'handleModeChange' ACTUALIZADA ---
  const handleModeChange = () => {
    if (mode === 'admin') {
      switchToEmpleadoMode();
    } else {
      // Si el menú lateral está abierto (lo que solo ocurre en móvil),
      // lo cerramos antes de abrir el modal del PIN.
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
      }
      // Abrimos el modal para pedir el PIN de administrador.
      setIsPinModalOpen(true);
    }
  };

  const handleConfirmAdminPin = async (pin: string) => {
    const success = await switchToAdminMode(pin);
    if (success) {
      setIsPinModalOpen(false);
    }
  };

  return (
    <>
      <div className="layout-container">
        <HamburgerButton isOpen={isSidebarOpen} onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <nav className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3>Administrador</h3>
          </div>
          <ul className="nav-list">
            <li onClick={() => setIsSidebarOpen(false)}>
              <NavLink to="/">
                <FaShoppingCart />
                <span>Ventas</span>
              </NavLink>
            </li>
            <li onClick={() => setIsSidebarOpen(false)}>
              <NavLink to="/caja">
                <FaCashRegister />
                <span>Caja</span>
              </NavLink>
            </li>
            <li onClick={() => setIsSidebarOpen(false)}>
              <NavLink to="/clientes">
                <FaUsers />
                <span>Clientes</span>
              </NavLink>
            </li>
            
            {mode === 'admin' && (
              <li onClick={() => setIsSidebarOpen(false)}>
                <NavLink to="/configuracion">
                  <FaCog />
                  <span>Configuración</span>
                </NavLink>
              </li>
            )}
          </ul>
          
          <div className="sidebar-footer">
            <div className="mode-switch-container">
              <span>Modo {mode === 'admin' ? 'Administrador' : 'Empleado'}</span>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={mode === 'admin'}
                  onChange={handleModeChange}
                />
                <span className="slider round"></span>
              </label>
            </div>

            <button className="logout-button" onClick={handleLogout}>
              <FaSignOutAlt />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </nav>

        {isSidebarOpen && <div className="backdrop" onClick={() => setIsSidebarOpen(false)} />}

        <main className="main-content">
          <Outlet />
        </main>
      </div>

      <Modal isOpen={isPinModalOpen} onClose={() => setIsPinModalOpen(false)} title="Acceso de Administrador">
        <AdminPinModal
          onClose={() => setIsPinModalOpen(false)}
          onConfirm={handleConfirmAdminPin}
        />
      </Modal>
    </>
  );
};

export default Layout;