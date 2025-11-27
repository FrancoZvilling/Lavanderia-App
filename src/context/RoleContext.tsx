import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import bcrypt from 'bcryptjs';
import { toast } from 'react-toastify';

type Mode = 'admin' | 'empleado';

interface RoleContextType {
  mode: Mode;
  switchToEmpleadoMode: () => void;
  switchToAdminMode: (pin: string) => Promise<boolean>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

// Función que se ejecuta al inicio para leer el modo desde localStorage
const getInitialMode = (): Mode => {
  try {
    const savedMode = localStorage.getItem('app-mode');
    // Si el valor guardado es 'admin' o 'empleado', lo usamos.
    if (savedMode === 'admin' || savedMode === 'empleado') {
      return savedMode;
    }
  } catch (error) {
    console.error("Error al leer el modo desde localStorage:", error);
  }
  // Si no hay nada guardado o hay un error, el valor por defecto es 'empleado'.
  return 'empleado';
};

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  // El estado inicial ahora se determina por la función getInitialMode
  const [mode, setMode] = useState<Mode>(getInitialMode);

  // Este useEffect se dispara cada vez que el 'mode' cambia
  useEffect(() => {
    try {
      // Guardamos el nuevo modo en localStorage
      localStorage.setItem('app-mode', mode);
    } catch (error) {
      console.error("Error al guardar el modo en localStorage:", error);
    }
  }, [mode]);

  const switchToEmpleadoMode = useCallback(() => {
    setMode('empleado'); // Al cambiar, el useEffect de arriba se encargará de guardar
    toast.info("Cambiado a Modo Empleado.");
  }, []);

  const switchToAdminMode = useCallback(async (pin: string): Promise<boolean> => {
    try {
      const securityDocRef = doc(db, 'configuracion', 'seguridad');
      const docSnap = await getDoc(securityDocRef);

      if (docSnap.exists() && docSnap.data().adminPinHash) {
        const hash = docSnap.data().adminPinHash;
        const isPinValid = bcrypt.compareSync(pin, hash);

        if (isPinValid) {
          setMode('admin'); // Al cambiar, el useEffect de arriba se encargará de guardar
          toast.success("Cambiado a Modo Administrador.");
          return true;
        } else {
          toast.error("PIN de Administrador incorrecto.");
          return false;
        }
      } else {
        toast.warn("No hay PIN de Administrador configurado. Acceso concedido.");
        setMode('admin'); // Al cambiar, el useEffect de arriba se encargará de guardar
        return true;
      }
    } catch (error) {
      console.error("Error al verificar el PIN de admin:", error);
      toast.error("Error al verificar el PIN.");
      return false;
    }
  }, []);

  const value = { mode, switchToEmpleadoMode, switchToAdminMode };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};