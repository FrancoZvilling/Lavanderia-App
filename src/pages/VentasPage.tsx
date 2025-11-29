import { useState, useEffect, useMemo, useRef } from 'react';
import { collection, getDocs, addDoc, Timestamp, query, where, orderBy, limit, startAfter, increment, getDoc, doc, updateDoc, onSnapshot, deleteDoc, runTransaction } from 'firebase/firestore';
import type { DocumentData, QueryConstraint } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { toast } from 'react-toastify';
import { toPng } from 'html-to-image';
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
import Ticket from '../modules/ventas/Ticket';
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
  const [ticketSearch, setTicketSearch] = useState('');

  const debouncedFilterClientId = useDebounce(filterClientId, 400);
  const debouncedFilterDate = useDebounce(filterDate, 400);
  const debouncedTicketSearch = useDebounce(ticketSearch, 500);

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
  const [pendingTicketSearch, setPendingTicketSearch] = useState('');

  const [isProcesarModalOpen, setIsProcesarModalOpen] = useState(false);
  const [ventaParaProcesar, setVentaParaProcesar] = useState<Venta | null>(null);

  const [proximoTicket, setProximoTicket] = useState<string | null>(null);

  // Estados para la generación del ticket
  const [ticketData, setTicketData] = useState<Venta | null>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

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
    setLoading(true);
    setHasMore(true);

    let queryConstraints: QueryConstraint[] = [];
    
    if (debouncedTicketSearch.trim() !== '') {
      queryConstraints.push(where('nroTicket', '==', debouncedTicketSearch.trim().padStart(6, '0')));
      queryConstraints.push(limit(PAGE_SIZE));
      
      const q = query(collection(db, 'ventas'), ...queryConstraints);
      getDocs(q).then(querySnapshot => {
        const ventasData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Venta));
        setVentas(ventasData);
        setHasMore(false);
        setLoading(false);
      }).catch(error => {
        console.error("Error en búsqueda por ticket:", error);
        toast.error("Error al buscar el ticket.");
        setLoading(false);
      });

      return;
    }
    
    if (!debouncedFilterDate) {
      setLoading(false);
      return;
    };
    
    const startOfDay = new Date(`${debouncedFilterDate}T00:00:00`);
    const endOfDay = new Date(`${debouncedFilterDate}T23:59:59.999`);
    queryConstraints.push(where('fecha', '>=', Timestamp.fromDate(startOfDay)));
    queryConstraints.push(where('fecha', '<=', Timestamp.fromDate(endOfDay)));
    
    if (debouncedFilterClientId !== 'todos') {
      queryConstraints.push(where('clienteId', '==', debouncedFilterClientId));
    }
    
    queryConstraints.push(orderBy('fecha', 'desc'));
    queryConstraints.push(limit(PAGE_SIZE));

    const q = query(collection(db, 'ventas'), ...queryConstraints);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ventasData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Venta));
      setVentas(ventasData);
      if (querySnapshot.docs.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error al escuchar historial de ventas:", error);
      toast.error("Error al cargar las ventas.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [debouncedFilterDate, debouncedFilterClientId, debouncedTicketSearch]);

  // useEffect para la generación del ticket
  useEffect(() => {
    if (ticketData && ticketRef.current) {
      const generarYDescargar = async () => {
        const node = ticketRef.current?.querySelector('.ticket-container');
        if (!node) return;

        toast.info("Generando ticket...");
        try {
          const dataUrl = await toPng(node as HTMLElement, { 
            cacheBust: true, 
            backgroundColor: '#ffffff',
            pixelRatio: 3,
          });
          
          const link = document.createElement('a');
          link.download = `ticket-${ticketData.nroTicket}.png`;
          link.href = dataUrl;
          link.click();

          setTicketData(null);
        } catch (err) {
          console.error('Error al generar el ticket:', err);
          toast.error('Hubo un problema al generar el ticket.');
          setTicketData(null);
        }
      };
      setTimeout(generarYDescargar, 500);
    }
  }, [ticketData]);

  const filteredVentasPendientes = useMemo(() => {
    if (!pendingTicketSearch.trim()) {
      return ventasPendientes;
    }
    return ventasPendientes.filter(venta => 
      venta.nroTicket?.includes(pendingTicketSearch.trim())
    );
  }, [ventasPendientes, pendingTicketSearch]);

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

   const handleOpenAddSaleModal = async () => {
    if (!cajaActual) {
      toast.warn("La caja está cerrada. Solo se podrán registrar ventas a Cuenta Corriente.", { autoClose: 5000 });
    }
    try {
      const counterRef = doc(db, 'configuracion', 'counters');
      const newTicketNumber = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        if (!counterDoc.exists()) { throw "El documento de contadores no existe."; }
        const newNumber = counterDoc.data().ultimoTicket + 1;
        transaction.update(counterRef, { ultimoTicket: newNumber });
        return newNumber;
      });
      const nroTicketFormateado = String(newTicketNumber).padStart(6, '0');
      setProximoTicket(nroTicketFormateado);
      setIsAddModalOpen(true);
    } catch (error) {
      console.error("Error al generar número de ticket:", error);
      toast.error("No se pudo generar un nuevo número de ticket.");
    }
  };
  
  const handleSaveVenta = async (nuevaVentaData: Omit<Venta, 'id' | 'fecha' | 'cajaId' | 'nroTicket'>) => {
    if (!proximoTicket) {
      toast.error("Error crítico: No hay un número de ticket generado.");
      return;
    }

    const ventaConTicket = { ...nuevaVentaData, nroTicket: proximoTicket };
    const clienteId = ventaConTicket.clienteId;

    if (clienteId) {
      try {
        const clienteDocRef = doc(db, 'clientes', clienteId);
        await updateDoc(clienteDocRef, { estadoLavado: 'En preparación' });
        setClientes(prevClientes => prevClientes.map(c => c.id === clienteId ? { ...c, estadoLavado: 'En preparación' } : c));
      } catch (error) {
        console.error("Error al actualizar el estado del cliente:", error);
        toast.error("Hubo un problema al actualizar el estado del cliente, pero la venta se registrará.");
      }
    }

    if (ventaConTicket.metodoDePago === 'Cuenta Corriente') {
      try {
        await addDoc(collection(db, 'ventasPendientes'), { ...ventaConTicket, fecha: Timestamp.fromDate(new Date()) });
        toast.success(`Ticket #${proximoTicket} enviado a Cuenta Corriente.`);
      } catch (error) {
        console.error("Error al guardar en cuenta corriente:", error);
        toast.error("No se pudo guardar la venta en cuenta corriente.");
      }
    } else {
      if (!cajaActual) {
        toast.error("La caja está cerrada. No se pueden registrar ventas pagadas. Seleccione 'Cuenta Corriente'.");
        return;
      }
      try {
        await addDoc(collection(db, 'ventas'), { ...ventaConTicket, fecha: Timestamp.fromDate(new Date()), cajaId: cajaActual.id });
        if (clienteId) {
          const clienteDocRef = doc(db, 'clientes', clienteId);
          const configDocRef = doc(db, 'configuracion', 'puntos');
          const configSnapshot = await getDoc(configDocRef);
          if (configSnapshot.exists()) {
            const { puntosOtorgados, montoRequerido } = configSnapshot.data();
            if (puntosOtorgados && montoRequerido > 0) {
              const puntosGanados = Math.floor(ventaConTicket.montoTotal / montoRequerido * puntosOtorgados);
              if (puntosGanados > 0) {
                await updateDoc(clienteDocRef, { puntos: increment(puntosGanados) });
                toast.info(`${puntosGanados} puntos sumados al cliente.`);
              }
            }
          }
        }
        toast.success(`Venta #${proximoTicket} registrada con éxito.`);
      } catch (error) {
        console.error("Error al guardar venta:", error);
        toast.error("No se pudo registrar la venta.");
      }
    }
    setIsAddModalOpen(false);
    setProximoTicket(null);
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
    if (window.confirm(`¿Estás seguro de que quieres anular el Ticket #${venta.nroTicket} por un total de ${new Intl.NumberFormat('es-AR', {style:'currency', currency:'ARS'}).format(venta.montoTotal)}? Esta acción no se puede deshacer.`)) {
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
        const configDocRef = doc(db, 'configuracion', 'puntos');
        const configSnapshot = await getDoc(configDocRef);
        if (configSnapshot.exists()) {
          const { puntosOtorgados, montoRequerido } = configSnapshot.data();
          if (puntosOtorgados && montoRequerido > 0) {
            const puntosGanados = Math.floor(datosVenta.montoTotal / montoRequerido * puntosOtorgados);
            if (puntosGanados > 0) {
              await updateDoc(clienteDocRef, { puntos: increment(puntosGanados) });
              toast.info(`${puntosGanados} puntos sumados al cliente.`);
            }
          }
        }
      }
      toast.success(`Ticket #${datosVenta.nroTicket} pagado y procesado.`);
      setIsProcesarModalOpen(false);
      setVentaParaProcesar(null);
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      toast.error("Ocurrió un error al procesar el pago.");
    }
  };
  
 const handleCreateCliente = async (nombreCompleto: string, telefono: string, email: string, descuento: number, observaciones: string): Promise<Cliente | null> => {
    try {
      // Separamos el nombre y el apellido del nombre completo
      const nombreSplit = nombreCompleto.split(' ');
      const nombre = nombreSplit[0] || '';
      const apellido = nombreSplit.slice(1).join(' ') || '';

      // Construimos el objeto completo del nuevo cliente con los nuevos campos
      const newClientData = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim(),
        contacto: email.trim(), // Guardamos el email en la propiedad 'contacto'
        observaciones: observaciones.trim(), // Guardamos las observaciones
        descuentoFijo: descuento,
        puntos: 0,
        estadoLavado: 'Entregado' as const,
        documento: '', // Guardamos un DNI vacío ya que no se solicita
      };

      // Guardamos el nuevo documento en la colección 'clientes'
      const docRef = await addDoc(collection(db, 'clientes'), newClientData);
      
      // Creamos el objeto completo para el estado de React, incluyendo el nuevo ID
      const nuevoCliente: Cliente = { id: docRef.id, ...newClientData };

      // Actualizamos el estado local para que el nuevo cliente aparezca en el desplegable
      setClientes(prev => [...prev, nuevoCliente].sort((a,b) => (a.apellido + a.nombre).localeCompare(b.apellido + b.nombre)));
      
      toast.success(`Cliente "${nombreCompleto}" creado con éxito.`);
      
      // Devolvemos el objeto del nuevo cliente para que pueda ser auto-seleccionado
      return nuevoCliente;

    } catch (error) {
      console.error("Error al crear el cliente:", error);
      toast.error("No se pudo crear el nuevo cliente.");
      return null;
    }
};

  const handleOpenDetailsModal = (venta: Venta) => { setVentaSeleccionada(venta); setIsDetailsModalOpen(true); };
  const handleCloseDetailsModal = () => { setIsDetailsModalOpen(false); setVentaSeleccionada(null); };

  const CajaStatusIndicator = () => {
    if (loadingCaja) { return <div className="caja-status-indicator loading">Verificando caja...</div>; }
    if (cajaActual) { return (<div className="caja-status-indicator open"><FaCheckCircle /><span>Caja Abierta</span></div>); }
    return (<div className="caja-status-indicator closed"><FaTimesCircle /><span>Caja Cerrada</span></div>);
  };
  
  const handleSaveChangesOnDetails = async (ventaId: string, nuevasObservaciones: string) => {
    try {
      const ventaDocRef = doc(db, 'ventas', ventaId);
      await updateDoc(ventaDocRef, {
        observaciones: nuevasObservaciones
      });
      setVentas(prevVentas =>
        prevVentas.map(v =>
          v.id === ventaId ? { ...v, observaciones: nuevasObservaciones } : v
        )
      );
      if (ventaSeleccionada) {
        setVentaSeleccionada({ ...ventaSeleccionada, observaciones: nuevasObservaciones });
      }
      toast.success("Observaciones actualizadas con éxito.");
    } catch (error) {
      console.error("Error al actualizar observaciones:", error);
      toast.error("No se pudieron guardar los cambios.");
    }
  };

  const handleImprimirTicket = (venta: Venta) => {
    setTicketData(venta);
  };

  if (loadingCaja) {
    return <Spinner />;
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Administración de Ventas</h1>
        <div className="header-actions">
          <button 
            className="primary-button" 
            onClick={handleOpenAddSaleModal}
            disabled={!cajaActual}
            title={!cajaActual ? "Debe abrir la caja para registrar cualquier tipo de venta" : "Registrar nueva venta"}
          >
            <FaPlus /> <span>Registrar Nueva Venta</span>
          </button>
          <CajaStatusIndicator />
        </div>
      </header>

      <section className="config-section">
        <header className="page-header">
          <h2>Cuenta Corriente ({filteredVentasPendientes.length})</h2>
          <button className="secondary-button" onClick={() => setShowPendientes(!showPendientes)}>
            {showPendientes ? <FaChevronUp/> : <FaChevronDown/>}
            <span style={{marginLeft: '8px'}}>{showPendientes ? 'Ocultar' : 'Mostrar'}</span>
          </button>
        </header>
        {showPendientes && (
          <div style={{ marginTop: '20px' }}>
            <div className="filters-container" style={{padding: '10px', boxShadow: 'none', marginBottom: '20px'}}>
              <input 
                type="search"
                placeholder="Buscar por N° de Ticket..."
                className="filter-input"
                value={pendingTicketSearch}
                onChange={e => setPendingTicketSearch(e.target.value)}
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
            {loadingPendientes ? <Spinner/> : (
              filteredVentasPendientes.length > 0 ? (
                <CuentaCorrienteTable 
                  ventas={filteredVentasPendientes}
                  clientes={clientes}
                  onProcesar={handleProcesarVentaPendiente}
                  onAnular={handleAnularVentaPendiente}
                  onVerDetalles={handleOpenDetailsModal}
                  onImprimirTicket={handleImprimirTicket}
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
            type="search"
            placeholder="Buscar por N° de Ticket..."
            className="filter-input"
            value={ticketSearch}
            onChange={e => setTicketSearch(e.target.value)}
            inputMode="numeric"
            pattern="[0-9]*"
          />
          <input 
            type="date" 
            className="filter-input"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            disabled={ticketSearch.trim() !== ''}
          />
          <select 
              className="filter-input"
              value={filterClientId}
              onChange={(e) => setFilterClientId(e.target.value)}
              disabled={ticketSearch.trim() !== ''}
          >
              <option value="todos">Todos los clientes</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
          </select>
          <button className="secondary-button" onClick={() => { setFilterDate(todayString); setTicketSearch(''); }}>Hoy</button>
        </div>
      
        {loading ? <Spinner /> : 
          <>
            <VentasTable 
              ventas={ventas} 
              clientes={clientes} 
              onVerDetalles={handleOpenDetailsModal}
              onImprimirTicket={handleImprimirTicket}
            />
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
      
      <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setProximoTicket(null); }} title={`Registrar Nueva Venta - Ticket #${proximoTicket}`}>
        <AddSaleForm 
            nroTicket={proximoTicket}
            clientes={clientes} 
            tiposDePrenda={tiposDePrenda} 
            onClose={() => { setIsAddModalOpen(false); setProximoTicket(null); }}
            onSave={handleSaveVenta} 
            onCreateCliente={handleCreateCliente}
        />
      </Modal>
      
     {ventaSeleccionada && (
        <Modal 
          isOpen={isDetailsModalOpen} 
          onClose={handleCloseDetailsModal} 
          title={`Detalles de la Venta - Ticket #${ventaSeleccionada.nroTicket}`}
        >
          <VentaDetallesModal 
            venta={ventaSeleccionada}
            cliente={clientes.find(c => c.id === ventaSeleccionada.clienteId)}
            onSaveChanges={handleSaveChangesOnDetails}
          />
        </Modal>
      )}

      {ventaParaProcesar && (
        <Modal isOpen={isProcesarModalOpen} onClose={() => setIsProcesarModalOpen(false)} title={`Procesar Pago - Ticket #${ventaParaProcesar.nroTicket}`}>
          <ProcesarPagoModal 
            venta={ventaParaProcesar}
            onClose={() => setIsProcesarModalOpen(false)}
            onConfirm={handleConfirmarPago}
          />
        </Modal>
      )}

      <div ref={ticketRef}>
        {ticketData && (
          <div className="ticket-wrapper">
            <Ticket 
              venta={ticketData}
              cliente={clientes.find(c => c.id === ticketData.clienteId)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VentasPage;