import React from 'react';
import type { Venta, Cliente } from '../../types';
import './VentasTable.css';

// El componente recibirá una lista de ventas y de clientes como props
interface VentasTableProps {
  ventas: Venta[];
  clientes: Cliente[];
}

const VentasTable: React.FC<VentasTableProps> = ({ ventas, clientes }) => {

  // Función auxiliar para encontrar el nombre del cliente por su ID
  const getNombreCliente = (clienteId: number) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente no encontrado';
  };

  // Función para formatear la fecha y hora
  const formatFecha = (fecha: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(fecha);
  };
  
  // Función para formatear el monto a moneda local (Peso Argentino)
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
              <td>{venta.observaciones || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VentasTable;