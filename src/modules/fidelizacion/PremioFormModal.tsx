import { useState, useEffect } from 'react';
import type { Premio } from '../../types';
// Reutilizaremos los estilos del formulario de ventas
import '../ventas/AddSaleForm.css';

interface PremioFormModalProps {
  onClose: () => void;
  onSave: (premioData: Omit<Premio, 'id' | 'activo'>, id?: string) => void;
  premioInicial: Premio | null;
}

const PremioFormModal: React.FC<PremioFormModalProps> = ({ onClose, onSave, premioInicial }) => {
  const [nombre, setNombre] = useState('');
  const [puntos, setPuntos] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const isEditing = !!premioInicial;

  useEffect(() => {
    if (isEditing) {
      setNombre(premioInicial.nombre);
      setPuntos(premioInicial.puntosRequeridos.toString());
      setDescripcion(premioInicial.descripcion);
    } else {
      setNombre('');
      setPuntos('');
      setDescripcion('');
    }
  }, [premioInicial, isEditing]);

  const handleSubmit = () => {
    const puntosNum = parseInt(puntos, 10);
    if (!nombre || isNaN(puntosNum) || puntosNum <= 0) {
      alert('Por favor, complete el nombre y los puntos requeridos con un valor válido.');
      return;
    }
    onSave({ nombre, puntosRequeridos: puntosNum, descripcion }, premioInicial?.id);
  };

  return (
    <form className="add-sale-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div className="form-group">
        <label htmlFor="nombre">Nombre del Premio</label>
        <input type="text" id="nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="puntos">Puntos Requeridos</label>
        <input type="number" id="puntos" value={puntos} onChange={e => setPuntos(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="descripcion">Descripción</label>
        <textarea id="descripcion" rows={3} value={descripcion} onChange={e => setDescripcion(e.target.value)} />
      </div>
      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
        <button type="submit" className="primary-button">{isEditing ? 'Actualizar Premio' : 'Guardar Premio'}</button>
      </div>
    </form>
  );
};

export default PremioFormModal;