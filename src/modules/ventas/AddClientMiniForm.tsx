import { useState } from 'react';
import './AddSaleForm.css';

interface AddClientMiniFormProps {
  nombreInicial: string;
  onClose: () => void;
  onSave: (clienteData: { 
    nombreCompleto: string; 
    telefono: string;
    dni: string;
    descuento: number;
  }) => void;
}

const AddClientMiniForm: React.FC<AddClientMiniFormProps> = ({ nombreInicial, onClose, onSave }) => {
  const [nombreCompleto, setNombreCompleto] = useState(nombreInicial);
  const [telefono, setTelefono] = useState('');
  const [dni, setDni] = useState('');
  const [descuento, setDescuento] = useState('0'); // Guardamos como string para el input

  const handleSubmit = () => {
    if (!nombreCompleto.trim() || !telefono.trim() || !dni.trim()) {
      alert('Por favor, complete nombre, teléfono y DNI.');
      return;
    }
    const descuentoNum = parseInt(descuento, 10);
    if (isNaN(descuentoNum) || descuentoNum < 0 || descuentoNum > 100) {
      alert('El descuento debe ser un número entre 0 y 100.');
      return;
    }
    onSave({ nombreCompleto, telefono, dni, descuento: descuentoNum });
  };

  return (
    <form className="add-sale-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div className="form-group">
        <label htmlFor="nombreCompletoCliente">Nombre y Apellido</label>
        <input type="text" id="nombreCompletoCliente" value={nombreCompleto} onChange={e => setNombreCompleto(e.target.value)} required autoFocus />
      </div>
      <div className="form-group">
        <label htmlFor="telefonoCliente">Número de Teléfono</label>
        <input type="tel" id="telefonoCliente" value={telefono} onChange={e => setTelefono(e.target.value)} required inputMode="tel" />
      </div>
      <div className="form-group">
        <label htmlFor="dniCliente">DNI</label>
        <input type="text" id="dniCliente" value={dni} onChange={e => setDni(e.target.value)} required inputMode="numeric" />
      </div>
      <div className="form-group">
        <label htmlFor="descuentoCliente">Descuento Fijo (%)</label>
        <input 
          type="number" 
          id="descuentoCliente" 
          value={descuento} 
          onChange={e => setDescuento(e.target.value)} 
          min="0"
          max="100"
          placeholder="0"
        />
      </div>
      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
        <button type="submit" className="primary-button">Guardar Cliente</button>
      </div>
    </form>
  );
};

export default AddClientMiniForm;