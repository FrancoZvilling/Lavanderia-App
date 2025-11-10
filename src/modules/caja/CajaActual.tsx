import React from 'react';
import { FaPlayCircle, FaStopCircle } from 'react-icons/fa';
import type { RegistroCaja } from '../../types';
import './CajaActual.css';

interface CajaActualProps {
  caja: RegistroCaja | null;
  onAbrirCaja: () => void;
  onCerrarCaja: () => void; // 1. Añadimos la nueva prop
}

const CajaActual: React.FC<CajaActualProps> = ({ caja, onAbrirCaja, onCerrarCaja }) => {
  // ... (la función formatMoneda sigue igual)
  const formatMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);
  }

  if (!caja) {
    // ... (la vista de caja cerrada sigue igual)
    return (
      <div className="caja-card cerrada">
        <div className="caja-info">
          <h2>Estado de la Caja: <strong>Cerrada</strong></h2>
          <p>Para comenzar a registrar ventas, primero debe abrir la caja.</p>
        </div>
        <button className="primary-button open-caja-btn" onClick={onAbrirCaja}>
          <FaPlayCircle />
          <span>Abrir Caja</span>
        </button>
      </div>
    );
  }

  const totalVentas = caja.ventasDelDia.reduce((sum, v) => sum + v.montoTotal, 0);
  const esperadoEnCaja = caja.montoInicial + totalVentas;

  return (
    <div className="caja-card abierta">
      <div className="caja-header">
        <h2>Estado de la Caja: <strong>Abierta</strong></h2>
        {/* 2. El botón ahora dispara el evento onCerrarCaja */}
        <button className="primary-button-danger" onClick={onCerrarCaja}>
          <FaStopCircle />
          <span>Cerrar Caja</span>
        </button>
      </div>
      {/* ... (la sección caja-details sigue igual) ... */}
      <div className="caja-details">
        <div>
          <span>Monto Inicial</span>
          <strong>{formatMoneda(caja.montoInicial)}</strong>
        </div>
        <div>
          <span>Ventas del Día</span>
          <strong>{formatMoneda(totalVentas)}</strong>
        </div>
        <div>
          <span>Esperado en Caja</span>
          <strong>{formatMoneda(esperadoEnCaja)}</strong>
        </div>
      </div>
    </div>
  );
};

export default CajaActual;