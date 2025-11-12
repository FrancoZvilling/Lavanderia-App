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
import type { RegistroCaja } from '../types';
import './VentasPage.css';

const PAGE_SIZE_CAJA = 15;

const CajaPage = () => {
  const { cajaActual, loadingCaja } = useCaja();
  
  const [isAbrirModalOpen, setIsAbrirModalOpen] = useState(false);
  const [isCerrarModalOpen, setIsCerrarModalOpen] = useState(false);

  const [historialCajas, setHistorialCajas] = useState<RegistroCaja[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(true);
  
  // --- CORRECCIÓN 1: Lógica para obtener la fecha local correcta ---
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [filterDateCaja, setFilterDateCaja] = useState<string>(todayString);
  
  const debouncedFilterDateCaja = useDebounce(filterDateCaja, 400);

  const [lastDocCaja, setLastDocCaja] = useState<DocumentData | null>(null);
  const [hasMoreCaja, setHasMoreCaja] = useState(true);
  const [loadingMoreCaja, setLoadingMoreCaja] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const fetchHistorial = async () => {
      if (!debouncedFilterDateCaja) return;
      
      setLoadingHistorial(true);
      setHistorialCajas([]);
      setLastDocCaja(null);

      try {
        // --- CORRECCIÓN 2: Construcción de fechas en la zona horaria LOCAL ---
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
            setHasMoreCaja(true);
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

    return () => {
      isCancelled = true;
    };
  }, [debouncedFilterDateCaja]);

  const handleLoadMoreCaja = async () => {
    if (!lastDocCaja || loadingMoreCaja) return;
    setLoadingMoreCaja(true);

    try {
        // --- CORRECCIÓN 3: Aplicamos la misma lógica de fechas aquí ---
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
            return {
                id: doc.id,
                fechaApertura: data.fechaApertura,
                montoInicial: data.montoInicial,
                fechaCierre: data.fechaCierre,
                montoFinal: data.montoFinal,
                totalVentas: data.totalVentas,
                ventasDelDia: [],
            } as RegistroCaja;
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

  const handleAbrirCaja = async (montoInicial: number) => {
    try {
      await addDoc(collection(db, 'cajas'), {
        montoInicial,
        fechaApertura: Timestamp.fromDate(new Date()),
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

      const cajaCerrada: RegistroCaja = { ...cajaActual, montoFinal, fechaCierre: fechaDeCierre, totalVentas: totalVentasDelDia, ventasDelDia: [] };
      
      // --- CORRECCIÓN 4: Usamos la fecha local para la comparación ---
      const fechaCerradaLocal = new Date(fechaDeCierre.toMillis());
      const fechaCerradaStr = `${fechaCerradaLocal.getFullYear()}-${String(fechaCerradaLocal.getMonth() + 1).padStart(2, '0')}-${String(fechaCerradaLocal.getDate()).padStart(2, '0')}`;
      
      if (fechaCerradaStr === filterDateCaja) {
          setHistorialCajas(prev => [cajaCerrada, ...prev].sort((a,b) => b.fechaCierre!.toMillis() - a.fechaCierre!.toMillis()));
      }
      
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
            {/* --- CORRECCIÓN 5: Usamos todayString para el botón "Hoy" --- */}
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
        <AbrirCajaForm onClose={() => setIsAbrirModalOpen(false)} onConfirm={handleAbrirCaja} />
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