import { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import ClientCard from '../modules/clientes/ClientCard';
import Modal from '../components/Modal';
import CanjearPuntosModal from '../modules/clientes/CanjearPuntosModal';
import { mockClientes, mockPremios } from '../data/mockData';
import type { Cliente, EstadoLavado, Premio } from '../types';
import './ClientesPage.css';
import './VentasPage.css';

const ClientesPage = () => {
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EstadoLavado | 'Todos'>('Todos');
  const [isCanjeModalOpen, setIsCanjeModalOpen] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

  const filteredClientes = useMemo(() => {
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

    // Esta es la función que se ejecutará si el usuario hace clic en "Confirmar"
    const performCanje = () => {
      setClientes(prevClientes =>
        prevClientes.map(c =>
          c.id === clienteSeleccionado!.id // Usamos '!' porque sabemos que no es null aquí
            ? { ...c, puntos: c.puntos - premio.puntosRequeridos }
            : c
        )
      );
      handleCloseCanjeModal();
      toast.success(`¡"${premio.nombre}" canjeado con éxito!`);
    };

    // Este es el componente que se mostrará dentro de la notificación
    const ConfirmationUI = ({ closeToast }: { closeToast: () => void }) => (
      <div>
        <p style={{ marginBottom: '15px' }}>¿Seguro que quieres canjear "{premio.nombre}"?</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="secondary-button small-button" onClick={closeToast}>Cancelar</button>
          <button className="primary-button small-button" onClick={() => {
            performCanje();
            closeToast();
          }}>Confirmar</button>
        </div>
      </div>
    );

    // ---- LA CORRECCIÓN CLAVE ESTÁ AQUÍ ----
    // Pasamos una función que recibe 'closeToast' y renderiza nuestro componente.
    // TypeScript ahora entiende que 'closeToast' se está proporcionando correctamente.
    toast.info(({ closeToast }) => <ConfirmationUI closeToast={closeToast} />, {
      autoClose: false,
      closeOnClick: false,
      closeButton: false,
      toastId: `confirm-canje-${premio.id}` // ID único para evitar duplicados
    });
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Gestión de Clientes</h1>
      </header>
      <div className="filters-container">
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
          <ClientCard key={cliente.id} cliente={cliente} onCanjearClick={handleOpenCanjeModal} />
        ))}
        {filteredClientes.length === 0 && (
          <p className="no-results">No se encontraron clientes que coincidan con la búsqueda.</p>
        )}
      </div>

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