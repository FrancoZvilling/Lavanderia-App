import { useState } from 'react';
import '../ventas/AddSaleForm.css'; // Reutilizamos estilos

interface AdminPinModalProps {
  onClose: () => void;
  onConfirm: (pin: string) => void;
}

const AdminPinModal: React.FC<AdminPinModalProps> = ({ onClose, onConfirm }) => {
  const [pin, setPin] = useState('');

  const handleSubmit = () => {
    if (pin.length !== 4) {
      alert('El PIN debe tener 4 dígitos.');
      return;
    }
    onConfirm(pin);
  };

  return (
    <form className="add-sale-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div className="form-group">
        <label htmlFor="adminPin">Ingrese el PIN de Administrador</label>
        <input 
          type="password" 
          id="adminPin" 
          value={pin} 
          onChange={e => setPin(e.target.value)} 
          maxLength={4}
          inputMode="numeric"
          autoComplete="off"
          required 
          autoFocus
        />
      </div>
      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
        <button type="submit" className="primary-button">Desbloquear</button>
      </div>
    </form>
  );
};

export default AdminPinModal;