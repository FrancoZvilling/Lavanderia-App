import { useState, useMemo } from 'react';
import Select, { type SingleValue } from 'react-select';
import type { Empleado } from '../../types';
import '../ventas/AddSaleForm.css';
import './CerrarCajaForm.css';

// Tipo para las opciones del selector de empleados
type SelectOption = { value: string; label: string };

// La interfaz de props ahora necesita la lista de empleados y una función onConfirm actualizada
interface AbrirCajaFormProps {
  onClose: () => void;
  onConfirm: (montoInicial: number, empleado: { id: string; nombre: string } | null) => void;
  montoCierreAnterior: number | null;
  empleados: Empleado[];
}

const AbrirCajaForm: React.FC<AbrirCajaFormProps> = ({ onClose, onConfirm, montoCierreAnterior, empleados }) => {
  const [monto, setMonto] = useState<string>('');
  // Nuevo estado para guardar el empleado seleccionado
  const [selectedEmpleado, setSelectedEmpleado] = useState<SelectOption | null>(null);

  // Convertimos la lista de empleados al formato que react-select necesita
  const opcionesEmpleado = empleados.map(e => ({ value: e.id, label: e.nombreCompleto }));

  const diferencia = useMemo(() => {
    if (montoCierreAnterior === null || monto === '') return null;
    const montoNumerico = parseFloat(monto);
    if (isNaN(montoNumerico)) return null;
    return montoNumerico - montoCierreAnterior;
  }, [monto, montoCierreAnterior]);

  const getDiferenciaClass = (val: number | null) => {
    if (val === null) return '';
    if (val === 0) return 'arqueo-ok';
    return val > 0 ? 'arqueo-sobrante' : 'arqueo-faltante';
  };
  
  const formatMoneda = (val: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

  const handleSubmit = () => {
    const montoNumerico = parseFloat(monto);
    if (isNaN(montoNumerico) || montoNumerico < 0) {
      alert('Por favor, ingrese un monto válido.');
      return;
    }
    // Añadimos la validación para el empleado
    if (!selectedEmpleado) {
      alert('Por favor, seleccione un empleado.');
      return;
    }
    // Llamamos a onConfirm con ambos valores: monto y empleado
    onConfirm(montoNumerico, { id: selectedEmpleado.value, nombre: selectedEmpleado.label });
  };

  return (
    <form className="add-sale-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      {montoCierreAnterior !== null && (
        <div className="summary-grid">
          <div>Monto del último cierre:</div>
          <div>{formatMoneda(montoCierreAnterior)}</div>
        </div>
      )}

      {/* --- NUEVO CAMPO PARA SELECCIONAR EMPLEADO --- */}
      <div className="form-group">
        <label htmlFor="empleado">Encargado de Apertura</label>
        <Select 
            id="empleado"
            options={opcionesEmpleado}
            placeholder="Seleccione su nombre..."
            value={selectedEmpleado}
            onChange={(option: SingleValue<SelectOption>) => setSelectedEmpleado(option)}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="montoInicial">Monto Inicial en Caja</label>
        <input
          type="number"
          id="montoInicial"
          placeholder="Ingrese el dinero contado"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
        />
      </div>

      {diferencia !== null && (
        <div className="summary-grid arqueo-section">
          <div className="summary-total">Diferencia de Apertura:</div>
          <div className={`summary-total ${getDiferenciaClass(diferencia)}`}>
            {formatMoneda(diferencia)}
          </div>
        </div>
      )}

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