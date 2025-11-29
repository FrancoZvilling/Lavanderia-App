import type { Cliente, EstadoLavado } from '../../types';
import { FaPhone, FaEdit, FaEnvelope, FaUserEdit, FaCommentDots, FaTrash } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import './ClientCard.css';

interface ClientCardProps {
  cliente: Cliente;
  onStatusChangeClick: (cliente: Cliente) => void;
  onEditClick: (cliente: Cliente) => void;
  onDeleteClick: (cliente: Cliente) => void; // Prop para el evento de borrado
  mode: 'admin' | 'empleado';
}

const ClientCard: React.FC<ClientCardProps> = ({ cliente, onStatusChangeClick, onEditClick, onDeleteClick, mode }) => {
  const getStatusClass = (estado: EstadoLavado) => {
    switch (estado) {
      case 'En preparación': return 'status-preparacion';
      case 'Listo': return 'status-listo';
      case 'Entregado': return 'status-entregado';
      default: return '';
    }
  };

  const tooltipId = `tooltip-obs-${cliente.id}`;

  return (
    <div className="client-card">
      <div className="card-header">
        <h3>{cliente.nombre} {cliente.apellido}</h3>
        
        {mode === 'admin' && (
          // Agrupamos los botones de acción del administrador
          <div className="admin-actions">
            <button className="edit-client-btn" onClick={() => onEditClick(cliente)} title="Editar Cliente">
              <FaUserEdit />
            </button>
            <button className="delete-client-btn" onClick={() => onDeleteClick(cliente)} title="Eliminar Cliente">
              <FaTrash />
            </button>
          </div>
        )}
      </div>

      <div className="card-body">
        {cliente.contacto && (
          <div className="contact-info">
            <FaEnvelope />
            <span>{cliente.contacto}</span>
          </div>
        )}

        <div className="contact-info">
          <FaPhone />
          <span>{cliente.telefono || '-'}</span>
        </div>
        
        {cliente.descuentoFijo && cliente.descuentoFijo > 0 ? (
          <div className="discount-info">
            Descuento Fijo: {cliente.descuentoFijo}%
          </div>
        ) : (
          <div className="discount-info no-discount">
            Sin Descuento
          </div>
        )}

        {cliente.observaciones && (
          <>
            <div 
              className="observations-info clickable" 
              data-tooltip-id={tooltipId}
            >
              <FaCommentDots />
              <span>Ver observaciones</span>
            </div>

            <Tooltip 
              id={tooltipId} 
              place="bottom" 
              clickable
              className="custom-tooltip"
            >
              <p>{cliente.observaciones}</p>
            </Tooltip>
          </>
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