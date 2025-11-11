import type { Venta, Cliente } from '../../types';
import type { Timestamp } from 'firebase/firestore'; // 1. Importar el tipo Timestamp
import './VentasTable.css';

interface VentasTableProps {
  ventas: Venta[];
  clientes: Cliente[];
  onVerDetalles: (venta: Venta) => void;
}

const VentasTable: React.FC<VentasTableProps> = ({ ventas, clientes, onVerDetalles }) => {
  
  // 2. La función ahora acepta un ID de tipo string | null
  const getNombreCliente = (clienteId: string | null) => {
    if (clienteId === null) {
      return <em>Cliente Anónimo</em>;
    }
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente no encontrado';
  };
  
  // 3. La función ahora acepta un objeto Timestamp de Firebase
  const formatFecha = (fecha: Timestamp) => {
    // Usamos el método .toDate() para la conversión
    return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(fecha.toDate());
  };
  
  const formatMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);
  };

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Fecha y Hora</th>
            <th>Cliente</th>
            <th>Monto Total</th>
            <th>Método de Pago</th>
            <th>Observaciones</th>
            <th>Más Detalles</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((venta) => (
            <tr key={venta.id}>
              <td>{formatFecha(venta.fecha)}</td>
              <td>{getNombreCliente(venta.clienteId)}</td>
              <td className="monto">{formatMoneda(venta.montoTotal)}</td>
              <td>{venta.metodoDePago}</td>
              <td className="observaciones-preview">{venta.observaciones || '-'}</td>
              <td>
                <button className="secondary-button small-button" onClick={() => onVerDetalles(venta)}>
                  Ver detalles
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VentasTable;