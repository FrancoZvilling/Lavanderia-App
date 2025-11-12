import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
// 1. Separamos la importación del tipo 'Unsubscribe'
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from './AuthContext';
import type { RegistroCaja, Venta } from '../types';

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

    const qCajaAbierta = query(collection(db, 'cajas'), where('fechaCierre', '==', null));
    
    const unsubscribeCajas = onSnapshot(qCajaAbierta, (snapshotCajas) => {
      if (unsubscribeVentas) {
        unsubscribeVentas();
      }

      if (snapshotCajas.empty) {
        setCajaActual(null);
        setLoadingCaja(false);
      } else {
        const cajaAbiertaDoc = snapshotCajas.docs[0];
        const cajaAbiertaData = cajaAbiertaDoc.data();
        
        const qVentas = query(collection(db, 'ventas'), where('fecha', '>=', cajaAbiertaData.fechaApertura));
        
        unsubscribeVentas = onSnapshot(qVentas, (snapshotVentas) => {
          const ventasData = snapshotVentas.docs.map(doc => ({ id: doc.id, ...doc.data() } as Venta));
          
          const cajaAbiertaCompleta: RegistroCaja = {
            id: cajaAbiertaDoc.id,
            fechaApertura: cajaAbiertaData.fechaApertura,
            montoInicial: cajaAbiertaData.montoInicial,
            ventasDelDia: ventasData,
            fechaCierre: null,
            montoFinal: null
          };
          setCajaActual(cajaAbiertaCompleta);
          setLoadingCaja(false);
        });
      }
    }, (error) => {
      console.error("Error al escuchar estado de la caja:", error);
      setLoadingCaja(false);
    });

    return () => {
      unsubscribeCajas();
      if (unsubscribeVentas) {
        unsubscribeVentas();
      }
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