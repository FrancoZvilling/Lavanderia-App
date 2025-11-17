import type { Venta, Cliente } from '../../types';
import type { Timestamp } from 'firebase/firestore';
import './VentasTable.css';

interface VentasTableProps {
  ventas: Venta[];
  clientes: Cliente[];
  onVerDetalles: (venta: Venta) => void;
}

const VentasTable: React.FC<VentasTableProps> = ({ ventas, clientes, onVerDetalles }) => {
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
    // 1. Añadimos una clase específica para evitar conflictos de estilos
    <div className="table-container ventas-table">
      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Monto Total</th>
            <th>Fecha y Hora</th>
            <th>Método de Pago</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((venta) => (
            <tr key={venta.id}>
              {/* 2. Añadimos data-label a cada celda */}
              <td data-label="Cliente" className="cliente-principal">
                <strong>{getNombreCliente(venta.clienteId)}</strong>
              </td>
              <td data-label="Monto" className="monto">
                {formatMoneda(venta.montoTotal)}
              </td>
              <td data-label="Fecha">{formatFecha(venta.fecha)}</td>
              <td data-label="Método de Pago">{venta.metodoDePago}</td>
              <td data-label="Acciones">
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