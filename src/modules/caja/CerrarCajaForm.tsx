import React, { useState, useMemo } from 'react';
import type { RegistroCaja } from '../../types';
import './../ventas/AddSaleForm.css'; // Reutilizamos estilos
import './CerrarCajaForm.css'; // Y añadimos unos nuevos

interface CerrarCajaFormProps {
  caja: RegistroCaja;
  onClose: () => void;
  onConfirm: (montoFinal: number) => void;
}

const CerrarCajaForm: React.FC<CerrarCajaFormProps> = ({ caja, onClose, onConfirm }) => {
  const [montoFinal, setMontoFinal] = useState('');

  // Usamos useMemo para evitar recalcular en cada render
  const { totalVentas, esperadoEnCaja, arqueo } = useMemo(() => {
    const montoFinalNum = parseFloat(montoFinal) || 0;
    const totalVentas = caja.ventasDelDia.reduce((sum, v) => sum + v.montoTotal, 0);
    const esperadoEnCaja = caja.montoInicial + totalVentas;
    const arqueo = montoFinalNum - esperadoEnCaja;
    return { totalVentas, esperadoEnCaja, arqueo };
  }, [caja, montoFinal]);

  const handleSubmit = () => {
    const montoFinalNum = parseFloat(montoFinal);
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
        <div>Monto Inicial:</div>
        <div>{formatMoneda(caja.montoInicial)}</div>
        <div>Total de Ventas:</div>
        <div>{formatMoneda(totalVentas)}</div>
        <div className="summary-total">Total Esperado en Caja:</div>
        <div className="summary-total">{formatMoneda(esperadoEnCaja)}</div>
      </div>

      <div className="form-group">
        <label htmlFor="montoFinal">Monto Final Contado</label>
        <input
          type="number"
          id="montoFinal"
          placeholder="Ingrese el dinero contado en caja"
          value={montoFinal}
          onChange={(e) => setMontoFinal(e.target.value)}
          autoFocus
        />
      </div>

      {montoFinal && (
        <div className="summary-grid arqueo-section">
          <div className="summary-total">Arqueo (Diferencia):</div>
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