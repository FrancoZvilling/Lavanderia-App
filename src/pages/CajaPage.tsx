import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, query, where, orderBy, limit, startAfter, Timestamp } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { toast } from 'react-toastify';
import { useCaja } from '../context/CajaContext';
import useDebounce from '../hooks/useDebounce';
import CajaActual from '../modules/caja/CajaActual';
import HistorialCajaTable from '../modules/caja/HistorialCajaTable';
import AbrirCajaForm from '../modules/caja/AbrirCajaForm';
import CerrarCajaForm from '../modules/caja/CerrarCajaForm';
import Modal from '../components/Modal';
import type { RegistroCaja, Empleado } from '../types';
import './VentasPage.css';

const PAGE_SIZE_CAJA = 15;

const CajaPage = () => {
  const { cajaActual, loadingCaja } = useCaja();
  
  const [isAbrirModalOpen, setIsAbrirModalOpen] = useState(false);
  const [isCerrarModalOpen, setIsCerrarModalOpen] = useState(false);

  const [historialCajas, setHistorialCajas] = useState<RegistroCaja[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(true);
  
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [filterDateCaja, setFilterDateCaja] = useState<string>(todayString);
  
  const debouncedFilterDateCaja = useDebounce(filterDateCaja, 400);

  const [lastDocCaja, setLastDocCaja] = useState<DocumentData | null>(null);
  const [hasMoreCaja, setHasMoreCaja] = useState(true);
  const [loadingMoreCaja, setLoadingMoreCaja] = useState(false);
  
  const [montoCierreAnterior, setMontoCierreAnterior] = useState<number | null>(null);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);

  useEffect(() => {
    let isCancelled = false;
    const fetchHistorial = async () => {
      if (!debouncedFilterDateCaja) return;
      
      setLoadingHistorial(true);
      setHistorialCajas([]);
      setLastDocCaja(null);
      setHasMoreCaja(true);

      try {
        const startOfDay = new Date(`${debouncedFilterDateCaja}T00:00:00`);
        const endOfDay = new Date(`${debouncedFilterDateCaja}T23:59:59.999`);

        const q = query(
          collection(db, 'cajas'),
          where('fechaCierre', '!=', null), 
          where('fechaCierre', '>=', Timestamp.fromDate(startOfDay)),
          where('fechaCierre', '<=', Timestamp.fromDate(endOfDay)),
          orderBy('fechaCierre', 'desc'),
          limit(PAGE_SIZE_CAJA)
        );

        const historialSnapshot = await getDocs(q);

        if (!isCancelled) {
          const historialData = historialSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              fechaApertura: data.fechaApertura,
              montoInicial: data.montoInicial,
              diferenciaApertura: data.diferenciaApertura,
              empleadoId: data.empleadoId,
              empleadoNombre: data.empleadoNombre,
              fechaCierre: data.fechaCierre,
              montoFinal: data.montoFinal,
              totalVentas: data.totalVentas,
              ventasDelDia: [],
            } as RegistroCaja;
          });
          setHistorialCajas(historialData);
          
          if (historialSnapshot.docs.length < PAGE_SIZE_CAJA) {
            setHasMoreCaja(false);
          } else {
            setLastDocCaja(historialSnapshot.docs[historialSnapshot.docs.length - 1]);
          }
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Error al cargar el historial de cajas:", error);
          toast.error("Error al cargar el historial.");
        }
      } finally {
        if (!isCancelled) {
          setLoadingHistorial(false);
        }
      }
    };
    fetchHistorial();
    return () => { isCancelled = true; };
  }, [debouncedFilterDateCaja]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const qCierre = query(collection(db, 'cajas'), where('fechaCierre', '!=', null), orderBy('fechaCierre', 'desc'), limit(1));
        const ultimoCierreSnapshot = await getDocs(qCierre);
        if (!ultimoCierreSnapshot.empty) {
          const ultimoCierreDoc = ultimoCierreSnapshot.docs[0].data();
          setMontoCierreAnterior(ultimoCierreDoc.montoFinal ?? null);
        } else {
          setMontoCierreAnterior(null);
        }
      } catch (error) { console.error("Error al obtener el último cierre de caja:", error); }

      try {
        const qEmpleados = query(collection(db, 'empleados'), orderBy('nombreCompleto'));
        const empleadosSnapshot = await getDocs(qEmpleados);
        setEmpleados(empleadosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Empleado)));
      } catch (error) {
        console.error("Error al obtener empleados:", error);
        toast.error("No se pudo cargar la lista de empleados.");
      }
    };
    fetchInitialData();
  }, [cajaActual]);

  const handleLoadMoreCaja = async () => {
    if (!lastDocCaja || loadingMoreCaja) return;
    setLoadingMoreCaja(true);
    try {
        const startOfDay = new Date(`${debouncedFilterDateCaja}T00:00:00`);
        const endOfDay = new Date(`${debouncedFilterDateCaja}T23:59:59.999`);
        const q = query(
          collection(db, 'cajas'),
          where('fechaCierre', '!=', null),
          where('fechaCierre', '>=', Timestamp.fromDate(startOfDay)),
          where('fechaCierre', '<=', Timestamp.fromDate(endOfDay)),
          orderBy('fechaCierre', 'desc'),
          startAfter(lastDocCaja),
          limit(PAGE_SIZE_CAJA)
        );
        const historialSnapshot = await getDocs(q);
        const nuevoHistorial = historialSnapshot.docs.map(doc => {
            const data = doc.data();
            const registro: RegistroCaja = {
                id: doc.id,
                fechaApertura: data.fechaApertura,
                montoInicial: data.montoInicial,
                diferenciaApertura: data.diferenciaApertura,
                empleadoId: data.empleadoId,
                empleadoNombre: data.empleadoNombre,
                fechaCierre: data.fechaCierre,
                montoFinal: data.montoFinal,
                totalVentas: data.totalVentas,
                ventasDelDia: [],
            };
            return registro;
        });
        setHistorialCajas(prev => [...prev, ...nuevoHistorial]);
        if (historialSnapshot.docs.length < PAGE_SIZE_CAJA) {
            setHasMoreCaja(false);
        } else {
            setLastDocCaja(historialSnapshot.docs[historialSnapshot.docs.length - 1]);
        }
    } catch (error) {
        console.error("Error al cargar más registros:", error);
        toast.error("No se pudieron cargar más registros.");
    } finally {
        setLoadingMoreCaja(false);
    }
  };

  const handleAbrirCaja = async (montoInicial: number, empleado: { id: string; nombre: string } | null) => {
    if (!empleado) {
      toast.error("Debe seleccionar un empleado.");
      return;
    }
    try {
      const diferencia = montoCierreAnterior !== null ? montoInicial - montoCierreAnterior : 0;
      await addDoc(collection(db, 'cajas'), {
        montoInicial,
        fechaApertura: Timestamp.fromDate(new Date()),
        diferenciaApertura: diferencia,
        empleadoId: empleado.id,
        empleadoNombre: empleado.nombre,
        fechaCierre: null,
        montoFinal: null,
        totalVentas: 0,
      });
      setIsAbrirModalOpen(false);
      toast.success("Caja abierta con éxito.");
    } catch (error) {
      console.error("Error al abrir caja:", error);
      toast.error("No se pudo abrir la caja.");
    }
  };

  const handleCerrarCaja = async (montoFinal: number) => {
    if (!cajaActual) return;
    
    const totalVentasDelDia = cajaActual.ventasDelDia.reduce((sum, v) => sum + v.montoTotal, 0);
    const cajaDocRef = doc(db, 'cajas', cajaActual.id);
    const fechaDeCierre = Timestamp.fromDate(new Date());

    try {
      await updateDoc(cajaDocRef, {
        montoFinal,
        fechaCierre: fechaDeCierre,
        totalVentas: totalVentasDelDia,
      });

      const cajaCerrada: RegistroCaja = { 
        ...cajaActual, 
        montoFinal, 
        fechaCierre: fechaDeCierre, 
        totalVentas: totalVentasDelDia, 
        ventasDelDia: [] 
      };
      
      const fechaCerradaLocal = new Date(fechaDeCierre.toMillis());
      const fechaCerradaStr = `${fechaCerradaLocal.getFullYear()}-${String(fechaCerradaLocal.getMonth() + 1).padStart(2, '0')}-${String(fechaCerradaLocal.getDate()).padStart(2, '0')}`;
      
      if (fechaCerradaStr === filterDateCaja) {
        setHistorialCajas(prev => [cajaCerrada, ...prev].sort((a,b) => b.fechaCierre!.toMillis() - a.fechaCierre!.toMillis()));
      }
      
      setMontoCierreAnterior(montoFinal);
      setIsCerrarModalOpen(false);
      toast.success("Caja cerrada con éxito.");
    } catch (error) {
      console.error("Error al cerrar caja:", error);
      toast.error("No se pudo cerrar la caja.");
    }
  };
  
  if (loadingCaja) {
    return <div className="page-container" style={{ textAlign: 'center', paddingTop: '50px' }}><h2>Cargando Módulo de Caja...</h2></div>;
  }

  return (
    <div className="page-container">
      <CajaActual
        caja={cajaActual}
        onAbrirCaja={() => setIsAbrirModalOpen(true)}
        onCerrarCaja={() => setIsCerrarModalOpen(true)}
      />
      <div className="history-section">
        <header className="page-header" style={{marginBottom: '20px', alignItems: 'center'}}>
          <h1>Historial de Cajas</h1>
          <div className="filters-container" style={{padding: '10px', boxShadow: 'none'}}>
            <label htmlFor="filterDateCaja" style={{fontWeight: 500}}>Filtrar por fecha:</label>
            <input 
              type="date" 
              id="filterDateCaja"
              className="filter-input"
              value={filterDateCaja}
              onChange={(e) => setFilterDateCaja(e.target.value)}
            />
            <button className="secondary-button" onClick={() => setFilterDateCaja(todayString)}>Hoy</button>
          </div>
        </header>
        {loadingHistorial ? 
            <p style={{textAlign: 'center'}}>Cargando historial del día...</p> 
            : <HistorialCajaTable registros={historialCajas} />
        }
        {historialCajas.length === 0 && !loadingHistorial &&
            <p style={{textAlign: 'center', color: '#7f8c8d'}}>No hay registros de caja para la fecha seleccionada.</p>
        }
        {hasMoreCaja && !loadingHistorial && (
          <div className="load-more-container">
            <button className="primary-button" onClick={handleLoadMoreCaja} disabled={loadingMoreCaja}>
              {loadingMoreCaja ? 'Cargando...' : 'Cargar más'}
            </button>
          </div>
        )}
      </div>
      <Modal isOpen={isAbrirModalOpen} onClose={() => setIsAbrirModalOpen(false)} title="Abrir Caja">
        <AbrirCajaForm 
            onClose={() => setIsAbrirModalOpen(false)} 
            onConfirm={handleAbrirCaja}
            montoCierreAnterior={montoCierreAnterior}
            empleados={empleados}
        />
      </Modal>
      {cajaActual && (
        <Modal isOpen={isCerrarModalOpen} onClose={() => setIsCerrarModalOpen(false)} title="Cerrar Caja">
          <CerrarCajaForm caja={cajaActual} onClose={() => setIsCerrarModalOpen(false)} onConfirm={handleCerrarCaja} />
        </Modal>
      )}
    </div>
  );
};

export default CajaPage;