import React from 'react';
import type { EstadoLavado } from '../../types';
import './ChangeStatusModal.css';

interface ChangeStatusModalProps {
  currentStatus: EstadoLavado;
  onStatusSelect: (newStatus: EstadoLavado) => void;
}

const statusOptions: EstadoLavado[] = ['En preparación', 'Listo', 'Entregado'];

const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({ currentStatus, onStatusSelect }) => {
  return (
    <div className="change-status-container">
      <p>Seleccione el nuevo estado del lavado:</p>
      <div className="status-options">
        {statusOptions.map(status => (
          <button
            key={status}
            // Hacemos que el botón del estado actual se vea diferente y esté deshabilitado
            className={`status-option-btn ${status === currentStatus ? 'active' : ''}`}
            onClick={() => onStatusSelect(status)}
            disabled={status === currentStatus}
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChangeStatusModal;