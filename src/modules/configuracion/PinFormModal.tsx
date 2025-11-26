import { useState } from 'react';
import '../ventas/AddSaleForm.css';

interface PinFormModalProps {
  onClose: () => void;
  onSave: (pin: string) => void;
}

const PinFormModal: React.FC<PinFormModalProps> = ({ onClose, onSave }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError('El PIN debe contener exactamente 4 dígitos numéricos.');
      return;
    }
    if (pin !== confirmPin) {
      setError('Los PINs no coinciden.');
      return;
    }
    onSave(pin);
  };

  return (
    <form className="add-sale-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div className="form-group">
        <label htmlFor="newPin">Nuevo PIN (4 dígitos)</label>
        <input 
          type="password" // Para ocultar los números
          id="newPin" 
          value={pin} 
          onChange={e => setPin(e.target.value)} 
          maxLength={4} 
          pattern="\d{4}"
          inputMode="numeric"
          required 
          autoFocus 
        />
      </div>
      <div className="form-group">
        <label htmlFor="confirmPin">Confirmar Nuevo PIN</label>
        <input 
          type="password"
          id="confirmPin" 
          value={confirmPin} 
          onChange={e => setConfirmPin(e.target.value)} 
          maxLength={4} 
          pattern="\d{4}"
          inputMode="numeric"
          required 
        />
      </div>
      {error && <p className="error-message" style={{marginTop: '10px'}}>{error}</p>}
      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
        <button type="submit" className="primary-button">Guardar PIN</button>
      </div>
    </form>
  );
};

export default PinFormModal;