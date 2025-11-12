import type { RegistroCaja } from '../../types';
import type { Timestamp } from 'firebase/firestore';
import './HistorialCajaTable.css';

interface HistorialCajaTableProps {
  registros: RegistroCaja[];
}

const HistorialCajaTable: React.FC<HistorialCajaTableProps> = ({ registros }) => {
  const formatFecha = (fecha?: Timestamp | null) => {
    if (!fecha) return 'N/A';
    return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(fecha.toDate());
  };

  const formatMoneda = (monto?: number | null) => {
    if (monto == null) return 'N/A';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);
  };

  // --- CORRECCIÓN CLAVE ---
  // La función ahora lee el valor pre-calculado y guardado en el registro.
  const calcularTotalVentas = (registro: RegistroCaja) => {
    // Si la propiedad 'totalVentas' existe en el registro, la usamos.
    // Si no (para registros antiguos antes de este cambio), devolvemos 0.
    return registro.totalVentas || 0;
  };
  
  const calcularArqueo = (registro: RegistroCaja) => {
    if (registro.montoFinal == null) return 0;
    // Ahora esta función usará el total de ventas correcto para el cálculo.
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
            // Estas variables ahora se calculan con los datos correctos del historial
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