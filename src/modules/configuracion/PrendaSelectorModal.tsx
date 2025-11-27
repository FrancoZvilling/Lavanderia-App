import { useState } from 'react';
import type { TipoDePrenda } from '../../types';
import './PrendaSelectorModal.css';

interface PrendaSelectorModalProps {
  prendas: TipoDePrenda[];
  seleccionInicial: string[]; // IDs de las prendas ya seleccionadas
  onConfirm: (seleccionados: string[]) => void;
  onClose: () => void;
}

const PrendaSelectorModal: React.FC<PrendaSelectorModalProps> = ({ prendas, seleccionInicial, onConfirm, onClose }) => {
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set(seleccionInicial));

  const handleToggle = (prendaId: string) => {
    setSeleccionados(prev => {
      const nuevaSeleccion = new Set(prev);
      if (nuevaSeleccion.has(prendaId)) {
        nuevaSeleccion.delete(prendaId);
      } else {
        nuevaSeleccion.add(prendaId);
      }
      return nuevaSeleccion;
    });
  };

  const handleConfirm = () => {
    onConfirm(Array.from(seleccionados));
    onClose();
  };

  return (
    <div className="prenda-selector-container">
      <ul className="prenda-selector-list">
        {prendas.map(prenda => (
          <li key={prenda.id} onClick={() => handleToggle(prenda.id)}>
            <input 
              type="checkbox" 
              checked={seleccionados.has(prenda.id)} 
              readOnly 
            />
            <div className="prenda-info">
              <span>{prenda.nombre}</span>
              <small>{prenda.categoriaNombre}</small>
            </div>
          </li>
        ))}
      </ul>
      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
        <button type="button" className="primary-button" onClick={handleConfirm}>
          Confirmar Selección ({seleccionados.size})
        </button>
      </div>
    </div>
  );
};

export default PrendaSelectorModal;