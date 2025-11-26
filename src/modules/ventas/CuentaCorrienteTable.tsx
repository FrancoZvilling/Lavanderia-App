import type { Venta, Cliente } from '../../types';
import { FaCheck, FaTimes, FaEye, FaPrint } from 'react-icons/fa';
// Reutilizaremos los estilos de la tabla de premios para el diseño responsivo
import '../fidelizacion/PremiosTable.css';

interface CuentaCorrienteTableProps {
  ventas: Venta[];
  clientes: Cliente[];
  onProcesar: (venta: Venta) => void;
  onAnular: (venta: Venta) => void;
  onVerDetalles: (venta: Venta) => void; // Prop añadida
  onImprimirTicket: (venta: Venta) => void;
}

const CuentaCorrienteTable: React.FC<CuentaCorrienteTableProps> = ({ ventas, clientes, onProcesar, onAnular, onVerDetalles, onImprimirTicket }) => {
  const getNombreCliente = (clienteId: string | null) => {
    if (!clienteId) return 'Cliente Anónimo';
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente no encontrado';
  };

  const formatMoneda = (monto: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);

  return (
    <div className="table-container premios-table">
      <table>
        <thead>
          <tr>
            <th>N° Ticket</th>
            <th>Nombre</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((venta) => (
            <tr key={venta.id}>
              <td data-label="Ticket"><strong>{venta.nroTicket}</strong></td>
              <td data-label="Nombre">{getNombreCliente(venta.clienteId)}</td>
              <td data-label="Total">{formatMoneda(venta.montoTotal)}</td>
              <td data-label="Acciones" className="acciones">
                {/* --- BOTÓN "VER" AÑADIDO --- */}
                <button
                  className="secondary-button small-button"
                  onClick={() => onVerDetalles(venta)}
                  title="Ver Detalles de la Venta"
                >
                  <FaEye /> <span>Ver</span>
                </button>
                <button className="secondary-button small-button" onClick={() => onImprimirTicket(venta)}>
              <FaPrint /> <span>Ticket</span>
            </button>
                <button 
                  className="secondary-button small-button toggle-btn activar"
                  onClick={() => onProcesar(venta)}
                  title="Procesar Pago"
                >
                  <FaCheck /> <span>Procesar</span>
                </button>
                <button 
                  className="secondary-button small-button toggle-btn desactivar"
                  onClick={() => onAnular(venta)}
                  title="Anular Ticket"
                >
                  <FaTimes /> <span>Anular</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CuentaCorrienteTable;