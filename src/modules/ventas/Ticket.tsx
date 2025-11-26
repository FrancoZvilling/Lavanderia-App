import type { Venta, Cliente } from '../../types';
import logo from '../../assets/logo.png';
import './Ticket.css';

interface TicketProps {
  venta: Venta;
  cliente: Cliente | undefined;
}

const Ticket: React.FC<TicketProps> = ({ venta, cliente }) => {
  const fechaVenta = venta.fecha.toDate().toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const formatMoneda = (monto: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);

  return (
    <div className="ticket-container">
      <div className="ticket-header">
        <img src={logo} alt="Logo" className="ticket-logo" />
        <div className="ticket-title">
          <span>Lave-Rap</span>
          <span className="info-empresa">Av. Sarmiento 946 - Resistencia</span>
          <span className="info-empresa">Tel: 3625-171808</span>
        </div>
      </div>

      <div className="ticket-body">
        <div className="ticket-info-row">
          <span>Fecha:</span>
          <span>{fechaVenta} hs</span>
        </div>
        <div className="ticket-info-row">
          <span>Ticket N°:</span>
          <strong>{venta.nroTicket}</strong>
        </div>
        
        <hr className="ticket-separator" />

        <div className="ticket-info-row">
          <span>Cliente:</span>
          <span>{cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente Anónimo'}</span>
        </div>
        {/* Mostramos el teléfono si el cliente existe y tiene uno */}
        {cliente && cliente.telefono && (
          <div className="ticket-info-row">
            <span>Teléfono:</span>
            <span>{cliente.telefono}</span>
          </div>
        )}
        
        <hr className="ticket-separator" />

        <div className="ticket-total-row">
          <span>TOTAL A PAGAR:</span>
          <strong>{formatMoneda(venta.montoTotal)}</strong>
        </div>
      </div>

      <div className="ticket-footer">
        <p>La empresa no se responsabiliza por daños, desteñidos o pérdidas.</p>
        <p>Pasados 30 días de no retirada la ropa podrá ser entregada a beneficencia.</p>
      </div>
    </div>
  );
};

export default Ticket;