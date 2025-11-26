import type { Cliente, EstadoLavado } from '../../types';
// 1. Importamos el nuevo icono FaUserEdit para el botón de editar
import { FaPhone, FaEdit, FaIdCard, FaUserEdit } from 'react-icons/fa';
import './ClientCard.css';

// 2. La interfaz ahora necesita recibir la función 'onEditClick'
interface ClientCardProps {
  cliente: Cliente;
  onStatusChangeClick: (cliente: Cliente) => void;
  onEditClick: (cliente: Cliente) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ cliente, onStatusChangeClick, onEditClick }) => {
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
        {/* 3. Añadimos el nuevo botón para editar los datos del cliente */}
        <button className="edit-client-btn" onClick={() => onEditClick(cliente)} title="Editar Cliente">
          <FaUserEdit />
        </button>
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
        
        {/* 4. Mostramos el descuento fijo solo si es mayor que cero */}
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

      {/* 5. Movemos la etiqueta de estado a un footer para un mejor layout */}
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