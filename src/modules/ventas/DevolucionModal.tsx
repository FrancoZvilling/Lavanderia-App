import { useState } from 'react';
import type { Venta, Cliente } from '../../types'; // Ya no necesitamos 'Empleado'
import './AddSaleForm.css';

type MetodoDevolucion = 'Efectivo' | 'Transferencia';

interface DevolucionModalProps {
  venta: Venta;
  cliente: Cliente | undefined;
  // Eliminamos la prop 'empleados'
  onClose: () => void;
  // La función onConfirm ya no espera el objeto empleado
  onConfirm: (devolucionData: {
    motivo: string;
    metodo: MetodoDevolucion;
  }) => void;
}

const DevolucionModal: React.FC<DevolucionModalProps> = ({ venta, cliente, onClose, onConfirm }) => {
  const [motivo, setMotivo] = useState('');
  const [metodo, setMetodo] = useState<MetodoDevolucion>('Efectivo');

  const handleSubmit = () => {
    if (!motivo.trim()) {
      alert('Por favor, ingrese un motivo para la devolución.');
      return;
    }
    // Enviamos solo el motivo y el método
    onConfirm({
      motivo: motivo.trim(),
      metodo,
    });
  };

  return (
    <form className="add-sale-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div className="summary-grid" style={{backgroundColor: 'var(--color-secundario)', padding: '15px', borderRadius: '8px'}}>
        <div>Ticket a Devolver:</div>
        <div><strong>#{venta.nroTicket}</strong></div>
        <div>Cliente:</div>
        <div>{cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente Anónimo'}</div>
        <div className="summary-total">Monto a Devolver:</div>
        <div className="summary-total" style={{color: '#e74c3c'}}>
          {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(venta.montoTotal)}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="motivoDevolucion">Motivo de la Devolución</label>
        <textarea id="motivoDevolucion" rows={3} value={motivo} onChange={e => setMotivo(e.target.value)} required autoFocus />
      </div>

      <div className="form-group">
        <label>Método de Devolución</label>
        <div className="payment-method-selector">
          {(['Efectivo', 'Transferencia'] as MetodoDevolucion[]).map((m) => (
            <div key={m}>
              <input type="radio" id={`dev-${m}`} name="metodoDevolucion" value={m} checked={metodo === m} onChange={() => setMetodo(m)} />
              <label htmlFor={`dev-${m}`}>{m}</label>
            </div>
          ))}
        </div>
      </div>

      {/* El selector de empleados ha sido eliminado */}

      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
        <button type="submit" className="primary-button-danger">Confirmar Devolución</button>
      </div>
    </form>
  );
};

export default DevolucionModal;