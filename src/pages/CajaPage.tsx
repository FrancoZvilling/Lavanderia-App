import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, query, where, orderBy, limit, startAfter, Timestamp } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { type BillCounts } from '../modules/caja/BillCounter';
import { db } from '../firebaseConfig';
import { toast } from 'react-toastify';
import { useCaja } from '../context/CajaContext';
import { useRole } from '../context/RoleContext';
import useDebounce from '../hooks/useDebounce';
import CajaActual from '../modules/caja/CajaActual';
import HistorialCajaTable from '../modules/caja/HistorialCajaTable';
import AbrirCajaForm from '../modules/caja/AbrirCajaForm';
import CerrarCajaForm from '../modules/caja/CerrarCajaForm';
import CajaDetallesModal from '../modules/caja/CajaDetallesModal';
import RetiroFormModal from '../modules/caja/RetiroFormModal';
import RetirosHistorial from '../modules/caja/RetirosHistorial';
import IngresoFormModal from '../modules/caja/IngresoFormModal';
import IngresosHistorial from '../modules/caja/IngresosHistorial';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import type { RegistroCaja, Empleado, MetodoDePago, MotivoRetiro, Retiro, Ingreso, MotivoIngreso } from '../types';
import './VentasPage.css';
import './ConfiguracionPage.css';

const PAGE_SIZE_CAJA = 15;

