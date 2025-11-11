import React from 'react';
// 1. Ajustamos la importación del tipo
import type { Venta, Cliente } from '../../types';
import './VentasTable.css';

interface VentasTableProps {
  ventas: Venta[];
  clientes: Cliente[];
}

const VentasTable: React.FC<VentasTableProps> = ({ ventas, clientes }) => {
  // 2. Modificamos la función para aceptar un ID nulo
  const getNombreCliente = (clienteId: number | null) => {
    // Si no hay ID, es una venta anónima
    if (clienteId === null) {
      return <em>Cliente Anónimo</em>;
    }
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente no encontrado';
  };

  // ... (el resto del componente sigue igual) ...
  const formatFecha = (fecha: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(fecha);
  };
  
  const formatMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(monto);
  }

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
          </tr>
        </thead>
        <tbody>
          {ventas.map((venta) => (
            <tr key={venta.id}>
              <td>{formatFecha(venta.fecha)}</td>
              <td>{getNombreCliente(venta.clienteId)}</td>
              <td className="monto">{formatMoneda(venta.montoTotal)}</td>
              <td>{venta.metodoDePago}</td>
              <td>{venta.items.map(item => `${item.cantidad}x ${item.nombrePrenda}`).join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VentasTable;