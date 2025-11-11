import React from 'react';
import type { Cliente, EstadoLavado } from '../../types';
import { FaPhone, FaEnvelope, FaEdit } from 'react-icons/fa';
import './ClientCard.css';

interface ClientCardProps {
  cliente: Cliente;
  onStatusChangeClick: (cliente: Cliente) => void; // 1. Nueva prop
}

const ClientCard: React.FC<ClientCardProps> = ({ cliente, onStatusChangeClick }) => {
  // ... (función getStatusClass sigue igual)
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
        {/* 2. El div ahora es clickeable y llama a la función de la prop */}
        <div 
          className={`status-badge ${getStatusClass(cliente.estadoLavado)}`}
          onClick={() => onStatusChangeClick(cliente)}
          title="Cambiar estado" // Mejora la accesibilidad
        >
          {cliente.estadoLavado}
          <FaEdit className="edit-icon" />
        </div>
      </div>
      {/* ... (el resto de la tarjeta sigue igual) ... */}
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
    </div>
  );
};

export default ClientCard;