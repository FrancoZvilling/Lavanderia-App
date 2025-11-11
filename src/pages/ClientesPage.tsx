import React, { useState, useMemo } from 'react';
import { toast } from 'react-toastify'; // Necesitamos las notificaciones de nuevo
import ClientCard from '../modules/clientes/ClientCard';
import Modal from '../components/Modal'; // Importamos el Modal genérico
import ChangeStatusModal from '../modules/clientes/ChangeStatusModal'; // Y nuestro nuevo modal
import { mockClientes } from '../data/mockData';
import type { Cliente, EstadoLavado } from '../types';
import './ClientesPage.css';
import './VentasPage.css';

const ClientesPage = () => {
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EstadoLavado | 'Todos'>('Todos');
  
  // Estados para manejar el modal de cambio de estado
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

  const filteredClientes = useMemo(() => {
    return clientes.filter(cliente => {
      const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`.toLowerCase();
      const searchMatch = nombreCompleto.includes(searchTerm.toLowerCase());
      const statusMatch = statusFilter === 'Todos' || cliente.estadoLavado === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [searchTerm, statusFilter, clientes]);

  const handleOpenStatusModal = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setIsStatusModalOpen(true);
  };

  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
    setClienteSeleccionado(null);
  };

  // Función que actualiza el estado del cliente en la lista
  const handleUpdateStatus = (newStatus: EstadoLavado) => {
    if (!clienteSeleccionado) return;

    setClientes(prevClientes =>
      prevClientes.map(c =>
        c.id === clienteSeleccionado.id ? { ...c, estadoLavado: newStatus } : c
      )
    );

    toast.success(`Estado de ${clienteSeleccionado.nombre} actualizado a "${newStatus}".`);
    handleCloseStatusModal();
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Gestión de Clientes</h1>
      </header>
      <div className="filters-container">
        {/* ... (filtros sin cambios) ... */}
        <input type="text" placeholder="Buscar cliente por nombre..." className="filter-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flexGrow: 1 }} />
        <select className="filter-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as EstadoLavado | 'Todos')}>
          <option value="Todos">Todos los estados</option>
          <option value="En preparación">En preparación</option>
          <option value="Listo">Listo</option>
          <option value="Entregado">Entregado</option>
        </select>
      </div>

      <div className="client-grid">
        {filteredClientes.map(cliente => (
          // Pasamos la nueva función a la tarjeta
          <ClientCard key={cliente.id} cliente={cliente} onStatusChangeClick={handleOpenStatusModal} />
        ))}
        {filteredClientes.length === 0 && <p className="no-results">No se encontraron clientes.</p>}
      </div>

      {/* Renderizado del Modal de Cambio de Estado */}
      {clienteSeleccionado && (
        <Modal 
          isOpen={isStatusModalOpen} 
          onClose={handleCloseStatusModal}
          title={`Cambiar estado para ${clienteSeleccionado.nombre}`}
        >
          <ChangeStatusModal
            currentStatus={clienteSeleccionado.estadoLavado}
            onStatusSelect={handleUpdateStatus}
          />
        </Modal>
      )}
    </div>
  );
};

export default ClientesPage;