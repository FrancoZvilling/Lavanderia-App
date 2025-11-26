import { useState, useEffect } from 'react';
import type { Cliente } from '../../types';
import '../ventas/AddSaleForm.css'; // Reutilizamos estilos

interface EditClientFormModalProps {
  cliente: Cliente;
  onClose: () => void;
  onSave: (clienteId: string, updatedData: Partial<Cliente>) => void;
}

const EditClientFormModal: React.FC<EditClientFormModalProps> = ({ cliente, onClose, onSave }) => {
  const [nombre, setNombre] = useState(cliente.nombre);
  const [apellido, setApellido] = useState(cliente.apellido);
  const [telefono, setTelefono] = useState(cliente.telefono);
  const [dni, setDni] = useState(cliente.documento);
  const [descuento, setDescuento] = useState((cliente.descuentoFijo || 0).toString());

  const handleSubmit = () => {
    const descuentoNum = parseInt(descuento, 10);
    if (isNaN(descuentoNum) || descuentoNum < 0 || descuentoNum > 100) {
      alert('El descuento debe ser un número entre 0 y 100.');
      return;
    }

    const updatedData: Partial<Cliente> = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      telefono: telefono.trim(),
      documento: dni.trim(),
      descuentoFijo: descuentoNum,
    };

    onSave(cliente.id, updatedData);
  };

  return (
    <form className="add-sale-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div className="form-group">
        <label htmlFor="nombre">Nombre</label>
        <input type="text" id="nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="apellido">Apellido</label>
        <input type="text" id="apellido" value={apellido} onChange={e => setApellido(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="telefono">Teléfono</label>
        <input type="tel" id="telefono" value={telefono} onChange={e => setTelefono(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="dni">DNI</label>
        <input type="text" id="dni" value={dni} onChange={e => setDni(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="descuento">Descuento Fijo (%)</label>
        <input type="number" id="descuento" value={descuento} onChange={e => setDescuento(e.target.value)} min="0" max="100" />
      </div>
      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
        <button type="submit" className="primary-button">Guardar Cambios</button>
      </div>
    </form>
  );
};

export default EditClientFormModal;