import { useState } from 'react';
import Select, { type SingleValue } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import type { Empleado, MotivoIngreso } from '../../types';
import '../ventas/AddSaleForm.css';

type SelectOption = { value: string; label: string };
type MetodoIngreso = 'Efectivo' | 'Transferencia';

interface IngresoFormModalProps {
  onClose: () => void;
  onSave: (ingresoData: { monto: number; metodo: MetodoIngreso; motivo: string; empleado: {id: string, nombre: string}}) => void;
  empleados: Empleado[];
  motivos: MotivoIngreso[];
  onCreateMotivo: (nombreMotivo: string) => Promise<MotivoIngreso>;
}

const IngresoFormModal: React.FC<IngresoFormModalProps> = ({ onClose, onSave, empleados, motivos, onCreateMotivo }) => {
  const [monto, setMonto] = useState('');
  const [metodo, setMetodo] = useState<MetodoIngreso>('Efectivo');
  const [selectedMotivo, setSelectedMotivo] = useState<SelectOption | null>(null);
  const [selectedEmpleado, setSelectedEmpleado] = useState<SelectOption | null>(null);

  const opcionesEmpleado = empleados.map(e => ({ value: e.id, label: e.nombreCompleto }));
  const opcionesMotivo = motivos.map(m => ({ value: m.id, label: m.nombre }));

  const handleCreateMotivo = async (inputValue: string) => {
    // Llama a la función del padre para crear el motivo en la base de datos
    const nuevoMotivo = await onCreateMotivo(inputValue);
    // Actualiza el estado local para que el nuevo motivo quede seleccionado
    setSelectedMotivo({ value: nuevoMotivo.id, label: nuevoMotivo.nombre });
  };

  const handleSubmit = () => {
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) { alert('Por favor, ingrese un monto válido.'); return; }
    if (!selectedEmpleado) { alert('Por favor, seleccione un empleado.'); return; }
    if (!selectedMotivo) { alert('Por favor, seleccione o cree un motivo.'); return; }

    onSave({ 
      monto: montoNum, 
      metodo, 
      motivo: selectedMotivo.label, 
      empleado: {id: selectedEmpleado.value, nombre: selectedEmpleado.label} 
    });
  };

  return (
    <form className="add-sale-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div className="form-group">
        <label htmlFor="empleadoIngreso">Empleado que registra el ingreso</label>
        <Select 
          id="empleadoIngreso"
          options={opcionesEmpleado}
          placeholder="Seleccione un empleado..."
          value={selectedEmpleado}
          onChange={(option: SingleValue<SelectOption>) => setSelectedEmpleado(option)}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="motivoIngreso">Motivo del Ingreso</label>
        <CreatableSelect
          id="motivoIngreso"
          isClearable
          options={opcionesMotivo}
          value={selectedMotivo}
          onChange={(option: SingleValue<SelectOption>) => setSelectedMotivo(option)}
          onCreateOption={handleCreateMotivo}
          placeholder="Busque o cree un motivo..."
          formatCreateLabel={inputValue => `Crear "${inputValue}"`}
        />
      </div>
      
      <div className="form-group">
        <label>Método de Ingreso</label>
        <div className="payment-method-selector">
          {(['Efectivo', 'Transferencia'] as MetodoIngreso[]).map((m) => (
            <div key={m}>
              <input type="radio" id={`ing-${m}`} name="metodoIngreso" value={m} checked={metodo === m} onChange={() => setMetodo(m)} />
              <label htmlFor={`ing-${m}`}>{m}</label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="montoIngreso">Monto a Ingresar</label>
        <input type="number" id="montoIngreso" value={monto} onChange={e => setMonto(e.target.value)} required autoFocus />
      </div>
      
      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
        <button type="submit" className="primary-button">Confirmar Ingreso</button>
      </div>
    </form>
  );
};

export default IngresoFormModal;