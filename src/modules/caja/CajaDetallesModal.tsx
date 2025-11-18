import type { RegistroCaja } from '../../types';
import './CajaDetallesModal.css';

interface CajaDetallesModalProps {
  registro: RegistroCaja;
}

const CajaDetallesModal: React.FC<CajaDetallesModalProps> = ({ registro }) => {
  const formatMoneda = (monto?: number | null) => {
    if (monto == null) return '$ 0,00';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);
  };

  const huboEgresos = (registro.totalRetirosEfectivo || 0) > 0 || (registro.totalRetirosTransferencia || 0) > 0;

  return (
    <div className="caja-detalles-container">
      <div className="detalle-seccion">
        <h4>Resumen de Ingresos</h4>
        <table className="detalles-table">
          <tbody>
            <tr>
              <td>Ingresos en Efectivo:</td>
              <td>{formatMoneda(registro.totalEfectivo)}</td>
            </tr>
            <tr>
              <td>Ingresos por Transferencia:</td>
              <td>{formatMoneda(registro.totalTransferencia)}</td>
            </tr>
            <tr>
              <td>Ingresos por Débito:</td>
              <td>{formatMoneda(registro.totalDebito)}</td>
            </tr>
            <tr>
              <td>Ingresos por Crédito:</td>
              <td>{formatMoneda(registro.totalCredito)}</td>
            </tr>
            <tr className="fila-total">
              <td><strong>Total de Ventas:</strong></td>
              <td><strong>{formatMoneda(registro.totalVentas)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* --- NUEVA SECCIÓN: Se muestra solo si hubo retiros --- */}
      {huboEgresos && (
        <div className="detalle-seccion">
          <h4>Resumen de Egresos (Retiros)</h4>
          <table className="detalles-table">
            <tbody>
              <tr>
                <td>Retiros en Efectivo:</td>
                <td className="valor-egreso">{formatMoneda(registro.totalRetirosEfectivo)}</td>
              </tr>
              <tr>
                <td>Retiros por Transferencia:</td>
                <td className="valor-egreso">{formatMoneda(registro.totalRetirosTransferencia)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="detalle-seccion">
        <h4>Información de Cierre</h4>
        <p><strong>Encargado:</strong> {registro.empleadoNombre}</p>
        <p><strong>Caja abierta con:</strong> {formatMoneda(registro.montoInicial)}</p>
        <p><strong>Caja cerrada con:</strong> {formatMoneda(registro.montoFinal)}</p>
      </div>
    </div>
  );
};

export default CajaDetallesModal;