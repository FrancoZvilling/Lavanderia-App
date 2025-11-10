import React from 'react';
import type { Cliente, Premio } from '../../types';
import './CanjearPuntosModal.css';

interface CanjearPuntosModalProps {
  cliente: Cliente;
  premios: Premio[];
  onConfirmCanje: (premio: Premio) => void;
}

const CanjearPuntosModal: React.FC<CanjearPuntosModalProps> = ({ cliente, premios, onConfirmCanje }) => {
  return (
    <div className="canje-modal-container">
      <div className="cliente-puntos-header">
        Puntos de {cliente.nombre}: <strong>{cliente.puntos.toLocaleString('es-AR')} pts</strong>
      </div>
      <ul className="premios-list">
        {premios.map(premio => {
          const puedeCanjear = cliente.puntos >= premio.puntosRequeridos;
          return (
            <li key={premio.id} className={`premio-item ${!puedeCanjear ? 'disabled' : ''}`}>
              <div className="premio-info">
                <h4>{premio.nombre}</h4>
                <p>{premio.descripcion}</p>
              </div>
              <div className="premio-accion">
                <span className="puntos-requeridos">{premio.puntosRequeridos.toLocaleString('es-AR')} pts</span>
                <button
                  className="primary-button small-button"
                  disabled={!puedeCanjear}
                  onClick={() => onConfirmCanje(premio)}
                >
                  Canjear
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CanjearPuntosModal;