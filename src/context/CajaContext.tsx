import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from './AuthContext';
import type { RegistroCaja, Venta, Retiro, Ingreso } from '../types';

interface CajaContextType {
  cajaActual: RegistroCaja | null;
  loadingCaja: boolean;
}

const CajaContext = createContext<CajaContextType | undefined>(undefined);

export const CajaProvider = ({ children }: { children: ReactNode }) => {
  const [cajaActual, setCajaActual] = useState<RegistroCaja | null>(null);
  const [loadingCaja, setLoadingCaja] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setCajaActual(null);
      setLoadingCaja(false);
      return;
    }

    let unsubscribeVentas: Unsubscribe | null = null;
    let unsubscribeRetiros: Unsubscribe | null = null;
    let unsubscribeIngresos: Unsubscribe | null = null; // Listener para ingresos

    const qCajaAbierta = query(collection(db, 'cajas'), where('fechaCierre', '==', null));
    
    const unsubscribeCajas = onSnapshot(qCajaAbierta, (snapshotCajas) => {
      // Limpiamos listeners anidados de la iteración anterior
      if (unsubscribeVentas) unsubscribeVentas();
      if (unsubscribeRetiros) unsubscribeRetiros();
      if (unsubscribeIngresos) unsubscribeIngresos();

      if (snapshotCajas.empty) {
        setCajaActual(null);
        setLoadingCaja(false);
      } else {
        const cajaAbiertaDoc = snapshotCajas.docs[0];
        const cajaAbiertaData = cajaAbiertaDoc.data();
        
        // Creamos listeners anidados para ventas, retiros e ingresos de la caja actual
        const qVentas = query(collection(db, 'ventas'), where('cajaId', '==', cajaAbiertaDoc.id));
        const qRetiros = query(collection(db, 'retiros'), where('cajaId', '==', cajaAbiertaDoc.id));
        const qIngresos = query(collection(db, 'ingresos'), where('cajaId', '==', cajaAbiertaDoc.id));

        let ventasData: Venta[] = [];
        let retirosData: Retiro[] = [];
        let ingresosData: Ingreso[] = []; // Array para los datos de ingresos
        let listenersReady = { ventas: false, retiros: false, ingresos: false };

        const updateCajaActual = () => {
          // Solo actualizamos el estado cuando los tres listeners hayan cargado su data inicial
          if (listenersReady.ventas && listenersReady.retiros && listenersReady.ingresos) {
            const cajaCompleta: RegistroCaja = {
              id: cajaAbiertaDoc.id,
              fechaApertura: cajaAbiertaData.fechaApertura,
              montoInicial: cajaAbiertaData.montoInicial,
              diferenciaApertura: cajaAbiertaData.diferenciaApertura,
              empleadoId: cajaAbiertaData.empleadoId,
              empleadoNombre: cajaAbiertaData.empleadoNombre,
              ventasDelDia: ventasData,
              retirosDelDia: retirosData,
              ingresosDelDia: ingresosData, // Añadimos los ingresos al objeto
              fechaCierre: null,
              montoFinal: null
            };
            setCajaActual(cajaCompleta);
            setLoadingCaja(false);
          }
        };
        
        unsubscribeVentas = onSnapshot(qVentas, (snapshot) => {
          ventasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Venta));
          listenersReady.ventas = true;
          updateCajaActual();
        });

        unsubscribeRetiros = onSnapshot(qRetiros, (snapshot) => {
          retirosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Retiro));
          listenersReady.retiros = true;
          updateCajaActual();
        });

        // Establecemos el listener para los ingresos manuales
        unsubscribeIngresos = onSnapshot(qIngresos, (snapshot) => {
          ingresosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ingreso));
          listenersReady.ingresos = true;
          updateCajaActual();
        });
      }
    }, (error) => {
      console.error("Error al escuchar estado de la caja:", error);
      setLoadingCaja(false);
    });

    // Función de limpieza final
    return () => {
      unsubscribeCajas();
      if (unsubscribeVentas) unsubscribeVentas();
      if (unsubscribeRetiros) unsubscribeRetiros();
      if (unsubscribeIngresos) unsubscribeIngresos();
    };
  }, [currentUser]);

  const value = { cajaActual, loadingCaja };

  return <CajaContext.Provider value={value}>{children}</CajaContext.Provider>;
};

export const useCaja = (): CajaContextType => {
  const context = useContext(CajaContext);
  if (context === undefined) {
    throw new Error('useCaja must be used within a CajaProvider');
  }
  return context;
};