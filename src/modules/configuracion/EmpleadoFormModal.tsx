import { useState, useEffect } from 'react';
import type { Empleado } from '../../types';
import '../ventas/AddSaleForm.css';

interface EmpleadoFormModalProps {
  onClose: () => void;
  onSave: (nombreCompleto: string, id?: string) => void;
  empleadoInicial: Empleado | null;
}

const EmpleadoFormModal: React.FC<EmpleadoFormModalProps> = ({ onClose, onSave, empleadoInicial }) => {
  const [nombre, setNombre] = useState('');
  const isEditing = !!empleadoInicial;

  useEffect(() => {
    if (isEditing) {
      setNombre(empleadoInicial.nombreCompleto);
    } else {
      setNombre('');
    }
  }, [empleadoInicial, isEditing]);

  const handleSubmit = () => {
    if (!nombre.trim()) {
      alert('Por favor, ingrese un nombre.');
      return;
    }
    onSave(nombre.trim(), empleadoInicial?.id);
  };

  return (
    <form className="add-sale-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div className="form-group">
        <label htmlFor="nombreEmpleado">Nombre y Apellido del Empleado</label>
        <input type="text" id="nombreEmpleado" value={nombre} onChange={e => setNombre(e.target.value)} required autoFocus />
      </div>
      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
        <button type="submit" className="primary-button">{isEditing ? 'Actualizar Empleado' : 'Guardar Empleado'}</button>
      </div>
    </form>
  );
};

export default EmpleadoFormModal;