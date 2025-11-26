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

  // --- LÓGICA DE CÁLCULO FINAL Y COMPLETA CON INGRESOS MANUALES ---
  const { 
    ingresosTotalesVentas,
    ingresosEnEfectivo, 
    ingresosManualesEnEfectivo,
    retirosEnEfectivo,
    subtotalesIngresos,
    subtotalesRetiros,
    subtotalesIngresosManuales
  } = useMemo(() => {
    // Calcula subtotales de ingresos por ventas
    const sIngresos = (caja.ventasDelDia || []).reduce((acc, venta) => {
      acc[venta.metodoDePago] = (acc[venta.metodoDePago] || 0) + venta.montoTotal;
      return acc;
    }, { Efectivo: 0, Transferencia: 0, Débito: 0, Crédito: 0 } as Record<MetodoDePago, number>);
    
    // Calcula subtotales de retiros
    const sRetiros = (caja.retirosDelDia || []).reduce((acc, retiro) => {
      acc[retiro.metodo] = (acc[retiro.metodo] || 0) + retiro.monto;
      return acc;
    }, { Efectivo: 0, Transferencia: 0 } as Record<'Efectivo' | 'Transferencia', number>);

    // Calcula subtotales de ingresos manuales
    const sIngresosManuales = (caja.ingresosDelDia || []).reduce((acc, ingreso) => {
        acc[ingreso.metodo] = (acc[ingreso.metodo] || 0) + ingreso.monto;
        return acc;
    }, { Efectivo: 0, Transferencia: 0 } as Record<'Efectivo' | 'Transferencia', number>);

    const totalVentas = Object.values(sIngresos).reduce((sum, current) => sum + current, 0);
    
    return { 
      ingresosTotalesVentas: totalVentas, 
      ingresosEnEfectivo: sIngresos.Efectivo,
      ingresosManualesEnEfectivo: sIngresosManuales.Efectivo,
      retirosEnEfectivo: sRetiros.Efectivo,
      subtotalesIngresos: sIngresos,
      subtotalesRetiros: sRetiros,
      subtotalesIngresosManuales: sIngresosManuales,
    };
  }, [caja.ventasDelDia, caja.retirosDelDia, caja.ingresosDelDia]);

  // --- FÓRMULA FINAL Y CORRECTA DEL ESPERADO EN CAJA ---
  const esperadoEnCaja = caja.montoInicial + ingresosEnEfectivo + ingresosManualesEnEfectivo - retirosEnEfectivo;

  return (
    <div className="caja-card abierta">
      <div className="caja-header">
        <h2>Estado de la Caja: <strong>Abierta</strong></h2>
        <button className="primary-button-danger" onClick={onCerrarCaja}>
          <FaStopCircle />
          <span>Cerrar Caja</span>
        </button>
      </div>
      
      {/* --- WIDGETS PRINCIPALES CON LA FÓRMULA COMPLETA --- */}
      <div className="caja-details four-columns">
        <div>
          <span>Monto Inicial</span>
          <strong>{formatMoneda(caja.montoInicial)}</strong>
        </div>
        <div>
          <span>+ Ing. Efectivo (Ventas)</span>
          <strong>{formatMoneda(ingresosEnEfectivo)}</strong>
        </div>
        <div>
          <span>+ Ing. Efectivo (Manual)</span>
          <strong>{formatMoneda(ingresosManualesEnEfectivo)}</strong>
        </div>
        <div>
          <span>- Retiros Efectivo</span>
          <strong className="retiro-valor">{formatMoneda(retirosEnEfectivo)}</strong>
        </div>
      </div>
      <div className="caja-details-total">
        <span>= Esperado en Caja (Efectivo)</span>
        <strong className="esperado-total">{formatMoneda(esperadoEnCaja)}</strong>
      </div>
      
      {/* --- WIDGETS DE SUBTOTALES CON EL DESGLOSE COMPLETO --- */}
      <div className="caja-subtotals">
        {/* Ingresos por Ventas */}
        <div className="subtotal-item"><span>Ventas Efectivo</span><strong>{formatMoneda(subtotalesIngresos.Efectivo)}</strong></div>
        <div className="subtotal-item"><span>Ventas Transf.</span><strong>{formatMoneda(subtotalesIngresos.Transferencia)}</strong></div>
        <div className="subtotal-item"><span>Ventas Débito</span><strong>{formatMoneda(subtotalesIngresos.Débito)}</strong></div>
        <div className="subtotal-item"><span>Ventas Crédito</span><strong>{formatMoneda(subtotalesIngresos.Crédito)}</strong></div>
        
        {/* Ingresos Manuales */}
        <div className="subtotal-item ingreso-manual"><span>Ing. Manual Efectivo</span><strong>{formatMoneda(subtotalesIngresosManuales.Efectivo)}</strong></div>
        <div className="subtotal-item ingreso-manual"><span>Ing. Manual Transf.</span><strong>{formatMoneda(subtotalesIngresosManuales.Transferencia)}</strong></div>
        
        {/* Egresos */}
        <div className="subtotal-item egreso"><span>Retiros Efectivo</span><strong>{formatMoneda(subtotalesRetiros.Efectivo)}</strong></div>
        <div className="subtotal-item egreso"><span>Retiros Transf.</span><strong>{formatMoneda(subtotalesRetiros.Transferencia)}</strong></div>

        {/* Totales */}
        <div className="subtotal-item total-general">
            <span>Ingresos Totales (Ventas)</span>
            <strong>{formatMoneda(ingresosTotalesVentas)}</strong>
        </div>
      </div>
    </div>
  );
};

export default CajaActual;