const CajaPage = () => {
  const { mode } = useRole();
  const { cajaActual, loadingCaja } = useCaja();
  
  const [isAbrirModalOpen, setIsAbrirModalOpen] = useState(false);
  const [isCerrarModalOpen, setIsCerrarModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRetiroModalOpen, setIsRetiroModalOpen] = useState(false);
  const [isIngresoModalOpen, setIsIngresoModalOpen] = useState(false);
  const [registroSeleccionado, setRegistroSeleccionado] = useState<RegistroCaja | null>(null);

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
  const [motivosRetiro, setMotivosRetiro] = useState<MotivoRetiro[]>([]);
  const [motivosIngreso, setMotivosIngreso] = useState<MotivoIngreso[]>([]);
  
  const [showRetiros, setShowRetiros] = useState(false);
  const [historialRetiros, setHistorialRetiros] = useState<Retiro[]>([]);
  const [loadingRetiros, setLoadingRetiros] = useState(false);
  const [filterDateRetiros, setFilterDateRetiros] = useState<string>(todayString);
  const debouncedFilterDateRetiros = useDebounce(filterDateRetiros, 400);

  const [showIngresos, setShowIngresos] = useState(false);
  const [historialIngresos, setHistorialIngresos] = useState<Ingreso[]>([]);
  const [loadingIngresos, setLoadingIngresos] = useState(false);
  const [filterDateIngresos, setFilterDateIngresos] = useState<string>(todayString);
  const debouncedFilterDateIngresos = useDebounce(filterDateIngresos, 400);

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
              totalEfectivo: data.totalEfectivo,
              totalTransferencia: data.totalTransferencia,
              totalDebito: data.totalDebito,
              totalCredito: data.totalCredito,
              totalRetirosEfectivo: data.totalRetirosEfectivo,
              totalRetirosTransferencia: data.totalRetirosTransferencia,
              totalIngresosManualesEfectivo: data.totalIngresosManualesEfectivo,
              totalIngresosManualesTransferencia: data.totalIngresosManualesTransferencia,
              desgloseApertura: data.desgloseApertura,
              desgloseCierre: data.desgloseCierre,
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
        const [empleadosSnapshot, motivosRetiroSnapshot, motivosIngresoSnapshot] = await Promise.all([
            getDocs(query(collection(db, 'empleados'), orderBy('nombreCompleto'))),
            getDocs(query(collection(db, 'motivosRetiro'), orderBy('nombre'))),
            getDocs(query(collection(db, 'motivosIngreso'), orderBy('nombre'))),
        ]);
        setEmpleados(empleadosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Empleado)));
        setMotivosRetiro(motivosRetiroSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MotivoRetiro)));
        setMotivosIngreso(motivosIngresoSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MotivoIngreso)));
      } catch (error) {
        console.error("Error al obtener datos de configuración:", error);
        toast.error("No se pudo cargar la configuración.");
      }
    };
    fetchInitialData();
  }, [cajaActual]);

  useEffect(() => {
    if (!showRetiros || !debouncedFilterDateRetiros) return;
    const fetchRetiros = async () => {
      setLoadingRetiros(true);
      try {
        const startOfDay = new Date(`${debouncedFilterDateRetiros}T00:00:00`);
        const endOfDay = new Date(`${debouncedFilterDateRetiros}T23:59:59.999`);
        const q = query(
          collection(db, 'retiros'),
          where('fecha', '>=', Timestamp.fromDate(startOfDay)),
          where('fecha', '<=', Timestamp.fromDate(endOfDay)),
          orderBy('fecha', 'desc')
        );
        const retirosSnapshot = await getDocs(q);
        setHistorialRetiros(retirosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Retiro)));
      } catch (error) {
        toast.error("Error al cargar el historial de retiros.");
      } finally {
        setLoadingRetiros(false);
      }
    };
    fetchRetiros();
  }, [showRetiros, debouncedFilterDateRetiros]);

  useEffect(() => {
    if (!showIngresos || !debouncedFilterDateIngresos) return;
    const fetchIngresos = async () => {
      setLoadingIngresos(true);
      try {
        const startOfDay = new Date(`${debouncedFilterDateIngresos}T00:00:00`);
        const endOfDay = new Date(`${debouncedFilterDateIngresos}T23:59:59.999`);
        const q = query(
          collection(db, 'ingresos'),
          where('fecha', '>=', Timestamp.fromDate(startOfDay)),
          where('fecha', '<=', Timestamp.fromDate(endOfDay)),
          orderBy('fecha', 'desc')
        );
        const ingresosSnapshot = await getDocs(q);
        setHistorialIngresos(ingresosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ingreso)));
      } catch (error) {
        toast.error("Error al cargar el historial de ingresos.");
      } finally {
        setLoadingIngresos(false);
      }
    };
    fetchIngresos();
  }, [showIngresos, debouncedFilterDateIngresos]);

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
                totalEfectivo: data.totalEfectivo,
                totalTransferencia: data.totalTransferencia,
                totalDebito: data.totalDebito,
                totalCredito: data.totalCredito,
                totalRetirosEfectivo: data.totalRetirosEfectivo,
                totalRetirosTransferencia: data.totalRetirosTransferencia,
                totalIngresosManualesEfectivo: data.totalIngresosManualesEfectivo,
                totalIngresosManualesTransferencia: data.totalIngresosManualesTransferencia,
                desgloseApertura: data.desgloseApertura, 
                desgloseCierre: data.desgloseCierre,
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

  const handleAbrirCaja = async (montoInicial: number, empleado: Empleado, pinIngresado: string, desglose: BillCounts) => {
    if (!empleado || !pinIngresado) {
        toast.error("Faltan datos del empleado o el PIN para abrir la caja.");
        return;
    }
    try {
      const diferencia = montoCierreAnterior !== null ? montoInicial - montoCierreAnterior : 0;
      const desgloseLimpio = Object.entries(desglose).reduce((acc, [key, value]) => {
        if (value > 0) {
          acc[key] = value;
        }
        return acc;
      }, {} as { [key: string]: number });
      await addDoc(collection(db, 'cajas'), {
        montoInicial,
        fechaApertura: Timestamp.fromDate(new Date()),
        diferenciaApertura: diferencia,
        empleadoId: empleado.id,
        empleadoNombre: empleado.nombreCompleto,
        desgloseApertura: desgloseLimpio,
        fechaCierre: null,
        montoFinal: null,
        totalVentas: 0,
        totalEfectivo: 0,
        totalTransferencia: 0,
        totalDebito: 0,
        totalCredito: 0,
        totalRetirosEfectivo: 0,
        totalRetirosTransferencia: 0,
        totalIngresosManualesEfectivo: 0,
        totalIngresosManualesTransferencia: 0,
      });
      setIsAbrirModalOpen(false);
      toast.success(`Caja abierta por ${empleado.nombreCompleto}.`);
    } catch (error) {
      console.error("Error al abrir caja:", error);
      toast.error("No se pudo abrir la caja.");
    }
  };

  const handleCerrarCaja = async (montoFinal: number, desglose: BillCounts) => {
    if (!cajaActual) return;

    try {
      const ventasPendientesRef = collection(db, 'ventasPendientes');
      const querySnapshot = await getDocs(ventasPendientesRef);

      if (!querySnapshot.empty) {
        const confirmPromise = new Promise<void>((resolve, reject) => {
          const onConfirm = () => { toast.dismiss(); resolve(); };
          const onCancel = () => { toast.dismiss(); reject(); };

          toast.warn(
            <div>
              <p>Todavía hay {querySnapshot.size} pedido(s) sin procesar en Cuenta Corriente.</p>
              <p><strong>¿Seguro que quiere cerrar la caja?</strong></p>
              <div className="confirmation-buttons">
                <button onClick={onCancel} className="secondary-button small-button">Cancelar</button>
                <button onClick={onConfirm} className="primary-button small-button">Sí, cerrar</button>
              </div>
            </div>,
            { autoClose: false, closeOnClick: false, closeButton: false, toastId: 'confirm-cierre' }
          );
        });

        await toast.promise(confirmPromise, {
            pending: 'Esperando confirmación...',
            error: 'Cierre de caja cancelado.'
        });
      }

      await procederConElCierre(montoFinal, desglose);

    } catch (error) {
      console.log("Error o cancelación en el proceso de cierre:", error);
    }
  };

  const procederConElCierre = async (montoFinal: number, desglose: BillCounts) => {
    if (!cajaActual) return;
    
    const subtotales = (cajaActual.ventasDelDia || []).reduce((acc, venta) => {
        acc[venta.metodoDePago] = (acc[venta.metodoDePago] || 0) + venta.montoTotal;
        return acc;
    }, { Efectivo: 0, Transferencia: 0, Débito: 0, Crédito: 0 } as Record<MetodoDePago, number>);

    const totalVentasDelDia = Object.values(subtotales).reduce((sum, current) => sum + current, 0);

    const retirosEfectivo = (cajaActual.retirosDelDia || []).filter(r => r.metodo === 'Efectivo').reduce((sum, r) => sum + r.monto, 0);
    const retirosTransferencia = (cajaActual.retirosDelDia || []).filter(r => r.metodo === 'Transferencia').reduce((sum, r) => sum + r.monto, 0);
    
    const ingresosManualesEfectivo = (cajaActual.ingresosDelDia || []).filter(i => i.metodo === 'Efectivo').reduce((sum, i) => sum + i.monto, 0);
    const ingresosManualesTransferencia = (cajaActual.ingresosDelDia || []).filter(i => i.metodo === 'Transferencia').reduce((sum, i) => sum + i.monto, 0);

    const desgloseLimpio = Object.entries(desglose).reduce((acc, [key, value]) => {
      if (value > 0) {
        acc[key] = value;
      }
      return acc;
    }, {} as { [key: string]: number });

    const cajaDocRef = doc(db, 'cajas', cajaActual.id);
    const fechaDeCierre = Timestamp.fromDate(new Date());

    try {
        await updateDoc(cajaDocRef, {
            montoFinal,
            fechaCierre: fechaDeCierre,
            desgloseCierre: desgloseLimpio,
            totalVentas: totalVentasDelDia,
            totalEfectivo: subtotales.Efectivo,
            totalTransferencia: subtotales.Transferencia,
            totalDebito: subtotales.Débito,
            totalCredito: subtotales.Crédito,
            totalRetirosEfectivo: retirosEfectivo,
            totalRetirosTransferencia: retirosTransferencia,
            totalIngresosManualesEfectivo: ingresosManualesEfectivo,
            totalIngresosManualesTransferencia: ingresosManualesTransferencia,
        });

        const cajaCerrada: RegistroCaja = { 
            ...cajaActual, 
            montoFinal, 
            fechaCierre: fechaDeCierre, 
            desgloseCierre: desgloseLimpio,
            totalVentas: totalVentasDelDia,
            totalEfectivo: subtotales.Efectivo,
            totalTransferencia: subtotales.Transferencia,
            totalDebito: subtotales.Débito,
            totalCredito: subtotales.Crédito,
            totalRetirosEfectivo: retirosEfectivo,
            totalRetirosTransferencia: retirosTransferencia,
            totalIngresosManualesEfectivo: ingresosManualesEfectivo,
            totalIngresosManualesTransferencia: ingresosManualesTransferencia,
            ventasDelDia: [],
            retirosDelDia: [], 
            ingresosDelDia: [],
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
  
  const handleSaveRetiro = async (retiroData: { monto: number; metodo: 'Efectivo' | 'Transferencia'; motivo: string; empleado: { id: string; nombre: string; };}) => {
    if (!cajaActual) return;
    
    const ingresosEfectivo = (cajaActual.ventasDelDia || []).filter(v => v.metodoDePago === 'Efectivo').reduce((sum, v) => sum + v.montoTotal, 0);
    const ingresosManualesEfectivo = (cajaActual.ingresosDelDia || []).filter(i => i.metodo === 'Efectivo').reduce((sum, i) => sum + i.monto, 0);
    const retirosEfectivo = (cajaActual.retirosDelDia || []).filter(r => r.metodo === 'Efectivo').reduce((sum, r) => sum + r.monto, 0);
    const efectivoDisponible = (cajaActual.montoInicial + ingresosEfectivo + ingresosManualesEfectivo) - retirosEfectivo;

    if (retiroData.metodo === 'Efectivo' && retiroData.monto > efectivoDisponible) {
      toast.error(`Fondos insuficientes. Efectivo disponible: ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(efectivoDisponible)}`);
      return;
    }
    
    try {
      await addDoc(collection(db, 'retiros'), {
        monto: retiroData.monto,
        metodo: retiroData.metodo,
        motivo: retiroData.motivo,
        empleadoId: retiroData.empleado.id,
        empleadoNombre: retiroData.empleado.nombre,
        cajaId: cajaActual.id,
        fecha: Timestamp.fromDate(new Date()),
      });
      toast.success("Retiro registrado con éxito.");
      setIsRetiroModalOpen(false);
    } catch (error) { 
      console.error("Error al registrar el retiro:", error);
      toast.error("No se pudo registrar el retiro.");
    }
  };

  const handleSaveIngreso = async (ingresoData: { monto: number; metodo: 'Efectivo' | 'Transferencia'; motivo: string; empleado: {id: string, nombre: string}}) => {
    if (!cajaActual) return;
    try {
      await addDoc(collection(db, 'ingresos'), {
        monto: ingresoData.monto,
        metodo: ingresoData.metodo,
        motivo: ingresoData.motivo,
        empleadoId: ingresoData.empleado.id,
        empleadoNombre: ingresoData.empleado.nombre,
        cajaId: cajaActual.id,
        fecha: Timestamp.fromDate(new Date())
      });
      toast.success("Ingreso registrado con éxito.");
      setIsIngresoModalOpen(false);
    } catch (error) { 
      console.error("Error al registrar el ingreso:", error);
      toast.error("Error al registrar el ingreso.");
    }
  };
  
  const handleCreateMotivoRetiro = async (nombreMotivo: string): Promise<MotivoRetiro> => {
    try {
        const docRef = await addDoc(collection(db, 'motivosRetiro'), { nombre: nombreMotivo });
        const nuevoMotivo = { id: docRef.id, nombre: nombreMotivo };
        setMotivosRetiro(prev => [...prev, nuevoMotivo].sort((a,b) => a.nombre.localeCompare(b.nombre)));
        toast.info(`Nuevo motivo "${nombreMotivo}" creado.`);
        return nuevoMotivo;
    } catch (error) {
        toast.error("No se pudo crear el nuevo motivo.");
        return { id: 'error-' + Date.now(), nombre: nombreMotivo };
    }
  };

  const handleCreateMotivoIngreso = async (nombreMotivo: string): Promise<MotivoIngreso> => {
    try {
        const docRef = await addDoc(collection(db, 'motivosIngreso'), { nombre: nombreMotivo });
        const nuevoMotivo = { id: docRef.id, nombre: nombreMotivo };
        setMotivosIngreso(prev => [...prev, nuevoMotivo].sort((a,b) => a.nombre.localeCompare(b.nombre)));
        toast.info(`Nuevo motivo de ingreso "${nombreMotivo}" creado.`);
        return nuevoMotivo;
    } catch (error) {
        toast.error("No se pudo crear el nuevo motivo.");
        return { id: 'error-' + Date.now(), nombre: nombreMotivo };
    }
  };

  const handleOpenDetailsModal = (registro: RegistroCaja) => {
    setRegistroSeleccionado(registro);
    setIsDetailsModalOpen(true);
  };
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setRegistroSeleccionado(null);
  };
  
  if (loadingCaja) {
    return <Spinner />;
  }

  return (
    <div className="page-container">
      <CajaActual
        caja={cajaActual}
        onAbrirCaja={() => setIsAbrirModalOpen(true)}
        onCerrarCaja={() => setIsCerrarModalOpen(true)}
      />

      <section className="config-section">
        <header className="page-header">
          <h2>Movimientos de Caja</h2>
          <div className="header-actions" style={{ flexDirection: 'row', gap: '10px' }}>
            <button className="primary-button" style={{backgroundColor: '#e8f5e9', borderColor: '#27ae60', color: '#27ae60'}} onClick={() => setIsIngresoModalOpen(true)} disabled={!cajaActual} title={!cajaActual ? "Abra la caja para hacer ingresos" : "Registrar un nuevo ingreso"}>
              Hacer Ingreso
            </button>
            <button 
              className="primary-button" 
              onClick={() => setIsRetiroModalOpen(true)} 
              disabled={!cajaActual} 
              title={!cajaActual ? "Debe abrir la caja para registrar retiros" : "Registrar un nuevo retiro"}
            >
              Hacer Retiro
            </button>
          </div>
        </header>

        {mode === 'admin' && (
          <div className="history-toggles-container">
            <div className="history-toggle">
              <button className="secondary-button" onClick={() => setShowIngresos(!showIngresos)}>
                {showIngresos ? <FaChevronUp/> : <FaChevronDown/>}
                <span>Historial de Ingresos</span>
              </button>
              {showIngresos && (
                <div className="history-filter">
                  <input type="date" className="filter-input" value={filterDateIngresos} onChange={e => setFilterDateIngresos(e.target.value)} />
                </div>
              )}
            </div>
            {showIngresos && (loadingIngresos ? <Spinner/> : <IngresosHistorial ingresos={historialIngresos} />)}

            <div className="history-toggle">
              <button className="secondary-button" onClick={() => setShowRetiros(!showRetiros)}>
                {showRetiros ? <FaChevronUp/> : <FaChevronDown/>}
                <span>Historial de Retiros</span>
              </button>
              {showRetiros && (
                <div className="history-filter">
                  <input type="date" className="filter-input" value={filterDateRetiros} onChange={e => setFilterDateRetiros(e.target.value)} />
                </div>
              )}
            </div>
            {showRetiros && (loadingRetiros ? <Spinner/> : <RetirosHistorial retiros={historialRetiros} />)}
          </div>
        )}
      </section>

      {mode === 'admin' && (
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
              <Spinner /> 
              : <HistorialCajaTable 
                  registros={historialCajas}
                  onVerDetalles={handleOpenDetailsModal}
                />
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
      )}

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
      {registroSeleccionado && (
        <Modal 
          isOpen={isDetailsModalOpen} 
          onClose={handleCloseDetailsModal} 
          title={`Detalle de Caja - ${new Date(registroSeleccionado.fechaApertura.toDate()).toLocaleDateString('es-AR')}`}
        >
          <CajaDetallesModal registro={registroSeleccionado} />
        </Modal>
      )}
      <Modal isOpen={isRetiroModalOpen} onClose={() => setIsRetiroModalOpen(false)} title="Registrar Nuevo Retiro">
          <RetiroFormModal 
            onClose={() => setIsRetiroModalOpen(false)}
            onSave={handleSaveRetiro}
            empleados={empleados}
            motivos={motivosRetiro}
            onCreateMotivo={handleCreateMotivoRetiro}
          />
      </Modal>
      <Modal isOpen={isIngresoModalOpen} onClose={() => setIsIngresoModalOpen(false)} title="Registrar Nuevo Ingreso">
          <IngresoFormModal 
            onClose={() => setIsIngresoModalOpen(false)}
            onSave={handleSaveIngreso}
            empleados={empleados}
            motivos={motivosIngreso}
            onCreateMotivo={handleCreateMotivoIngreso}
          />
      </Modal>
    </div>
  );
};

export default CajaPage;