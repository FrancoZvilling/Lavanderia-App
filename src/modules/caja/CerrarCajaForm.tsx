import { useState, useMemo } from 'react';
import type { RegistroCaja} from '../../types';
import '../ventas/AddSaleForm.css';
import './CerrarCajaForm.css';

interface CerrarCajaFormProps {
  caja: RegistroCaja;
  onClose: () => void;
  onConfirm: (montoFinal: number) => void;
}

const CerrarCajaForm: React.FC<CerrarCajaFormProps> = ({ caja, onClose, onConfirm }) => {
  const [montoFinalContado, setMontoFinalContado] = useState('');

  // --- LÓGICA DE CÁLCULO ACTUALIZADA PARA INCLUIR RETIROS ---
  const { ingresosTotales, ingresosEnEfectivo, retirosEnEfectivo, esperadoEnCaja, arqueo } = useMemo(() => {
    const montoFinalNum = parseFloat(montoFinalContado) || 0;
    
    const totalVentas = (caja.ventasDelDia || []).reduce((sum, v) => sum + v.montoTotal, 0);
    
    const totalIngresosEfectivo = (caja.ventasDelDia || [])
      .filter(v => v.metodoDePago === 'Efectivo')
      .reduce((sum, v) => sum + v.montoTotal, 0);
      
    // Calculamos los retiros en efectivo que ocurrieron durante la sesión
    const totalRetirosEfectivo = (caja.retirosDelDia || [])
      .filter(r => r.metodo === 'Efectivo')
      .reduce((sum, r) => sum + r.monto, 0);

    // La fórmula correcta para lo esperado en caja
    const esperado = caja.montoInicial + totalIngresosEfectivo - totalRetirosEfectivo;
    
    const diferencia = montoFinalNum - esperado;
    
    return { 
      ingresosTotales: totalVentas, 
      ingresosEnEfectivo: totalIngresosEfectivo,
      retirosEnEfectivo: totalRetirosEfectivo,
      esperadoEnCaja: esperado, 
      arqueo: diferencia 
    };
  }, [caja, montoFinalContado]);

  const handleSubmit = () => {
    const montoFinalNum = parseFloat(montoFinalContado);
    if (!isNaN(montoFinalNum) && montoFinalNum >= 0) {
      onConfirm(montoFinalNum);
    } else {
      alert('Por favor, ingrese un monto final válido.');
    }
  };
  
  const formatMoneda = (monto: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);
  const getArqueoClass = (val: number) => val === 0 ? 'arqueo-ok' : val > 0 ? 'arqueo-sobrante' : 'arqueo-faltante';

  return (
    <form className="add-sale-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div className="summary-grid">
        <div className="summary-total">Ingresos Totales del Día:</div>
        <div className="summary-total">{formatMoneda(ingresosTotales)}</div>
      </div>
      
      <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />

      {/* --- RESUMEN DE ARQUEO ACTUALIZADO --- */}
      <div className="summary-grid">
        <div>Monto Inicial (Efectivo):</div>
        <div>{formatMoneda(caja.montoInicial)}</div>
        <div>+ Ingresos en Efectivo:</div>
        <div>{formatMoneda(ingresosEnEfectivo)}</div>
        {/* Mostramos los retiros para que el cálculo sea transparente */}
        <div>- Retiros en Efectivo:</div>
        <div style={{color: '#e74c3c'}}>{formatMoneda(retirosEnEfectivo)}</div>
        <div className="summary-total">Total Esperado en Caja (Efectivo):</div>
        <div className="summary-total">{formatMoneda(esperadoEnCaja)}</div>
      </div>

      <div className="form-group">
        <label htmlFor="montoFinal">Monto Final Contado (Efectivo)</label>
        <input
          type="number"
          id="montoFinal"
          placeholder="Ingrese el dinero contado en caja"
          value={montoFinalContado}
          onChange={(e) => setMontoFinalContado(e.target.value)}
          autoFocus
        />
      </div>

      {montoFinalContado && (
        <div className="summary-grid arqueo-section">
          <div className="summary-total">Arqueo (Diferencia de Efectivo):</div>
          <div className={`summary-total ${getArqueoClass(arqueo)}`}>
            {formatMoneda(arqueo)}
          </div>
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
        <button type="submit" className="primary-button-danger">Confirmar Cierre</button>
      </div>
    </form>
  );
};

export default CerrarCajaForm;