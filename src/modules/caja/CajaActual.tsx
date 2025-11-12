import { useMemo } from 'react';
import { FaPlayCircle, FaStopCircle } from 'react-icons/fa';
import type { RegistroCaja, MetodoDePago } from '../../types';
import './CajaActual.css';

interface CajaActualProps {
  caja: RegistroCaja | null;
  onAbrirCaja: () => void;
  onCerrarCaja: () => void;
}

const CajaActual: React.FC<CajaActualProps> = ({ caja, onAbrirCaja, onCerrarCaja }) => {
  const formatMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);
  }

  // Vista para cuando la caja está cerrada (sin cambios)
  if (!caja) {
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

  // --- NUEVA LÓGICA ---
  // Calculamos los subtotales por método de pago.
  // useMemo asegura que este cálculo solo se rehace si la lista de ventas cambia.
  const subtotales = useMemo(() => {
    const inicial = { Efectivo: 0, Transferencia: 0, Débito: 0, Crédito: 0 };
    if (!caja.ventasDelDia) return inicial;

    return caja.ventasDelDia.reduce((acc, venta) => {
      // Sumamos el monto de la venta al método de pago correspondiente
      acc[venta.metodoDePago] = (acc[venta.metodoDePago] || 0) + venta.montoTotal;
      return acc;
    }, inicial as Record<MetodoDePago, number>);
  }, [caja.ventasDelDia]);

  // La lógica para el total de ventas y el esperado en caja sigue igual
  const totalVentas = caja.ventasDelDia.reduce((sum, v) => sum + v.montoTotal, 0);
  const esperadoEnCaja = caja.montoInicial + totalVentas;

  return (
    <div className="caja-card abierta">
      <div className="caja-header">
        <h2>Estado de la Caja: <strong>Abierta</strong></h2>
        <button className="primary-button-danger" onClick={onCerrarCaja}>
          <FaStopCircle />
          <span>Cerrar Caja</span>
        </button>
      </div>
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

      {/* --- NUEVA SECCIÓN JSX --- */}
      {/* Mostramos los subtotales calculados */}
      <div className="caja-subtotals">
        <div className="subtotal-item">
          <span>Ingresos en Efectivo</span>
          <strong>{formatMoneda(subtotales.Efectivo)}</strong>
        </div>
        <div className="subtotal-item">
          <span>Ingresos por Transferencia</span>
          <strong>{formatMoneda(subtotales.Transferencia)}</strong>
        </div>
        <div className="subtotal-item">
          <span>Ingresos por Débito</span>
          <strong>{formatMoneda(subtotales.Débito)}</strong>
        </div>
        <div className="subtotal-item">
          <span>Ingresos por Crédito</span>
          <strong>{formatMoneda(subtotales.Crédito)}</strong>
        </div>
      </div>
    </div>
  );
};

export default CajaActual;