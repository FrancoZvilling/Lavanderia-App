import type { Venta, Cliente } from '../../types';
import type { Timestamp } from 'firebase/firestore';
import { FaEye, FaPrint, FaUndo } from 'react-icons/fa';
import './VentasTable.css';

interface VentasTableProps {
  ventas: Venta[];
  clientes: Cliente[];
  onVerDetalles: (venta: Venta) => void;
  onImprimirTicket: (venta: Venta) => void;
  onDevolucion: (venta: Venta) => void;
}

const VentasTable: React.FC<VentasTableProps> = ({ ventas, clientes, onVerDetalles, onImprimirTicket, onDevolucion }) => {
  const getNombreCliente = (clienteId: string | null) => {
    if (clienteId === null) return <em>Cliente Anónimo</em>;
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente no encontrado';
  };
  
  const formatFecha = (fecha: Timestamp) => {
    return fecha.toDate().toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatMoneda = (monto: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);

  return (
    <div className="table-container ventas-table">
      <table>
        <thead>
          <tr>
            <th>Ticket</th>
            <th>Cliente</th>
            <th>Monto Total</th>
            <th>Fecha y Hora</th>
            <th>Método de Pago</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((venta) => (
            <tr key={venta.id} className={venta.devuelta ? 'fila-devuelta' : ''}>
              <td data-label="Ticket" className="cliente-principal">
                <strong>#{venta.nroTicket}</strong>
              </td>
              <td data-label="Cliente">{getNombreCliente(venta.clienteId)}</td>
              <td data-label="Monto" className="monto">
                {formatMoneda(venta.montoTotal)}
              </td>
              <td data-label="Fecha">{formatFecha(venta.fecha)}</td>
              <td data-label="Método de Pago">{venta.metodoDePago}</td>
              <td data-label="Acciones" className="acciones">
                <button 
                  className="secondary-button small-button" 
                  onClick={() => onVerDetalles(venta)}
                  title="Ver detalle de la venta"
                >
                  <FaEye /> <span>Ver</span>
                </button>
                <button 
                  className="secondary-button small-button" 
                  onClick={() => onImprimirTicket(venta)}
                  title="Imprimir ticket"
                >
                  <FaPrint /> <span>Ticket</span>
                </button>
                
                {/* --- LÓGICA CONDICIONAL: Botón o Etiqueta --- */}
                {venta.devuelta ? (
                  <span className="etiqueta-devuelta">DEVUELTA</span>
                ) : (
                  <button 
                    className="secondary-button small-button toggle-btn desactivar" 
                    onClick={() => onDevolucion(venta)}
                    title="Registrar una devolución para esta venta"
                  >
                    <FaUndo /> <span>Devolución</span>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VentasTable;