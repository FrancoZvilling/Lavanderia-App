import React from 'react';
import type { Cliente, EstadoLavado } from '../../types';
import { FaPhone, FaEnvelope, FaGift, FaDownload, FaEdit } from 'react-icons/fa';
import './ClientCard.css';

// 1. AÑADIMOS la nueva prop 'onCanjearClick' a la interfaz
interface ClientCardProps {
  cliente: Cliente;
  onCanjearClick: (cliente: Cliente) => void;
}

// 2. RECIBIMOS la nueva prop 'onCanjearClick' en el componente
const ClientCard: React.FC<ClientCardProps> = ({ cliente, onCanjearClick }) => {
  const getStatusClass = (estado: EstadoLavado) => {
    switch (estado) {
      case 'En preparación': return 'status-preparacion';
      case 'Listo': return 'status-listo';
      case 'Entregado': return 'status-entregado';
      default: return '';
    }
  };

  return (
    <div className="client-card">
      <div className="card-header">
        <h3>{cliente.nombre} {cliente.apellido}</h3>
        <div className={`status-badge ${getStatusClass(cliente.estadoLavado)}`}>
          {cliente.estadoLavado}
          <FaEdit className="edit-icon" title="Cambiar estado" />
        </div>
      </div>
      <div className="card-body">
        <div className="contact-info">
          {cliente.contacto.includes('@') ? <FaEnvelope /> : <FaPhone />}
          <span>{cliente.contacto}</span>
        </div>
        <div className="points-info">
          <span>Puntos de Fidelidad</span>
          <strong>{cliente.puntos.toLocaleString('es-AR')} pts</strong>
        </div>
      </div>
      <div className="card-actions">
        {/* 3. AÑADIMOS el evento onClick al botón de Canjear */}
        <button className="secondary-button small-button" onClick={() => onCanjearClick(cliente)}>
          <FaGift />
          <span>Canjear</span>
        </button>
        <button className="secondary-button small-button">
          <FaDownload />
          <span>Descargar Tarjeta</span>
        </button>
      </div>
    </div>
  );
};

export default ClientCard;