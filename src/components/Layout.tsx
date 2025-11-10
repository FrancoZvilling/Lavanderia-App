import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FaShoppingCart, FaCashRegister, FaUsers } from 'react-icons/fa';
import HamburgerButton from './HamburgerButton'; // 1. Importar
import './Layout.css';

const Layout = () => {
  // 2. Estado para la visibilidad de la barra lateral en móvil
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout-container">
      <HamburgerButton isOpen={isSidebarOpen} onClick={() => setSidebarOpen(!isSidebarOpen)} />
      
      {/* 3. Añadimos una clase 'open' condicionalmente */}
      <nav className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Lavandería PRO</h3>
        </div>
        <ul className="nav-list">
          {/* 4. Al hacer clic en un link, cerramos la barra */}
          <li onClick={() => setSidebarOpen(false)}>
            <NavLink to="/"> <FaShoppingCart /> <span>Ventas</span> </NavLink>
          </li>
          <li onClick={() => setSidebarOpen(false)}>
            <NavLink to="/caja"> <FaCashRegister /> <span>Caja</span> </NavLink>
          </li>
          <li onClick={() => setSidebarOpen(false)}>
            <NavLink to="/clientes"> <FaUsers /> <span>Clientes</span> </NavLink>
          </li>
        </ul>
      </nav>

      {/* 5. Overlay para cerrar el menú al tocar fuera */}
      {isSidebarOpen && <div className="backdrop" onClick={() => setSidebarOpen(false)} />}

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;