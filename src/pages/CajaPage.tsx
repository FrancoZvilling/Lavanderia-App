// src/pages/CajaPage.tsx

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, query, where, limit, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { toast } from 'react-toastify';
import CajaActual from '../modules/caja/CajaActual';
import HistorialCajaTable from '../modules/caja/HistorialCajaTable';
import AbrirCajaForm from '../modules/caja/AbrirCajaForm';
import CerrarCajaForm from '../modules/caja/CerrarCajaForm';
import Modal from '../components/Modal';
import type { RegistroCaja, Venta } from '../types';
import './VentasPage.css';

const CajaPage = () => {
  const [isAbrirModalOpen, setIsAbrirModalOpen] = useState(false);
  const [isCerrarModalOpen, setIsCerrarModalOpen] = useState(false);
  const [cajaActual, setCajaActual] = useState<RegistroCaja | null>(null);
  const [historialCajas, setHistorialCajas] = useState<RegistroCaja[]>([]);
  // Este estado ya no es necesario aquí, lo manejaremos dentro de cajaActual
  // const [ventasDelDia, setVentasDelDia] = useState<Venta[]>([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCajaData = async () => {
      try {
        const qCajaAbierta = query(collection(db, 'cajas'), where('fechaCierre', '==', null), limit(1));
        const cajaAbiertaSnapshot = await getDocs(qCajaAbierta);

        if (!cajaAbiertaSnapshot.empty) {
          const cajaAbiertaDoc = cajaAbiertaSnapshot.docs[0];
          const cajaAbiertaData = cajaAbiertaDoc.data();
          
          const qVentas = query(collection(db, 'ventas'), where('fecha', '>=', cajaAbiertaData.fechaApertura));
          const ventasSnapshot = await getDocs(qVentas);
          const ventasData = ventasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Venta));
          
          // ---- CORRECCIÓN 1: Construcción explícita del objeto ----
          const cajaAbiertaCompleta: RegistroCaja = {
            id: cajaAbiertaDoc.id,
            fechaApertura: cajaAbiertaData.fechaApertura,
            montoInicial: cajaAbiertaData.montoInicial,
            fechaCierre: cajaAbiertaData.fechaCierre,
            montoFinal: cajaAbiertaData.montoFinal,
            ventasDelDia: ventasData,
          };
          setCajaActual(cajaAbiertaCompleta);

        } else {
          const qHistorial = query(collection(db, 'cajas'), where('fechaCierre', '!=', null), orderBy('fechaCierre', 'desc'));
          const historialSnapshot = await getDocs(qHistorial);
          
          // ---- CORRECCIÓN 2: Construcción explícita del objeto ----
          const historialData = historialSnapshot.docs.map(doc => {
            const data = doc.data();
            const registro: RegistroCaja = {
              id: doc.id,
              fechaApertura: data.fechaApertura,
              montoInicial: data.montoInicial,
              fechaCierre: data.fechaCierre,
              montoFinal: data.montoFinal,
              ventasDelDia: [], // El historial no necesita cargar las ventas detalladas
            };
            return registro;
          });
          setHistorialCajas(historialData);
        }
      } catch (error) {
        console.error("Error al cargar datos de caja:", error);
        toast.error("Error al cargar los datos de caja.");
      } finally {
        setLoading(false);
      }
    };
    fetchCajaData();
  }, []);

  const handleAbrirCaja = async (montoInicial: number) => {
    try {
      const nuevaCajaData = {
        montoInicial,
        fechaApertura: Timestamp.fromDate(new Date()),
        fechaCierre: null,
        montoFinal: null,
      };
      const docRef = await addDoc(collection(db, 'cajas'), nuevaCajaData);
      
      // ---- CORRECCIÓN 3: Construcción explícita del objeto ----
      const cajaAbierta: RegistroCaja = {
        id: docRef.id,
        ...nuevaCajaData,
        ventasDelDia: [],
      };
      setCajaActual(cajaAbierta);
      
      setIsAbrirModalOpen(false);
      toast.success("Caja abierta con éxito.");
    } catch (error) {
      console.error("Error al abrir caja:", error);
      toast.error("No se pudo abrir la caja.");
    }
  };

  const handleCerrarCaja = async (montoFinal: number) => {
    if (!cajaActual) return;
    
    const cajaDocRef = doc(db, 'cajas', cajaActual.id);
    const fechaDeCierre = Timestamp.fromDate(new Date());

    try {
      await updateDoc(cajaDocRef, {
        montoFinal,
        fechaCierre: fechaDeCierre,
      });

      const cajaCerrada: RegistroCaja = { ...cajaActual, montoFinal, fechaCierre: fechaDeCierre };
      setHistorialCajas(prev => [cajaCerrada, ...prev]);
      setCajaActual(null);
      setIsCerrarModalOpen(false);
      toast.success("Caja cerrada con éxito.");

    } catch (error) {
      console.error("Error al cerrar caja:", error);
      toast.error("No se pudo cerrar la caja.");
    }
  };
  
  if (loading) {
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
        <header className="page-header">
          <h1>Historial de Cajas</h1>
        </header>
        <HistorialCajaTable registros={historialCajas} />
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