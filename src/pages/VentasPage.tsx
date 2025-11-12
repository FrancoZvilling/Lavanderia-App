import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, Timestamp, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import type { DocumentData, QueryConstraint } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { toast } from 'react-toastify';
import { FaPlus, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import { useCaja } from '../context/CajaContext';
import useDebounce from '../hooks/useDebounce';
import VentasTable from '../modules/ventas/VentasTable';
import Modal from '../components/Modal';
import AddSaleForm from '../modules/ventas/AddSaleForm';
import VentaDetallesModal from '../modules/ventas/VentaDetallesModal';
import type { Venta, TipoDePrenda, Cliente } from '../types';
import './VentasPage.css';

const PAGE_SIZE = 15;

const VentasPage = () => {
  const { cajaActual, loadingCaja } = useCaja();
  
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tiposDePrenda, setTiposDePrenda] = useState<TipoDePrenda[]>([]);
  
  const [filterClientId, setFilterClientId] = useState<string>('todos');

  // --- CORRECCIÓN 1: Lógica para obtener la fecha local correcta ---
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [filterDate, setFilterDate] = useState<string>(todayString);
  
  const debouncedFilterClientId = useDebounce(filterClientId, 400);
  const debouncedFilterDate = useDebounce(filterDate, 400);

  const [lastDoc, setLastDoc] = useState<DocumentData | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);

  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        const [clientesSnapshot, prendasSnapshot] = await Promise.all([
          getDocs(collection(db, 'clientes')),
          getDocs(collection(db, 'tiposDePrenda'))
        ]);
        setClientes(clientesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Cliente)));
        setTiposDePrenda(prendasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TipoDePrenda)));
      } catch (error) {
        console.error("Error al cargar datos estáticos:", error);
        toast.error("Error al cargar clientes y tipos de prenda.");
      }
    };
    fetchStaticData();
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const fetchVentas = async () => {
      if (!debouncedFilterDate) return;
      
      setLoading(true);
      setVentas([]);
      setLastDoc(null);

      try {
        // --- CORRECCIÓN 2: Construcción de fechas en la zona horaria LOCAL ---
        const startOfDay = new Date(`${debouncedFilterDate}T00:00:00`);
        const endOfDay = new Date(`${debouncedFilterDate}T23:59:59.999`);

        const queryConstraints: QueryConstraint[] = [
          where('fecha', '>=', Timestamp.fromDate(startOfDay)),
          where('fecha', '<=', Timestamp.fromDate(endOfDay)),
          orderBy('fecha', 'desc'),
        ];
        if (debouncedFilterClientId !== 'todos') {
          queryConstraints.push(where('clienteId', '==', debouncedFilterClientId));
        }
        queryConstraints.push(limit(PAGE_SIZE));
        
        const q = query(collection(db, 'ventas'), ...queryConstraints);
        const querySnapshot = await getDocs(q);

        if (!isCancelled) {
          const ventasData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Venta));
          setVentas(ventasData);

          if (querySnapshot.docs.length < PAGE_SIZE) {
            setHasMore(false);
          } else {
            setHasMore(true);
            setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
          }
        }
      } catch (error) {
        if (!isCancelled) toast.error("Error al cargar las ventas.");
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchVentas();

    return () => {
      isCancelled = true;
    };
  }, [debouncedFilterDate, debouncedFilterClientId]);

  const handleLoadMore = async () => {
    if (!lastDoc || loadingMore) return;
    setLoadingMore(true);
    
    try {
      // --- CORRECCIÓN 3: Aplicamos la misma lógica de fechas aquí ---
      const startOfDay = new Date(`${debouncedFilterDate}T00:00:00`);
      const endOfDay = new Date(`${debouncedFilterDate}T23:59:59.999`);

      const queryConstraints: QueryConstraint[] = [
        where('fecha', '>=', Timestamp.fromDate(startOfDay)),
        where('fecha', '<=', Timestamp.fromDate(endOfDay)),
        orderBy('fecha', 'desc'),
      ];
      if (debouncedFilterClientId !== 'todos') {
        queryConstraints.push(where('clienteId', '==', debouncedFilterClientId));
      }
      queryConstraints.push(startAfter(lastDoc));
      queryConstraints.push(limit(PAGE_SIZE));

      const q = query(collection(db, 'ventas'), ...queryConstraints);

      const querySnapshot = await getDocs(q);
      const nuevasVentas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Venta));
      setVentas(prev => [...prev, ...nuevasVentas]);
      
      if (querySnapshot.docs.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }
    } catch (error) {
      toast.error("Error al cargar más ventas.");
    } finally {
      setLoadingMore(false);
    }
  };
  
  const handleSaveVenta = async (nuevaVentaData: Omit<Venta, 'id' | 'fecha'>) => {
    try {
      const ventaConFecha = { ...nuevaVentaData, fecha: Timestamp.fromDate(new Date()) };
      const docRef = await addDoc(collection(db, 'ventas'), ventaConFecha);
      const ventaGuardada = { id: docRef.id, ...ventaConFecha } as Venta;
      
      const today = new Date().toISOString().split('T')[0];
      if (filterDate === today && (filterClientId === 'todos' || filterClientId === ventaGuardada.clienteId)) {
        setVentas(prevVentas => [ventaGuardada, ...prevVentas].sort((a, b) => b.fecha.toMillis() - a.fecha.toMillis()));
      }
      
      setIsAddModalOpen(false);
      toast.success("Venta registrada con éxito.");
    } catch (error) {
      console.error("Error al guardar la venta:", error);
      toast.error("No se pudo registrar la venta.");
    }
  };
  
  const handleCreatePrenda = async (nombrePrenda: string) => {
    try {
      const docRef = await addDoc(collection(db, 'tiposDePrenda'), { nombre: nombrePrenda });
      const nuevaPrenda = { id: docRef.id, nombre: nombrePrenda };
      setTiposDePrenda(prevPrendas => [...prevPrendas, nuevaPrenda]);
      toast.info(`Nueva prenda "${nombrePrenda}" creada.`);
      return nuevaPrenda;
    } catch (error) {
      console.error("Error al crear la prenda:", error);
      toast.error("No se pudo crear la nueva prenda.");
      return { id: 'error-' + Date.now(), nombre: nombrePrenda };
    }
  };

  const handleOpenDetailsModal = (venta: Venta) => { setVentaSeleccionada(venta); setIsDetailsModalOpen(true); };
  const handleCloseDetailsModal = () => { setIsDetailsModalOpen(false); setVentaSeleccionada(null); };

  const CajaStatusIndicator = () => {
    if (loadingCaja) { return <div className="caja-status-indicator loading">Verificando caja...</div>; }
    if (cajaActual) { return (<div className="caja-status-indicator open"><FaCheckCircle /><span>Caja Abierta</span></div>); }
    return (<div className="caja-status-indicator closed"><FaTimesCircle /><span>Caja Cerrada</span></div>);
  };

  if (loadingCaja) {
    return <div className="page-container" style={{ textAlign: 'center', paddingTop: '50px' }}><h2>Cargando...</h2></div>;
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Historial de Ventas</h1>
        <div className="header-actions">
          <button 
            className="primary-button" 
            onClick={() => setIsAddModalOpen(true)}
            disabled={!cajaActual}
            title={!cajaActual ? "Debe abrir la caja para registrar ventas" : "Registrar nueva venta"}
          >
            <FaPlus /> <span>Registrar Nueva Venta</span>
          </button>
          <CajaStatusIndicator />
        </div>
      </header>

      <div className="filters-container">
        <input 
          type="date" 
          className="filter-input"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <select 
            className="filter-input"
            value={filterClientId}
            onChange={(e) => setFilterClientId(e.target.value)}
        >
            <option value="todos">Todos los clientes</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
        </select>
        <button className="secondary-button" onClick={() => setFilterDate(todayString)}>Hoy</button>
      </div>
      
      {loading ? <p style={{textAlign: 'center'}}>Cargando ventas...</p> : 
        <>
          <VentasTable ventas={ventas} clientes={clientes} onVerDetalles={handleOpenDetailsModal} />
          {ventas.length === 0 &&
            <p style={{textAlign: 'center', color: '#7f8c8d', padding: '20px'}}>No se encontraron ventas para los filtros seleccionados.</p>
          }
          {hasMore && (
            <div className="load-more-container">
              <button className="primary-button" onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? 'Cargando...' : 'Cargar más'}
              </button>
            </div>
          )}
        </>
      }
      
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Registrar Nueva Venta">
        <AddSaleForm clientes={clientes} tiposDePrenda={tiposDePrenda} onClose={() => setIsAddModalOpen(false)} onSave={handleSaveVenta} onCreatePrenda={handleCreatePrenda} />
      </Modal>
      
      {ventaSeleccionada && (
        <Modal isOpen={isDetailsModalOpen} onClose={handleCloseDetailsModal} title="Detalles de la Venta">
          <VentaDetallesModal venta={ventaSeleccionada} cliente={clientes.find(c => c.id === ventaSeleccionada.clienteId)} />
        </Modal>
      )}
    </div>
  );
};

export default VentasPage;