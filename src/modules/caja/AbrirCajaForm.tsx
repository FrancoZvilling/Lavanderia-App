import React, { useState } from 'react';

// Podemos reutilizar los estilos del otro formulario para consistencia
import './../ventas/AddSaleForm.css';

interface AbrirCajaFormProps {
  onClose: () => void;
  onConfirm: (montoInicial: number) => void;
}

const AbrirCajaForm: React.FC<AbrirCajaFormProps> = ({ onClose, onConfirm }) => {
  const [monto, setMonto] = useState<string>('');

  const handleSubmit = () => {
    const montoNumerico = parseFloat(monto);
    if (!isNaN(montoNumerico) && montoNumerico >= 0) {
      onConfirm(montoNumerico);
    } else {
      // Opcional: mostrar un error si el monto no es válido
      alert('Por favor, ingrese un monto válido.');
    }
  };

  return (
    <form className="add-sale-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div className="form-group">
        <label htmlFor="montoInicial">Monto Inicial en Caja</label>
        <input
          type="number"
          id="montoInicial"
          placeholder="Ej: 10000"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          autoFocus // Pone el cursor en el input automáticamente
        />
      </div>
      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onClose}>
          Cancelar
        </button>
        <button type="submit" className="primary-button">
          Confirmar Apertura
        </button>
      </div>
    </form>
  );
};

export default AbrirCajaForm;