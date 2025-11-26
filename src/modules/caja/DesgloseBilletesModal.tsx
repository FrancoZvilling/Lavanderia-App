import { useMemo } from 'react';
import type { BillCounts } from './BillCounter';
import './DesgloseBilletesModal.css';

interface DesgloseBilletesModalProps {
  desglose: BillCounts;
}

const DesgloseBilletesModal: React.FC<DesgloseBilletesModalProps> = ({ desglose }) => {
  // Ordenamos las denominaciones de mayor a menor para la visualización
  const denominations = useMemo(() => 
    Object.keys(desglose).map(Number).sort((a, b) => b - a),
    [desglose]
  );

  const total = useMemo(() => 
    denominations.reduce((sum, denom) => sum + (denom * (desglose[denom] || 0)), 0),
    [denominations, desglose]
  );

  const formatMoneda = (monto: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);

  return (
    <div className="desglose-container">
      <table className="desglose-table">
        <thead>
          <tr>
            <th>Denominación</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {denominations.map(denom => (
            <tr key={denom}>
              <td>{formatMoneda(denom)}</td>
              <td>{desglose[denom]}</td>
              <td>{formatMoneda(denom * desglose[denom])}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2}>Total</td>
            <td>{formatMoneda(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default DesgloseBilletesModal;