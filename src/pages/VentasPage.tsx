import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { toast } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';
import VentasTable from '../modules/ventas/VentasTable';
import Modal from '../components/Modal';
import AddSaleForm from '../modules/ventas/AddSaleForm';
import VentaDetallesModal from '../modules/ventas/VentaDetallesModal';
import type { Venta, TipoDePrenda, Cliente } from '../types';
import './VentasPage.css';

const VentasPage = () => {
  // Estados para los datos de la aplicación
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tiposDePrenda, setTiposDePrenda] = useState<TipoDePrenda[]>([]);
  
  // Estados para la UI
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);

  // useEffect para obtener todos los datos iniciales de Firestore
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Ejecutamos todas las lecturas de datos en paralelo para mayor eficiencia
        const [ventasSnapshot, clientesSnapshot, prendasSnapshot] = await Promise.all([
          getDocs(collection(db, 'ventas')),
          getDocs(collection(db, 'clientes')),
          getDocs(collection(db, 'tiposDePrenda'))
        ]);

        const ventasData = ventasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Venta));
        const clientesData = clientesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Cliente));
        const prendasData = prendasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TipoDePrenda));
        
        // Ordenamos las ventas por fecha, de más nueva a más vieja
        ventasData.sort((a, b) => b.fecha.toMillis() - a.fecha.toMillis());

        setVentas(ventasData);
        setClientes(clientesData);
        setTiposDePrenda(prendasData);
        
      } catch (error) {
        console.error("Error al obtener los datos iniciales:", error);
        toast.error("Error al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Función para GUARDAR una nueva venta en Firestore
  const handleSaveVenta = async (nuevaVentaData: Omit<Venta, 'id' | 'fecha'>) => {
    try {
      const ventaConFecha = {
        ...nuevaVentaData,
        fecha: Timestamp.fromDate(new Date()),
      };
      const docRef = await addDoc(collection(db, 'ventas'), ventaConFecha);
      
      // Actualizamos el estado local para ver el cambio al instante
      const ventaGuardada = { id: docRef.id, ...ventaConFecha } as Venta;
      setVentas(prevVentas => [ventaGuardada, ...prevVentas]);
      
      setIsAddModalOpen(false);
      toast.success("Venta registrada con éxito.");
    } catch (error) {
      console.error("Error al guardar la venta:", error);
      toast.error("No se pudo registrar la venta.");
    }
  };
  
  // Función para CREAR un nuevo tipo de prenda en Firestore
  const handleCreatePrenda = async (nombrePrenda: string) => {
    try {
      const docRef = await addDoc(collection(db, 'tiposDePrenda'), { nombre: nombrePrenda });
      const nuevaPrenda = { id: docRef.id, nombre: nombrePrenda };
      
      // Actualizamos el estado local para que esté disponible en el selector
      setTiposDePrenda(prevPrendas => [...prevPrendas, nuevaPrenda]);
      toast.info(`Nueva prenda "${nombrePrenda}" creada.`);
      return nuevaPrenda;
    } catch (error) {
      console.error("Error al crear la prenda:", error);
      toast.error("No se pudo crear la nueva prenda.");
      // Devolvemos un objeto con un ID temporal en caso de error para no romper el formulario
      return { id: 'error-' + Date.now(), nombre: nombrePrenda };
    }
  };

  const handleOpenDetailsModal = (venta: Venta) => {
    setVentaSeleccionada(venta);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setVentaSeleccionada(null);
  };

  if (loading) {
    return <div className="page-container" style={{ textAlign: 'center', paddingTop: '50px' }}><h2>Cargando Ventas...</h2></div>;
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Historial de Ventas</h1>
        <button className="primary-button" onClick={() => setIsAddModalOpen(true)}>
          <FaPlus /> <span>Registrar Nueva Venta</span>
        </button>
      </header>

      <div className="filters-container">
        <input type="date" className="filter-input" />
        <select className="filter-input"><option value="">Filtrar por cliente...</option>{clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}</select>
        <button className="secondary-button">Filtrar</button>
      </div>

      <VentasTable 
        ventas={ventas} 
        clientes={clientes}
        onVerDetalles={handleOpenDetailsModal}
      />
      
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Registrar Nueva Venta">
        <AddSaleForm 
          clientes={clientes} 
          tiposDePrenda={tiposDePrenda} 
          onClose={() => setIsAddModalOpen(false)} 
          onSave={handleSaveVenta} 
          onCreatePrenda={handleCreatePrenda} 
        />
      </Modal>

      {ventaSeleccionada && (
        <Modal isOpen={isDetailsModalOpen} onClose={handleCloseDetailsModal} title="Detalles de la Venta">
          <VentaDetallesModal 
            venta={ventaSeleccionada}
            cliente={clientes.find(c => c.id === ventaSeleccionada.clienteId)}
          />
        </Modal>
      )}
    </div>
  );
};

export default VentasPage;