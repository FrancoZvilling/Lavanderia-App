import type { Cliente, EstadoLavado } from '../../types';
import { FaPhone, FaEdit, FaIdCard, FaUserEdit } from 'react-icons/fa';
import './ClientCard.css';

interface ClientCardProps {
  cliente: Cliente;
  onStatusChangeClick: (cliente: Cliente) => void;
  onEditClick: (cliente: Cliente) => void;
  mode: 'admin' | 'empleado'; // Añadimos la nueva prop para el modo
}

const ClientCard: React.FC<ClientCardProps> = ({ cliente, onStatusChangeClick, onEditClick, mode }) => {
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
        
        {/* --- RENDERIZADO CONDICIONAL --- */}
        {/* El botón de editar solo se muestra si el modo es 'admin' */}
        {mode === 'admin' && (
          <button className="edit-client-btn" onClick={() => onEditClick(cliente)} title="Editar Cliente">
            <FaUserEdit />
          </button>
        )}
      </div>

      <div className="card-body">
        <div className="contact-info">
          <FaIdCard />
          <span>DNI: {cliente.documento || 'No especificado'}</span>
        </div>
        <div className="contact-info">
          <FaPhone />
          <span>{cliente.telefono || 'No especificado'}</span>
        </div>
        
        {cliente.descuentoFijo && cliente.descuentoFijo > 0 && (
          <div className="discount-info">
            Descuento Fijo: {cliente.descuentoFijo}%
          </div>
        )}
        
        <div className="points-info">
          <span>Puntos de Fidelidad</span>
          <strong>{cliente.puntos.toLocaleString('es-AR')} pts</strong>
        </div>
      </div>

      <div className="card-footer">
        <div 
          className={`status-badge ${getStatusClass(cliente.estadoLavado)}`}
          onClick={() => onStatusChangeClick(cliente)}
          title="Cambiar estado"
        >
          {cliente.estadoLavado}
          <FaEdit className="edit-icon" />
        </div>
      </div>
    </div>
  );
};

export default ClientCard;