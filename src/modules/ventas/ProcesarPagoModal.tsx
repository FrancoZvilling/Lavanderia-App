import { useState } from 'react';
import type { Venta, MetodoDePago } from '../../types';
import './AddSaleForm.css'; // Reutilizamos los estilos

// Definimos los métodos de pago finales (excluyendo 'Cuenta Corriente')
type MetodoDePagoFinal = Exclude<MetodoDePago, 'Cuenta Corriente'>;

interface ProcesarPagoModalProps {
  venta: Venta;
  onClose: () => void;
  onConfirm: (metodoDePagoFinal: MetodoDePagoFinal) => void;
}

const ProcesarPagoModal: React.FC<ProcesarPagoModalProps> = ({ venta, onClose, onConfirm }) => {
  const [metodoDePago, setMetodoDePago] = useState<MetodoDePagoFinal>('Efectivo');

  const handleSubmit = () => {
    onConfirm(metodoDePago);
  };

  return (
    <form className="add-sale-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div className="summary-grid" style={{backgroundColor: 'var(--color-secundario)', padding: '15px', borderRadius: '8px'}}>
        <div>Ticket N°:</div>
        <div><strong>{venta.nroTicket}</strong></div>
        <div className="summary-total">Total a Pagar:</div>
        <div className="summary-total">
          {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(venta.montoTotal)}
        </div>
      </div>
      
      <div className="form-group">
        <label>Seleccione el Método de Pago Final</label>
        <div className="payment-method-selector">
          {(['Efectivo', 'Transferencia', 'Débito', 'Crédito'] as MetodoDePagoFinal[]).map((metodo) => (
            <div key={metodo}>
              <input type="radio" id={`final-pay-${metodo}`} name="finalPaymentMethod" value={metodo} checked={metodoDePago === metodo} onChange={() => setMetodoDePago(metodo)} />
              <label htmlFor={`final-pay-${metodo}`}>{metodo}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
        <button type="submit" className="primary-button">Confirmar Pago</button>
      </div>
    </form>
  );
};

export default ProcesarPagoModal;