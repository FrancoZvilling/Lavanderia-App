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

  // --- LÓGICA DE CÁLCULO ACTUALIZADA Y MEJORADA ---
  const { ingresosTotales, ingresosEnEfectivo, subtotales } = useMemo(() => {
    const subtotalesIniciales = { Efectivo: 0, Transferencia: 0, Débito: 0, Crédito: 0 };
    if (!caja.ventasDelDia || caja.ventasDelDia.length === 0) {
      return { ingresosTotales: 0, ingresosEnEfectivo: 0, subtotales: subtotalesIniciales };
    }

    const subtotalesCalculados = caja.ventasDelDia.reduce((acc, venta) => {
      acc[venta.metodoDePago] = (acc[venta.metodoDePago] || 0) + venta.montoTotal;
      return acc;
    }, subtotalesIniciales as Record<MetodoDePago, number>);

    const total = Object.values(subtotalesCalculados).reduce((sum, current) => sum + current, 0);
    const efectivo = subtotalesCalculados.Efectivo;

    return { ingresosTotales: total, ingresosEnEfectivo: efectivo, subtotales: subtotalesCalculados };
  }, [caja.ventasDelDia]);

  // El esperado en caja ahora se calcula solo con el efectivo
  const esperadoEnCaja = caja.montoInicial + ingresosEnEfectivo;

  return (
    <div className="caja-card abierta">
      <div className="caja-header">
        <h2>Estado de la Caja: <strong>Abierta</strong></h2>
        <button className="primary-button-danger" onClick={onCerrarCaja}>
          <FaStopCircle />
          <span>Cerrar Caja</span>
        </button>
      </div>
      
      {/* --- WIDGETS PRINCIPALES ACTUALIZADOS --- */}
      <div className="caja-details four-columns">
        <div>
          <span>Monto Inicial</span>
          <strong>{formatMoneda(caja.montoInicial)}</strong>
        </div>
        <div>
          <span>Ingresos en Efectivo</span>
          <strong>{formatMoneda(ingresosEnEfectivo)}</strong>
        </div>
        <div>
          <span>Ingresos Totales (Día)</span>
          <strong>{formatMoneda(ingresosTotales)}</strong>
        </div>
        <div>
          <span>Esperado en Caja (Efectivo)</span>
          <strong className="esperado-total">{formatMoneda(esperadoEnCaja)}</strong>
        </div>
      </div>
      
      {/* --- WIDGETS SECUNDARIOS (DESGLOSE) --- */}
      <div className="caja-subtotals">
        <div className="subtotal-item">
          <span>Detalle Efectivo</span>
          <strong>{formatMoneda(subtotales.Efectivo)}</strong>
        </div>
        <div className="subtotal-item">
          <span>Detalle Transferencia</span>
          <strong>{formatMoneda(subtotales.Transferencia)}</strong>
        </div>
        <div className="subtotal-item">
          <span>Detalle Débito</span>
          <strong>{formatMoneda(subtotales.Débito)}</strong>
        </div>
        <div className="subtotal-item">
          <span>Detalle Crédito</span>
          <strong>{formatMoneda(subtotales.Crédito)}</strong>
        </div>
      </div>
    </div>
  );
};

export default CajaActual;