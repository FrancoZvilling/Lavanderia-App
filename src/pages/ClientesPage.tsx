import { useState, useMemo, useEffect } from 'react';
import { collection, doc, updateDoc, onSnapshot, query, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { toast } from 'react-toastify';
import { useRole } from '../context/RoleContext';
import ClientCard from '../modules/clientes/ClientCard';
import Modal from '../components/Modal';
import ChangeStatusModal from '../modules/clientes/ChangeStatusModal';
import EditClientFormModal from '../modules/clientes/EditClientFormModal';
import Spinner from '../components/Spinner';
import type { Cliente, EstadoLavado } from '../types';
import './ClientesPage.css';
import './VentasPage.css';

const ClientesPage = () => {
  const { mode } = useRole();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EstadoLavado | 'Todos'>('Todos');
  
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'clientes'), orderBy('apellido'), orderBy('nombre'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const clientesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const cliente: Cliente = {
          id: doc.id,
          nombre: data.nombre,
          apellido: data.apellido,
          contacto: data.contacto,
          documento: data.documento,
          telefono: data.telefono,
          descuentoFijo: data.descuentoFijo,
          observaciones: data.observaciones,
          puntos: data.puntos,
          estadoLavado: data.estadoLavado,
        };
        return cliente;
      });
      setClientes(clientesData);
      setLoading(false);
    }, (error) => {
      console.error("Error al escuchar los clientes:", error);
      toast.error("No se pudieron cargar los clientes en tiempo real.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- LÓGICA DE FILTRADO MEJORADA Y ACTUALIZADA ---
  const filteredClientes = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return clientes.filter(cliente => {
      const statusMatch = statusFilter === 'Todos' || cliente.estadoLavado === statusFilter;
      if (!statusMatch) return false;

      if (!term) return true;

      const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`.toLowerCase();
      const telefono = cliente.telefono || '';
      const email = cliente.contacto || '';

      return (
        nombreCompleto.includes(term) ||
        telefono.includes(term) ||
        email.toLowerCase().includes(term)
      );
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

  const handleUpdateStatus = async (newStatus: EstadoLavado) => {
    if (!clienteSeleccionado) return;
    const clienteDocRef = doc(db, 'clientes', clienteSeleccionado.id);
    try {
      await updateDoc(clienteDocRef, { estadoLavado: newStatus });
      toast.success(`Estado de ${clienteSeleccionado.nombre} actualizado a "${newStatus}".`);
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      toast.error("No se pudo actualizar el estado del cliente.");
    } finally {
      handleCloseStatusModal();
    }
  };
  
  const handleOpenEditModal = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCliente(null);
  };

  const handleUpdateCliente = async (clienteId: string, updatedData: Partial<Cliente>) => {
    try {
      const clienteDocRef = doc(db, 'clientes', clienteId);
      await updateDoc(clienteDocRef, updatedData);
      handleCloseEditModal();
      toast.success("Datos del cliente actualizados con éxito.");
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      toast.error("Error al actualizar los datos del cliente.");
    }
  };

  const handleDeleteCliente = async (cliente: Cliente) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${cliente.nombre} ${cliente.apellido}? Esta acción no se puede deshacer.`)) {
      try {
        await deleteDoc(doc(db, 'clientes', cliente.id));
        toast.success("Cliente eliminado con éxito.");
      } catch (error) {
        console.error("Error al eliminar el cliente:", error);
        toast.error("No se pudo eliminar el cliente.");
      }
    }
  };
  
  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Gestión de Clientes</h1>
      </header>
      <div className="filters-container">
        {/* --- PLACEHOLDER ACTUALIZADO --- */}
        <input 
          type="search" 
          placeholder="Buscar por nombre, teléfono o email..." 
          className="filter-input" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          style={{ flexGrow: 1 }} 
        />
        <select className="filter-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as EstadoLavado | 'Todos')}>
          <option value="Todos">Todos los estados</option>
          <option value="En preparación">En preparación</option>
          <option value="Listo">Listo</option>
          <option value="Entregado">Entregado</option>
        </select>
      </div>

      <div className="client-grid">
        {filteredClientes.map(cliente => (
          <ClientCard 
            key={cliente.id} 
            cliente={cliente} 
            onStatusChangeClick={handleOpenStatusModal}
            onEditClick={handleOpenEditModal}
            onDeleteClick={handleDeleteCliente}
            mode={mode}
          />
        ))}
        {filteredClientes.length === 0 && !loading && (
            <p className="no-results">No se encontraron clientes que coincidan con la búsqueda.</p>
        )}
      </div>

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

      {editingCliente && (
        <Modal 
          isOpen={isEditModalOpen} 
          onClose={handleCloseEditModal} 
          title={`Editar Cliente: ${editingCliente.nombre} ${editingCliente.apellido}`}
        >
          <EditClientFormModal 
            cliente={editingCliente}
            onClose={handleCloseEditModal}
            onSave={handleUpdateCliente}
          />
        </Modal>
      )}
    </div>
  );
};

export default ClientesPage;