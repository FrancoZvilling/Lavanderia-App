import type { RegistroCaja } from '../../types';
import type { Timestamp } from 'firebase/firestore';
import './HistorialCajaTable.css';

interface HistorialCajaTableProps {
  registros: RegistroCaja[];
}

const HistorialCajaTable: React.FC<HistorialCajaTableProps> = ({ registros }) => {
  const formatFecha = (fecha?: Timestamp | null) => {
    if (!fecha) return 'N/A';
    return fecha.toDate().toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatMoneda = (monto?: number | null) => {
    if (monto == null) return 'N/A';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);
  };

  const calcularTotalVentas = (registro: RegistroCaja) => {
    return registro.totalVentas || 0;
  };
  
  const calcularArqueo = (registro: RegistroCaja) => {
    if (registro.montoFinal == null) return 0;
    const totalVentas = calcularTotalVentas(registro);
    return registro.montoFinal - (registro.montoInicial + totalVentas);
  };
  
  const getArqueoClass = (valor: number) => {
    if (valor === 0) return 'arqueo-ok';
    return valor > 0 ? 'arqueo-sobrante' : 'arqueo-faltante';
  }

  return (
    <div className="table-container caja-table">
      <table>
        <thead>
          <tr>
            {/* --- 1. NUEVA COLUMNA --- */}
            <th>Encargado</th>
            <th>Fecha Apertura</th>
            <th>Monto Inicial</th>
            <th>Dif. Apertura</th>
            <th>Total Ventas</th>
            <th>Monto Final</th>
            <th>Arqueo</th>
            <th>Fecha Cierre</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((registro) => {
            const arqueo = calcularArqueo(registro);
            return (
              <tr key={registro.id}>
                {/* --- 2. NUEVA CELDA (ahora es la principal en móvil) --- */}
                <td data-label="Encargado" className="encargado-principal">
                  <strong>{registro.empleadoNombre || 'No definido'}</strong>
                </td>
                <td data-label="Apertura">{formatFecha(registro.fechaApertura)}</td>
                <td data-label="Monto Inicial">{formatMoneda(registro.montoInicial)}</td>
                <td data-label="Dif. Apertura" className={getArqueoClass(registro.diferenciaApertura || 0)}>
                  {formatMoneda(registro.diferenciaApertura || 0)}
                </td>
                <td data-label="Total Ventas">{formatMoneda(registro.totalVentas || 0)}</td>
                <td data-label="Monto Final">{formatMoneda(registro.montoFinal)}</td>
                <td data-label="Arqueo" className={getArqueoClass(arqueo)}>
                  {formatMoneda(arqueo)}
                </td>
                <td data-label="Cierre">{formatFecha(registro.fechaCierre)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default HistorialCajaTable;