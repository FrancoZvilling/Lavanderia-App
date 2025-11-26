import { useState, useMemo } from 'react';
import type { RegistroCaja } from '../../types';
// 1. Importamos BillCounter y su tipo BillCounts
import BillCounter, { type BillCounts } from './BillCounter';
import '../ventas/AddSaleForm.css';
import './CerrarCajaForm.css';

interface CerrarCajaFormProps {
  caja: RegistroCaja;
  onClose: () => void;
  // 2. Actualizamos la firma de onConfirm para que espere el desglose
  onConfirm: (montoFinal: number, desglose: BillCounts) => void;
}

const CerrarCajaForm: React.FC<CerrarCajaFormProps> = ({ caja, onClose, onConfirm }) => {
  const [montoFinalContado, setMontoFinalContado] = useState<number>(0);
  // 3. Nuevo estado para guardar el desglose de billetes del cierre
  const [desgloseCierre, setDesgloseCierre] = useState<BillCounts>({});

  const { ingresosTotales, ingresosEnEfectivo, retirosEnEfectivo, esperadoEnCaja, arqueo } = useMemo(() => {
    const totalVentas = (caja.ventasDelDia || []).reduce((sum, v) => sum + v.montoTotal, 0);
    
    const totalIngresosEfectivo = (caja.ventasDelDia || [])
      .filter(v => v.metodoDePago === 'Efectivo')
      .reduce((sum, v) => sum + v.montoTotal, 0);
      
    const totalRetirosEfectivo = (caja.retirosDelDia || [])
      .filter(r => r.metodo === 'Efectivo')
      .reduce((sum, r) => sum + r.monto, 0);

    const esperado = caja.montoInicial + totalIngresosEfectivo - totalRetirosEfectivo;
    
    const diferencia = montoFinalContado - esperado;
    
    return { 
      ingresosTotales: totalVentas, 
      ingresosEnEfectivo: totalIngresosEfectivo,
      retirosEnEfectivo: totalRetirosEfectivo,
      esperadoEnCaja: esperado, 
      arqueo: diferencia 
    };
  }, [caja, montoFinalContado]);

  // 4. Nueva función para manejar el cambio del BillCounter
  const handleCounterChange = (data: { total: number; counts: BillCounts }) => {
    setMontoFinalContado(data.total);
    setDesgloseCierre(data.counts);
  };

  const handleSubmit = () => {
    // 5. Pasamos tanto el monto final como el desglose al confirmar
    onConfirm(montoFinalContado, desgloseCierre);
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

      <div className="summary-grid">
        <div>Monto Inicial (Efectivo):</div>
        <div>{formatMoneda(caja.montoInicial)}</div>
        <div>+ Ingresos en Efectivo:</div>
        <div>{formatMoneda(ingresosEnEfectivo)}</div>
        <div>- Retiros en Efectivo:</div>
        <div style={{color: '#e74c3c'}}>{formatMoneda(retirosEnEfectivo)}</div>
        <div className="summary-total">Total Esperado en Caja (Efectivo):</div>
        <div className="summary-total">{formatMoneda(esperadoEnCaja)}</div>
      </div>

      <div className="form-group">
        <label>Conteo de Dinero Final (Efectivo)</label>
        {/* 6. Usamos el BillCounter con su nueva función */}
        <BillCounter onChange={handleCounterChange} />
      </div>

      <div className="summary-grid arqueo-section">
        <div className="summary-total">Arqueo (Diferencia de Efectivo):</div>
        <div className={`summary-total ${getArqueoClass(arqueo)}`}>
          {formatMoneda(arqueo)}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
        <button type="submit" className="primary-button-danger">Confirmar Cierre</button>
      </div>
    </form>
  );
};

export default CerrarCajaForm;