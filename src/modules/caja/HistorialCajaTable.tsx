import type { RegistroCaja } from '../../types';
import type { Timestamp } from 'firebase/firestore';
import './HistorialCajaTable.css';

interface HistorialCajaTableProps {
  registros: RegistroCaja[];
}

const HistorialCajaTable: React.FC<HistorialCajaTableProps> = ({ registros }) => {
  // 1. MODIFICAMOS la firma de la función para aceptar 'null'
  const formatFecha = (fecha?: Timestamp | null) => {
    // Si la fecha es undefined O null, retornamos 'N/A'
    if (!fecha) return 'N/A';
    return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(fecha.toDate());
  };

  // 2. MODIFICAMOS la firma de la función para aceptar 'null'
  const formatMoneda = (monto?: number | null) => {
    // Si el monto es undefined O null, retornamos 'N/A'
    if (monto == null) return 'N/A'; // Usamos '==' para capturar tanto null como undefined
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);
  };

  const calcularTotalVentas = (registro: RegistroCaja) => {
    // El historial por ahora no calcula las ventas para simplificar.
    // En una app real, este dato se guardaría al cerrar la caja.
    return 0;
  };
  
  const calcularArqueo = (registro: RegistroCaja) => {
    // Si montoFinal es null o undefined, el arqueo es 0
    if (registro.montoFinal == null) return 0;
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
                {/* Ahora estas llamadas son seguras y no dan error */}
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