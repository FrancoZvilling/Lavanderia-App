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

  // --- LÓGICA DE CÁLCULO MEJORADA CON RETIROS ---
  const { 
    ingresosTotales, 
    ingresosEnEfectivo, 
    retirosEnEfectivo,
    retirosEnTransferencia,
    subtotalesIngresos 
  } = useMemo(() => {
    const subtotales = (caja.ventasDelDia || []).reduce((acc, venta) => {
      acc[venta.metodoDePago] = (acc[venta.metodoDePago] || 0) + venta.montoTotal;
      return acc;
    }, { Efectivo: 0, Transferencia: 0, Débito: 0, Crédito: 0 } as Record<MetodoDePago, number>);

    const retirosEfectivo = (caja.retirosDelDia || []).filter(r => r.metodo === 'Efectivo').reduce((sum, r) => sum + r.monto, 0);
    const retirosTransferencia = (caja.retirosDelDia || []).filter(r => r.metodo === 'Transferencia').reduce((sum, r) => sum + r.monto, 0);

    const totalVentas = Object.values(subtotales).reduce((sum, current) => sum + current, 0);
    
    return { 
      ingresosTotales: totalVentas, 
      ingresosEnEfectivo: subtotales.Efectivo,
      retirosEnEfectivo: retirosEfectivo,
      retirosEnTransferencia: retirosTransferencia,
      subtotalesIngresos: subtotales 
    };
  }, [caja.ventasDelDia, caja.retirosDelDia]);

  // --- CÁLCULO FINAL Y CORRECTO DEL ESPERADO EN CAJA ---
  const esperadoEnCaja = caja.montoInicial + ingresosEnEfectivo - retirosEnEfectivo;

  return (
    <div className="caja-card abierta">
      <div className="caja-header">
        <h2>Estado de la Caja: <strong>Abierta</strong></h2>
        <button className="primary-button-danger" onClick={onCerrarCaja}>
          <FaStopCircle />
          <span>Cerrar Caja</span>
        </button>
      </div>
      
      <div className="caja-details four-columns">
        <div>
          <span>Monto Inicial</span>
          <strong>{formatMoneda(caja.montoInicial)}</strong>
        </div>
        <div>
          <span>+ Ingresos Efectivo</span>
          <strong>{formatMoneda(ingresosEnEfectivo)}</strong>
        </div>
        <div>
          <span>- Retiros Efectivo</span>
          <strong className="retiro-valor">{formatMoneda(retirosEnEfectivo)}</strong>
        </div>
        <div>
          <span>= Esperado en Caja</span>
          <strong className="esperado-total">{formatMoneda(esperadoEnCaja)}</strong>
        </div>
      </div>
      
      <div className="caja-subtotals">
        {/* Ingresos */}
        <div className="subtotal-item"><span>Ing. Efectivo</span><strong>{formatMoneda(subtotalesIngresos.Efectivo)}</strong></div>
        <div className="subtotal-item"><span>Ing. Transferencia</span><strong>{formatMoneda(subtotalesIngresos.Transferencia)}</strong></div>
        <div className="subtotal-item"><span>Ing. Débito</span><strong>{formatMoneda(subtotalesIngresos.Débito)}</strong></div>
        <div className="subtotal-item"><span>Ing. Crédito</span><strong>{formatMoneda(subtotalesIngresos.Crédito)}</strong></div>
        {/* Egresos */}
        <div className="subtotal-item egreso"><span>Ret. Efectivo</span><strong>{formatMoneda(retirosEnEfectivo)}</strong></div>
        <div className="subtotal-item egreso"><span>Ret. Transferencia</span><strong>{formatMoneda(retirosEnTransferencia)}</strong></div>
        {/* Totales */}
        <div className="subtotal-item total-general">
            <span>Ingresos Totales del Día</span>
            <strong>{formatMoneda(ingresosTotales)}</strong>
        </div>
      </div>
    </div>
  );
};

export default CajaActual;