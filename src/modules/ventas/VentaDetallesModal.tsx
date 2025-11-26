import type { Cliente, Venta } from '../../types';
import './VentaDetallesModal.css';

interface VentaDetallesModalProps {
  venta: Venta;
  cliente: Cliente | undefined; // El cliente puede no existir (anónimo)
}

const VentaDetallesModal: React.FC<VentaDetallesModalProps> = ({ venta, cliente }) => {
  return (
    <div className="detalles-container">
      <div className="detalle-seccion">
        <h4>Ticket N° {venta.nroTicket}</h4>
      </div>
      <div className="detalle-seccion">
        <h4>Cliente</h4>
        <p>{cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente Anónimo'}</p>
      </div>
      
      <div className="detalle-seccion">
        <h4>Prendas Incluidas</h4>
        <ul className="prenda-lista">
          {venta.items.map((item, index) => (
            <li key={index}>
              <span>{item.cantidad}x</span> {item.nombrePrenda}
            </li>
          ))}
        </ul>
      </div>

      <div className="detalle-seccion">
        <h4>Observaciones</h4>
        <p className="observaciones-texto">
          {venta.observaciones || <em>No se añadieron observaciones.</em>}
        </p>
      </div>

      <div className="detalle-seccion total-final">
        <h4>Monto Total Pagado</h4>
        <p>
          {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(venta.montoTotal)}
        </p>
      </div>
    </div>
  );
};

export default VentaDetallesModal;