import type { Cliente, EstadoLavado } from '../../types';
// 1. Importamos el nuevo icono para el DNI
import { FaPhone, FaEdit, FaIdCard } from 'react-icons/fa';
import './ClientCard.css';

interface ClientCardProps {
  cliente: Cliente;
  onStatusChangeClick: (cliente: Cliente) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ cliente, onStatusChangeClick }) => {
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
        <div 
          className={`status-badge ${getStatusClass(cliente.estadoLavado)}`}
          onClick={() => onStatusChangeClick(cliente)}
          title="Cambiar estado"
        >
          {cliente.estadoLavado}
          <FaEdit className="edit-icon" />
        </div>
      </div>

      <div className="card-body">
        {/* 2. Mostramos el DNI */}
        <div className="contact-info">
          <FaIdCard />
          <span>DNI: {cliente.documento || 'No especificado'}</span>
        </div>

        {/* 3. Mostramos el Teléfono en lugar del 'contacto' (email) */}
        <div className="contact-info">
          <FaPhone />
          <span>{cliente.telefono || 'No especificado'}</span>
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