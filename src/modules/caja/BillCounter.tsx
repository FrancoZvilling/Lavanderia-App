import { useState, useEffect, useMemo } from 'react';
import './BillCounter.css';

// Definimos el tipo para el objeto de conteo
export type BillCounts = { [key: string]: number };

interface BillCounterProps {
  // La prop ahora se llama 'onChange' y devuelve un objeto
  onChange: (data: { total: number; counts: BillCounts }) => void;
}

const denominations = [20000, 10000, 2000, 1000, 500, 200, 100];

const BillCounter: React.FC<BillCounterProps> = ({ onChange }) => {
  // El estado ahora guarda números, manejando el '0' internamente
  const [counts, setCounts] = useState<BillCounts>({});

  const handleCountChange = (denomination: number, value: string) => {
    const count = parseInt(value, 10);
    setCounts(prevCounts => ({
      ...prevCounts,
      // Si el valor es inválido o 0, guardamos 0; si no, el valor numérico
      [denomination]: isNaN(count) || count < 0 ? 0 : count,
    }));
  };

  const total = useMemo(() => {
    return denominations.reduce((sum, denomination) => {
      const count = counts[denomination] || 0;
      return sum + (count * denomination);
    }, 0);
  }, [counts]);

  // Notificamos al padre cada vez que el total o el desglose cambian
  useEffect(() => {
    onChange({ total, counts });
  }, [total, counts, onChange]);

  const formatMoneda = (monto: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);

  return (
    <div className="bill-counter-container">
      <div className="bill-counter-grid">
        {denominations.map(denom => {
          const count = counts[denom] || 0;
          const subtotal = count * denom;
          return (
            <div className="bill-row" key={denom}>
              <label htmlFor={`bill-${denom}`}>{formatMoneda(denom)}</label>
              <span>x</span>
              <input
                type="number"
                id={`bill-${denom}`}
                // Mostramos el valor numérico, o un string vacío si es 0
                value={count === 0 ? '' : count}
                onChange={e => handleCountChange(denom, e.target.value)}
                placeholder="0"
                min="0"
                inputMode="numeric"
              />
              <span>=</span>
              <span className="subtotal">{formatMoneda(subtotal)}</span>
            </div>
          );
        })}
      </div>
      <div className="bill-counter-total">
        <span>Total Contado:</span>
        <strong>{formatMoneda(total)}</strong>
      </div>
    </div>
  );
};

export default BillCounter;