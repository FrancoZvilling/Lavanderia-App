import { useState } from 'react';
import './AddSaleForm.css';

interface AddClientMiniFormProps {
  nombreInicial: string;
  onClose: () => void;
  onSave: (clienteData: { 
    nombreCompleto: string; 
    telefono: string;
    email: string;
    descuento: number;
    observaciones: string;
  }) => void;
}

const AddClientMiniForm: React.FC<AddClientMiniFormProps> = ({ nombreInicial, onClose, onSave }) => {
  const [nombreCompleto, setNombreCompleto] = useState(nombreInicial);
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [descuento, setDescuento] = useState('0');
  const [observaciones, setObservaciones] = useState('');

  const handleSubmit = () => {
    if (!nombreCompleto.trim()) {
      alert('El campo Nombre y Apellido es obligatorio.');
      return;
    }
    const descuentoNum = parseInt(descuento, 10);
    if (isNaN(descuentoNum) || descuentoNum < 0 || descuentoNum > 100) {
      alert('El descuento debe ser un número entre 0 y 100.');
      return;
    }
    onSave({ nombreCompleto, telefono, email, descuento: descuentoNum, observaciones });
  };

  return (
    <form className="add-sale-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div className="form-group">
        <label htmlFor="nombreCompletoCliente">Nombre y Apellido*</label>
        <input type="text" id="nombreCompletoCliente" value={nombreCompleto} onChange={e => setNombreCompleto(e.target.value)} required autoFocus />
      </div>
      <div className="form-group">
        <label htmlFor="telefonoCliente">Número de Teléfono</label>
        <input type="tel" id="telefonoCliente" value={telefono} onChange={e => setTelefono(e.target.value)} inputMode="tel" />
      </div>
      <div className="form-group">
        <label htmlFor="emailCliente">Correo Electrónico</label>
        <input type="email" id="emailCliente" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="form-group">
        <label htmlFor="descuentoCliente">Descuento Fijo (%)</label>
        <input type="number" id="descuentoCliente" value={descuento} onChange={e => setDescuento(e.target.value)} min="0" max="100" placeholder="0" />
      </div>
       <div className="form-group">
        <label htmlFor="observacionesCliente">Observaciones</label>
        <textarea id="observacionesCliente" rows={3} value={observaciones} onChange={e => setObservaciones(e.target.value)} />
      </div>
      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
        <button type="submit" className="primary-button">Guardar Cliente</button>
      </div>
    </form>
  );
};

export default AddClientMiniForm;