import React from 'react';
import type { RegistroCaja } from '../../types';
import './HistorialCajaTable.css';

interface HistorialCajaTableProps {
  registros: RegistroCaja[];
}

const HistorialCajaTable: React.FC<HistorialCajaTableProps> = ({ registros }) => {
  const formatFecha = (fecha?: Date) => {
    if (!fecha) return 'N/A';
    return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(fecha);
  };

  const formatMoneda = (monto?: number) => {
    if (monto === undefined) return 'N/A';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);
  };

  const calcularTotalVentas = (registro: RegistroCaja) => {
    return registro.ventasDelDia.reduce((total, venta) => total + venta.montoTotal, 0);
  };
  
  const calcularArqueo = (registro: RegistroCaja) => {
    if (registro.montoFinal === undefined) return 0;
    const totalVentas = calcularTotalVentas(registro);
    return registro.montoFinal - (registro.montoInicial + totalVentas);
  };
  
  const getArqueoClass = (arqueo: number) => {
    if (arqueo === 0) return 'arqueo-ok';
    return arqueo > 0 ? 'arqueo-sobrante' : 'arqueo-faltante';
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Fecha Apertura</th>
            <th>Monto Inicial</th>
            <th>Total Ventas</th>
            <th>Fecha Cierre</th>
            <th>Monto Final</th>
            <th>Arqueo</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((registro) => {
            const totalVentas = calcularTotalVentas(registro);
            const arqueo = calcularArqueo(registro);
            return (
              <tr key={registro.id}>
                <td>{formatFecha(registro.fechaApertura)}</td>
                <td>{formatMoneda(registro.montoInicial)}</td>
                <td>{formatMoneda(totalVentas)}</td>
                <td>{formatFecha(registro.fechaCierre)}</td>
                <td>{formatMoneda(registro.montoFinal)}</td>
                <td className={getArqueoClass(arqueo)}>
                  {formatMoneda(arqueo)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default HistorialCajaTable;