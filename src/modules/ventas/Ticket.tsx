import type { Venta, Cliente } from '../../types';
import logo from '../../assets/logo.png';
import './Ticket.css';

interface TicketProps {
  venta: Venta;
  cliente: Cliente | undefined;
  esPagado: boolean;
  esDevolucion?: boolean; // Nueva prop opcional para indicar devolución
}

const Ticket: React.FC<TicketProps> = ({ venta, cliente, esPagado, esDevolucion }) => {
  const fechaVenta = venta.fecha.toDate().toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const formatMoneda = (monto: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);

  // Lógica para determinar el título del ticket
  const tituloTicket = esDevolucion 
    ? 'COMPROBANTE DE DEVOLUCIÓN' 
    : 'COMPROBANTE DE PEDIDO';

  // Lógica para determinar la etiqueta del monto final
  const etiquetaTotal = esDevolucion 
    ? 'MONTO REEMBOLSADO:' 
    : (esPagado ? 'TOTAL PAGADO:' : 'TOTAL A PAGAR:');

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
        {/* Título dinámico del ticket */}
        <div className="ticket-title-row" style={{textAlign: 'center', margin: '10px 0', fontWeight: 'bold'}}>
          {tituloTicket}
        </div>

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
        {cliente && cliente.telefono && (
          <div className="ticket-info-row">
            <span>Teléfono:</span>
            <span>{cliente.telefono}</span>
          </div>
        )}
        
        <hr className="ticket-separator" />

        {/* Fila del total con lógica condicional para estilo y texto */}
        <div className={`ticket-total-row ${esPagado || esDevolucion ? 'pagado' : ''}`}>
          <span>{etiquetaTotal}</span>
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