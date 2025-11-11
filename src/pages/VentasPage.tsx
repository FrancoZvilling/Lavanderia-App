import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import VentasTable from '../modules/ventas/VentasTable';
import { mockVentas, mockClientes, mockTiposDePrenda } from '../data/mockData';
import Modal from '../components/Modal';
import AddSaleForm from '../modules/ventas/AddSaleForm';
import type { Venta } from '../types'; // Importamos el tipo Venta
import './VentasPage.css';

const VentasPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 1. La lista de ventas ahora es un estado
  const [ventas, setVentas] = useState<Venta[]>(mockVentas);

  // 2. Función para añadir la nueva venta al estado
  const handleSaveVenta = (nuevaVenta: Venta) => {
    setVentas(prevVentas => [nuevaVenta, ...prevVentas]); // Añade la nueva venta al principio
    setIsModalOpen(false); // Cierra el modal
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Historial de Ventas</h1>
        <button className="primary-button" onClick={() => setIsModalOpen(true)}>
          <FaPlus />
          <span>Registrar Nueva Venta</span>
        </button>
      </header>

      {/* ... (filtros sin cambios) ... */}
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

      {/* 3. La tabla ahora consume el estado 'ventas' */}
      <VentasTable ventas={ventas} clientes={mockClientes} />
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Registrar Nueva Venta"
      >
        <AddSaleForm 
          clientes={mockClientes}
          tiposDePrenda={mockTiposDePrenda}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveVenta} // 4. Pasamos la función de guardado al formulario
        />
      </Modal>
    </div>
  );
};

export default VentasPage;
