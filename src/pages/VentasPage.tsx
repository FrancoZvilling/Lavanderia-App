import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, Timestamp, query, where, orderBy, limit, startAfter, increment, getDoc, doc, updateDoc, runTransaction, onSnapshot, deleteDoc } from 'firebase/firestore';
import type { DocumentData, QueryConstraint } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { toast } from 'react-toastify';
import { FaPlus, FaTimesCircle, FaCheckCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useCaja } from '../context/CajaContext';
import useDebounce from '../hooks/useDebounce';
import VentasTable from '../modules/ventas/VentasTable';
import CuentaCorrienteTable from '../modules/ventas/CuentaCorrienteTable';
import ProcesarPagoModal from '../modules/ventas/ProcesarPagoModal';
import Modal from '../components/Modal';
import AddSaleForm from '../modules/ventas/AddSaleForm';
import VentaDetallesModal from '../modules/ventas/VentaDetallesModal';
import Spinner from '../components/Spinner';
import type { Venta, TipoDePrenda, Cliente, MetodoDePago } from '../types';
import './VentasPage.css';

const PAGE_SIZE = 15;

const VentasPage = () => {
  const { cajaActual, loadingCaja } = useCaja();
  
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tiposDePrenda, setTiposDePrenda] = useState<TipoDePrenda[]>([]);
  
  const [filterClientId, setFilterClientId] = useState<string>('todos');

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

  const [ventasPendientes, setVentasPendientes] = useState<Venta[]>([]);
  const [loadingPendientes, setLoadingPendientes] = useState(true);
  const [showPendientes, setShowPendientes] = useState(false);

  const [isProcesarModalOpen, setIsProcesarModalOpen] = useState(false);
  const [ventaParaProcesar, setVentaParaProcesar] = useState<Venta | null>(null);

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
    const q = query(collection(db, 'ventasPendientes'), orderBy('fecha', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const pendientesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Venta));
      setVentasPendientes(pendientesData);
      setLoadingPendientes(false);
    }, (error) => {
      console.error("Error al escuchar ventas pendientes:", error);
      toast.error("Error al cargar ventas en cuenta corriente.");
      setLoadingPendientes(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const fetchVentas = async () => {
      if (!debouncedFilterDate) return;
      
      setLoading(true);
      setVentas([]);
      setLastDoc(null);
      setHasMore(true);

      try {
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
    return () => { isCancelled = true; };
  }, [debouncedFilterDate, debouncedFilterClientId]);

  const handleLoadMore = async () => {
    if (!lastDoc || loadingMore) return;
    setLoadingMore(true);
    
    try {
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
  
  const handleSaveVenta = async (nuevaVentaData: Omit<Venta, 'id' | 'fecha' | 'cajaId'>) => {
    if (nuevaVentaData.metodoDePago === 'Cuenta Corriente') {
      try {
        const counterRef = doc(db, 'configuracion', 'counters');
        
        const newTicketNumber = await runTransaction(db, async (transaction) => {
          const counterDoc = await transaction.get(counterRef);
          if (!counterDoc.exists()) {
            throw "El documento de contadores no existe. Créelo en la colección 'configuracion'.";
          }
          const newNumber = counterDoc.data().ultimoTicket + 1;
          transaction.update(counterRef, { ultimoTicket: newNumber });
          return newNumber;
        });

        const nroTicketFormateado = String(newTicketNumber).padStart(4, '0');

        const ventaPendienteData = {
          ...nuevaVentaData,
          nroTicket: nroTicketFormateado,
          fecha: Timestamp.fromDate(new Date()),
        };

        await addDoc(collection(db, 'ventasPendientes'), ventaPendienteData);
        toast.success(`Venta #${nroTicketFormateado} enviada a Cuenta Corriente.`);
        setIsAddModalOpen(false);

      } catch (error) {
        console.error("Error al guardar en cuenta corriente:", error);
        toast.error("No se pudo guardar la venta en cuenta corriente.");
      }
      return;
    }

    if (!cajaActual) {
      toast.error("No se puede registrar una venta pagada si la caja está cerrada.");
      return;
    }
    
    const clienteId = nuevaVentaData.clienteId;
    try {
      const ventaConDatosCompletos = { 
        ...nuevaVentaData, 
        fecha: Timestamp.fromDate(new Date()),
        cajaId: cajaActual.id,
      };
      
      await addDoc(collection(db, 'ventas'), ventaConDatosCompletos);
      
      if (clienteId) {
        const clienteDocRef = doc(db, 'clientes', clienteId);
        const updates: { [key: string]: any } = { estadoLavado: 'En preparación' };

        const configDocRef = doc(db, 'configuracion', 'puntos');
        const configSnapshot = await getDoc(configDocRef);
        
        if (configSnapshot.exists()) {
          const { puntosOtorgados, montoRequerido } = configSnapshot.data();
          if (puntosOtorgados && montoRequerido > 0) {
            const unidades = nuevaVentaData.montoTotal / montoRequerido;
            const puntosGanados = Math.floor(unidades * puntosOtorgados);

            if (puntosGanados > 0) {
              updates.puntos = increment(puntosGanados);
              toast.info(`${puntosGanados} puntos sumados al cliente.`);
            }
          }
        }
        
        if (Object.keys(updates).length > 0) {
          await updateDoc(clienteDocRef, updates);
        }

        setClientes(prevClientes => prevClientes.map(c => 
          c.id === clienteId ? { ...c, estadoLavado: 'En preparación' } : c
        ));
      }

      setIsAddModalOpen(false);
      toast.success("Venta registrada con éxito.");
    } catch (error) {
      console.error("Error al guardar venta o actualizar cliente:", error);
      toast.error("No se pudo registrar la venta.");
    }
  };

  const handleProcesarVentaPendiente = (venta: Venta) => {
    if (!cajaActual) {
      toast.error("Debe haber una caja abierta para procesar un pago.");
      return;
    }
    setVentaParaProcesar(venta);
    setIsProcesarModalOpen(true);
  };

  const handleAnularVentaPendiente = async (venta: Venta) => {
    if (window.confirm(`¿Estás seguro de que quieres anular el Ticket #${venta.nroTicket} por un total de $${venta.montoTotal}? Esta acción no se puede deshacer.`)) {
      try {
        await deleteDoc(doc(db, 'ventasPendientes', venta.id));
        toast.success(`Ticket #${venta.nroTicket} anulado correctamente.`);
      } catch (error) {
        toast.error("Error al anular el ticket.");
      }
    }
  };

  const handleConfirmarPago = async (metodoDePagoFinal: Exclude<MetodoDePago, 'Cuenta Corriente'>) => {
    if (!ventaParaProcesar || !cajaActual) return;

    const { id: idVentaPendiente, ...datosVenta } = ventaParaProcesar;

    try {
      await addDoc(collection(db, 'ventas'), {
        ...datosVenta,
        metodoDePago: metodoDePagoFinal,
        fecha: Timestamp.fromDate(new Date()),
        cajaId: cajaActual.id,
      });

      await deleteDoc(doc(db, 'ventasPendientes', idVentaPendiente));
      
      if (datosVenta.clienteId) {
        const clienteDocRef = doc(db, 'clientes', datosVenta.clienteId);
        const updates: { [key: string]: any } = { estadoLavado: 'En preparación' };

        const configDocRef = doc(db, 'configuracion', 'puntos');
        const configSnapshot = await getDoc(configDocRef);
        if (configSnapshot.exists()) {
          const { puntosOtorgados, montoRequerido } = configSnapshot.data();
          if (puntosOtorgados && montoRequerido > 0) {
            const puntosGanados = Math.floor(datosVenta.montoTotal / montoRequerido * puntosOtorgados);
            if (puntosGanados > 0) {
              updates.puntos = increment(puntosGanados);
              toast.info(`${puntosGanados} puntos sumados al cliente.`);
            }
          }
        }
        if (Object.keys(updates).length > 0) {
          await updateDoc(clienteDocRef, updates);
        }
      }

      toast.success(`Ticket #${datosVenta.nroTicket} pagado y procesado.`);
      setIsProcesarModalOpen(false);
      setVentaParaProcesar(null);

    } catch (error) {
      toast.error("Ocurrió un error al procesar el pago.");
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
          >
            <FaPlus /> <span>Registrar Nueva Venta</span>
          </button>
          <CajaStatusIndicator />
        </div>
      </header>

      <section className="config-section">
        <header className="page-header">
          <h2>Cuenta Corriente ({ventasPendientes.length})</h2>
          <button className="secondary-button" onClick={() => setShowPendientes(!showPendientes)}>
            {showPendientes ? <FaChevronUp/> : <FaChevronDown/>}
            <span style={{marginLeft: '8px'}}>{showPendientes ? 'Ocultar' : 'Mostrar'}</span>
          </button>
        </header>
        {showPendientes && (
          <div style={{ marginTop: '20px' }}>
            {loadingPendientes ? <Spinner/> : (
              ventasPendientes.length > 0 ? (
                <CuentaCorrienteTable 
                  ventas={ventasPendientes}
                  clientes={clientes}
                  onProcesar={handleProcesarVentaPendiente}
                  onAnular={handleAnularVentaPendiente}
                />
              ) : (
                <p style={{textAlign: 'center', color: '#7f8c8d'}}>No hay ventas pendientes en cuenta corriente.</p>
              )
            )}
          </div>
        )}
      </section>

      <div className="history-section">
        <header className="page-header" style={{marginBottom: '20px'}}>
          <h1>Historial de Ventas</h1>
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
      
        {loading ? <Spinner /> : 
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
      </div>
      
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Registrar Nueva Venta">
        <AddSaleForm clientes={clientes} tiposDePrenda={tiposDePrenda} onClose={() => setIsAddModalOpen(false)} onSave={handleSaveVenta} />
      </Modal>
      
      {ventaSeleccionada && (
        <Modal isOpen={isDetailsModalOpen} onClose={() => handleCloseDetailsModal} title="Detalles de la Venta">
          <VentaDetallesModal venta={ventaSeleccionada} cliente={clientes.find(c => c.id === ventaSeleccionada.clienteId)} />
        </Modal>
      )}

      {ventaParaProcesar && (
        <Modal isOpen={isProcesarModalOpen} onClose={() => setIsProcesarModalOpen(false)} title="Procesar Pago de Cuenta Corriente">
          <ProcesarPagoModal 
            venta={ventaParaProcesar}
            onClose={() => setIsProcesarModalOpen(false)}
            onConfirm={handleConfirmarPago}
          />
        </Modal>
      )}
    </div>
  );
};

export default VentasPage;