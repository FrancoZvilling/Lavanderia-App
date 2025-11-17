// 1. Importamos explícitamente el tipo 'ReactNode' que necesitamos
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

// 2. Usamos 'ReactNode' en lugar del tipo global 'JSX.Element'
export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>; // Envolvemos children en un Fragment para asegurar que sea una expresión JSX válida
};