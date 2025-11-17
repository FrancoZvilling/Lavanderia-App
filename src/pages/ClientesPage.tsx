import { useState, useMemo, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { toast } from 'react-toastify';
import ClientCard from '../modules/clientes/ClientCard';
import Modal from '../components/Modal';
import ChangeStatusModal from '../modules/clientes/ChangeStatusModal';
import type { Cliente, EstadoLavado } from '../types';
import './ClientesPage.css';
import './VentasPage.css';

const ClientesPage = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EstadoLavado | 'Todos'>('Todos');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const clientesCollectionRef = collection(db, 'clientes');
        const querySnapshot = await getDocs(clientesCollectionRef);
        
        // --- CORRECCIÓN CLAVE APLICADA AQUÍ ---
        // Construimos el objeto de forma explícita, incluyendo los nuevos campos.
        const clientesData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          // Creamos una variable 'cliente' con el tipo explícito para mayor seguridad
          const cliente: Cliente = {
            id: doc.id,
            nombre: data.nombre,
            apellido: data.apellido,
            contacto: data.contacto,
            documento: data.documento, // Leemos el DNI del documento de Firebase
            telefono: data.telefono,   // Leemos el teléfono del documento de Firebase
            puntos: data.puntos,
            estadoLavado: data.estadoLavado,
          };
          return cliente;
        });
        
        setClientes(clientesData);
        
      } catch (error) {
        console.error("Error al obtener los clientes:", error);
        toast.error("No se pudieron cargar los clientes desde la base de datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

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

  const handleUpdateStatus = async (newStatus: EstadoLavado) => {
    if (!clienteSeleccionado) return;

    const clienteDocRef = doc(db, 'clientes', clienteSeleccionado.id);

    try {
      await updateDoc(clienteDocRef, {
        estadoLavado: newStatus
      });

      setClientes(prevClientes =>
        prevClientes.map(c =>
          c.id === clienteSeleccionado.id ? { ...c, estadoLavado: newStatus } : c
        )
      );

      toast.success(`Estado de ${clienteSeleccionado.nombre} actualizado a "${newStatus}".`);
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      toast.error("No se pudo actualizar el estado del cliente.");
    } finally {
      handleCloseStatusModal();
    }
  };
  
  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '50px' }}>
        <h2>Cargando Clientes...</h2>
      </div>
    );
  }

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
          <ClientCard key={cliente.id} cliente={cliente} onStatusChangeClick={handleOpenStatusModal} />
        ))}
        {filteredClientes.length === 0 && !loading && (
            <p className="no-results">No se encontraron clientes en la base de datos.</p>
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
    </div>
  );
};

export default ClientesPage;