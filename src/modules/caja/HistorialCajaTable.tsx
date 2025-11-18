import type { RegistroCaja } from '../../types';
import type { Timestamp } from 'firebase/firestore';
// Importamos un icono para el nuevo botón y los estilos de botones
import { FaEye } from 'react-icons/fa';
import '../fidelizacion/PremiosTable.css';
import './HistorialCajaTable.css';

// 1. La interfaz ahora incluye la función 'onVerDetalles'
interface HistorialCajaTableProps {
  registros: RegistroCaja[];
  onVerDetalles: (registro: RegistroCaja) => void;
}

const HistorialCajaTable: React.FC<HistorialCajaTableProps> = ({ registros, onVerDetalles }) => {
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

  const calcularArqueo = (registro: RegistroCaja) => {
    if (registro.montoFinal == null) return 0;
    const ingresosEnEfectivo = registro.totalEfectivo ?? registro.totalVentas ?? 0;
    return registro.montoFinal - (registro.montoInicial + ingresosEnEfectivo);
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
            <th>Encargado</th>
            <th>Fecha Apertura</th>
            <th>Monto Inicial</th>
            <th>Dif. Apertura</th>
            <th>Monto Final</th>
            <th>Arqueo</th>
            <th>Fecha Cierre</th>
            <th>Detalle</th> 
          </tr>
        </thead>
        <tbody>
          {registros.map((registro) => {
            const arqueo = calcularArqueo(registro);
            return (
              <tr key={registro.id}>
                <td data-label="Encargado" className="encargado-principal">
                  <strong>{registro.empleadoNombre || 'No definido'}</strong>
                </td>
                <td data-label="Apertura">{formatFecha(registro.fechaApertura)}</td>
                <td data-label="Monto Inicial">{formatMoneda(registro.montoInicial)}</td>
                <td data-label="Dif. Apertura" className={getArqueoClass(registro.diferenciaApertura || 0)}>
                  {formatMoneda(registro.diferenciaApertura || 0)}
                </td>
                {/* 3. Se eliminó la celda de "Total Ventas" */}
                <td data-label="Monto Final">{formatMoneda(registro.montoFinal)}</td>
                <td data-label="Arqueo" className={getArqueoClass(arqueo)}>
                  {formatMoneda(arqueo)}
                </td>
                <td data-label="Cierre">{formatFecha(registro.fechaCierre)}</td>
                {/* 4. Nueva celda con el botón "Ver detalle" */}
                <td data-label="Detalle">
                  <button 
                    className="secondary-button small-button"
                    onClick={() => onVerDetalles(registro)}
                    title="Ver detalle de ingresos"
                  >
                    <FaEye /> <span>Ver</span>
                  </button>
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