import { useMemo, useState } from 'react';
import { FaPlayCircle, FaStopCircle } from 'react-icons/fa';
import type { RegistroCaja, MetodoDePago } from '../../types';
import Modal from '../../components/Modal';
import DesgloseBilletesModal from './DesgloseBilletesModal';
import './CajaActual.css';

interface CajaActualProps {
  caja: RegistroCaja | null;
  onAbrirCaja: () => void;
  onCerrarCaja: () => void;
}

const CajaActual: React.FC<CajaActualProps> = ({ caja, onAbrirCaja, onCerrarCaja }) => {
  // --- CORRECCIÓN CLAVE: Todos los Hooks se declaran al principio, antes de cualquier 'return' o condición. ---
  const [showDesgloseApertura, setShowDesgloseApertura] = useState(false);

  const { 
    ingresosTotalesVentas,
    ingresosEnEfectivo, 
    ingresosManualesEnEfectivo,
    retirosEnEfectivo,
    esperadoEnCaja,
    subtotalesIngresos,
    subtotalesRetiros,
    subtotalesIngresosManuales
  } = useMemo(() => {
    // Si la caja está cerrada, retornamos valores por defecto para que los hooks no rompan.
    if (!caja) {
      return {
        ingresosTotalesVentas: 0,
        ingresosEnEfectivo: 0,
        ingresosManualesEnEfectivo: 0,
        retirosEnEfectivo: 0,
        esperadoEnCaja: 0,
        subtotalesIngresos: { Efectivo: 0, Transferencia: 0, Débito: 0, Crédito: 0 },
        subtotalesRetiros: { Efectivo: 0, Transferencia: 0 },
        subtotalesIngresosManuales: { Efectivo: 0, Transferencia: 0 }
      };
    }

    // Si la caja está abierta, realizamos los cálculos como antes.
    const sIngresos = (caja.ventasDelDia || []).reduce((acc, venta) => {
      acc[venta.metodoDePago] = (acc[venta.metodoDePago] || 0) + venta.montoTotal;
      return acc;
    }, { Efectivo: 0, Transferencia: 0, Débito: 0, Crédito: 0 } as Record<MetodoDePago, number>);
    
    const sRetiros = (caja.retirosDelDia || []).reduce((acc, retiro) => {
      acc[retiro.metodo] = (acc[retiro.metodo] || 0) + retiro.monto;
      return acc;
    }, { Efectivo: 0, Transferencia: 0 } as Record<'Efectivo' | 'Transferencia', number>);

    const sIngresosManuales = (caja.ingresosDelDia || []).reduce((acc, ingreso) => {
        acc[ingreso.metodo] = (acc[ingreso.metodo] || 0) + ingreso.monto;
        return acc;
    }, { Efectivo: 0, Transferencia: 0 } as Record<'Efectivo' | 'Transferencia', number>);

    const totalVentas = Object.values(sIngresos).reduce((sum, current) => sum + current, 0);
    const esperado = caja.montoInicial + sIngresos.Efectivo + sIngresosManuales.Efectivo - sRetiros.Efectivo;
    
    return { 
      ingresosTotalesVentas: totalVentas, 
      ingresosEnEfectivo: sIngresos.Efectivo,
      ingresosManualesEnEfectivo: sIngresosManuales.Efectivo,
      retirosEnEfectivo: sRetiros.Efectivo,
      esperadoEnCaja: esperado,
      subtotalesIngresos: sIngresos,
      subtotalesRetiros: sRetiros,
      subtotalesIngresosManuales: sIngresosManuales,
    };
  }, [caja]); // El cálculo ahora solo depende del objeto 'caja'

  const formatMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);
  };

  // --- La lógica condicional para la caja cerrada ahora viene DESPUÉS de todos los hooks ---
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

  return (
    <>
      <div className="caja-card abierta">
        <div className="caja-header">
          <h2>Estado de la Caja: <strong>Abierta</strong></h2>
          <button className="primary-button-danger" onClick={onCerrarCaja}>
            <FaStopCircle />
            <span>Cerrar Caja</span>
          </button>
        </div>
        
        <div className="caja-details four-columns">
          <div 
            className={caja.desgloseApertura ? 'clickable-widget' : ''} 
            onClick={() => caja.desgloseApertura && setShowDesgloseApertura(true)}
            title={caja.desgloseApertura ? "Ver desglose de billetes de apertura" : "No hay desglose guardado para esta apertura"}
          >
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
        
        <div className="caja-subtotals">
          <div className="subtotal-item"><span>Ventas Efectivo</span><strong>{formatMoneda(subtotalesIngresos.Efectivo)}</strong></div>
          <div className="subtotal-item"><span>Ventas Transf.</span><strong>{formatMoneda(subtotalesIngresos.Transferencia)}</strong></div>
          <div className="subtotal-item"><span>Ventas Débito</span><strong>{formatMoneda(subtotalesIngresos.Débito)}</strong></div>
          <div className="subtotal-item"><span>Ventas Crédito</span><strong>{formatMoneda(subtotalesIngresos.Crédito)}</strong></div>
          <div className="subtotal-item ingreso-manual"><span>Ing. Manual Efectivo</span><strong>{formatMoneda(subtotalesIngresosManuales.Efectivo)}</strong></div>
          <div className="subtotal-item ingreso-manual"><span>Ing. Manual Transf.</span><strong>{formatMoneda(subtotalesIngresosManuales.Transferencia)}</strong></div>
          <div className="subtotal-item egreso"><span>Retiros Efectivo</span><strong>{formatMoneda(subtotalesRetiros.Efectivo)}</strong></div>
          <div className="subtotal-item egreso"><span>Retiros Transf.</span><strong>{formatMoneda(subtotalesRetiros.Transferencia)}</strong></div>
          <div className="subtotal-item total-general">
              <span>Ingresos Totales (Ventas)</span>
              <strong>{formatMoneda(ingresosTotalesVentas)}</strong>
          </div>
        </div>
      </div>

      {caja.desgloseApertura && (
        <Modal isOpen={showDesgloseApertura} onClose={() => setShowDesgloseApertura(false)} title="Desglose de Billetes de Apertura">
          <DesgloseBilletesModal desglose={caja.desgloseApertura} />
        </Modal>
      )}
    </>
  );
};

export default CajaActual;