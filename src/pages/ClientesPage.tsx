import React, { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import ClientCard from '../modules/clientes/ClientCard';
import Modal from '../components/Modal';
import CanjearPuntosModal from '../modules/clientes/CanjearPuntosModal';
import { mockClientes, mockPremios } from '../data/mockData';
import type { Cliente, EstadoLavado, Premio } from '../types';
import './ClientesPage.css';
import './VentasPage.css';

const ClientesPage = () => {
  // Los clientes ahora están en un estado para poder actualizarlos
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EstadoLavado | 'Todos'>('Todos');
  
  // Estados para el modal
  const [isCanjeModalOpen, setIsCanjeModalOpen] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

  const filteredClientes = useMemo(() => {
    // Usamos el estado 'clientes' en lugar de 'mockClientes'
    return clientes.filter(cliente => {
      const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`.toLowerCase();
      const searchMatch = nombreCompleto.includes(searchTerm.toLowerCase());
      const statusMatch = statusFilter === 'Todos' || cliente.estadoLavado === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [searchTerm, statusFilter, clientes]);

  const handleOpenCanjeModal = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setIsCanjeModalOpen(true);
  };

  const handleCloseCanjeModal = () => {
    setIsCanjeModalOpen(false);
    setClienteSeleccionado(null);
  };

  const handleConfirmCanje = (premio: Premio) => {
    if (!clienteSeleccionado) return;

    // Usamos una promesa para manejar la confirmación del usuario
    const promise = new Promise<void>((resolve, reject) => {
        // Creamos un componente personalizado para la notificación de confirmación
        const Confirmation = ({ closeToast }: { closeToast: () => void }) => (
            <div>
                <p style={{ marginBottom: '15px' }}>¿Seguro que quieres canjear "{premio.nombre}"?</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    {/* Botón para cancelar (cierra el toast y rechaza la promesa) */}
                    <button className="secondary-button small-button" onClick={() => { closeToast(); reject(); }}>Cancelar</button>
                    {/* Botón para confirmar (cierra el toast y resuelve la promesa) */}
                    <button className="primary-button small-button" onClick={() => { closeToast(); resolve(); }}>Confirmar</button>
                </div>
            </div>
        );
        // Mostramos el toast de confirmación
        toast(<Confirmation />, { autoClose: false, closeOnClick: false, closeButton: false });
    });

    toast.promise(promise, {
      pending: 'Procesando canje...', // Mensaje mientras se espera la confirmación
      success: {
        render(){
          // Lógica de actualización de puntos
          setClientes(prevClientes =>
              prevClientes.map(c =>
                  c.id === clienteSeleccionado.id
                      ? { ...c, puntos: c.puntos - premio.puntosRequeridos }
                      : c
              )
          );
          handleCloseCanjeModal();
          return `¡"${premio.nombre}" canjeado con éxito!`;
        }
      },
      error: 'Canje cancelado por el usuario.' // Mensaje si se cancela
    });
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Gestión de Clientes</h1>
      </header>
      <div className="filters-container">
        <input
          type="text"
          placeholder="Buscar cliente por nombre..."
          className="filter-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flexGrow: 1 }}
        />
        <select
          className="filter-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as EstadoLavado | 'Todos')}
        >
          <option value="Todos">Todos los estados</option>
          <option value="En preparación">En preparación</option>
          <option value="Listo">Listo</option>
          <option value="Entregado">Entregado</option>
        </select>
      </div>

      <div className="client-grid">
        {filteredClientes.map(cliente => (
          <ClientCard key={cliente.id} cliente={cliente} onCanjearClick={handleOpenCanjeModal} />
        ))}
        {filteredClientes.length === 0 && (
            <p className="no-results">No se encontraron clientes que coincidan con la búsqueda.</p>
        )}
      </div>

      {/* Renderizado del Modal */}
      {clienteSeleccionado && (
        <Modal isOpen={isCanjeModalOpen} onClose={handleCloseCanjeModal} title={`Canjear Puntos`}>
          <CanjearPuntosModal
            cliente={clienteSeleccionado}
            premios={mockPremios}
            onConfirmCanje={handleConfirmCanje}
          />
        </Modal>
      )}
    </div>
  );
};

export default ClientesPage;