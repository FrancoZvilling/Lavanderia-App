import React from 'react';
import { FaTimes } from 'react-icons/fa';
import './Modal.css';

// Definimos los props que nuestro Modal aceptará
interface ModalProps {
  isOpen: boolean; // Para saber si se debe mostrar o no
  onClose: () => void; // Función que se ejecuta al cerrar
  children: React.ReactNode; // El contenido que irá dentro del modal
  title: string; // Un título para el modal
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  // Si no está abierto, no renderizamos nada
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="close-button" title="Cerrar">
            <FaTimes />
          </button>
        </header>
        <main className="modal-body">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Modal;