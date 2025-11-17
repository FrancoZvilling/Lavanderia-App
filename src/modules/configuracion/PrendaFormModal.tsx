import { useState, useEffect } from 'react';
import type { TipoDePrenda } from '../../types';
import '../ventas/AddSaleForm.css'; // Reutilizamos estilos

interface PrendaFormModalProps {
  onClose: () => void;
  onSave: (prendaData: Omit<TipoDePrenda, 'id'>, id?: string) => void;
  prendaInicial: TipoDePrenda | null;
}

const PrendaFormModal: React.FC<PrendaFormModalProps> = ({ onClose, onSave, prendaInicial }) => {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const isEditing = !!prendaInicial;

  useEffect(() => {
    if (isEditing) {
      setNombre(prendaInicial.nombre);
      setPrecio(prendaInicial.precio.toString());
    } else {
      setNombre('');
      setPrecio('');
    }
  }, [prendaInicial, isEditing]);

  const handleSubmit = () => {
    const precioNum = parseFloat(precio);
    if (!nombre || isNaN(precioNum) || precioNum < 0) {
      alert('Por favor, complete el nombre y un precio válido.');
      return;
    }
    onSave({ nombre, precio: precioNum }, prendaInicial?.id);
  };

  return (
    <form className="add-sale-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div className="form-group">
        <label htmlFor="nombrePrenda">Nombre de la Prenda</label>
        <input type="text" id="nombrePrenda" value={nombre} onChange={e => setNombre(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="precioPrenda">Precio del Lavado</label>
        <input type="number" id="precioPrenda" value={precio} onChange={e => setPrecio(e.target.value)} required />
      </div>
      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
        <button type="submit" className="primary-button">{isEditing ? 'Actualizar Prenda' : 'Guardar Prenda'}</button>
      </div>
    </form>
  );
};

export default PrendaFormModal;