import React, { useState } from 'react'; // 1. Importar useState
import { FaPlus } from 'react-icons/fa';
import VentasTable from '../modules/ventas/VentasTable';
import { mockVentas, mockClientes, mockTiposDePrenda } from '../data/mockData';
import Modal from '../components/Modal'; // 2. Importar Modal
import AddSaleForm from '../modules/ventas/AddSaleForm'; // 3. Importar AddSaleForm
import './VentasPage.css';

const VentasPage = () => {
  // 4. Estado para controlar la visibilidad del modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Historial de Ventas</h1>
        {/* 5. El botón ahora abre el modal */}
        <button className="primary-button" onClick={() => setIsModalOpen(true)}>
          <FaPlus />
          <span>Registrar Nueva Venta</span>
        </button>
      </header>

      {/* ... la sección de filtros sigue igual ... */}
      <div className="filters-container">
        <input type="date" className="filter-input" />
        <select className="filter-input">
          <option value="">Filtrar por cliente...</option>
          {mockClientes.map(cliente => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nombre} {cliente.apellido}
            </option>
          ))}
        </select>
        <button className="secondary-button">Filtrar</button>
      </div>

      <VentasTable ventas={mockVentas} clientes={mockClientes} />
      
      {/* 6. Renderizamos el Modal y su contenido */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Registrar Nueva Venta"
      >
        <AddSaleForm 
          clientes={mockClientes}
          tiposDePrenda={mockTiposDePrenda}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default VentasPage;
