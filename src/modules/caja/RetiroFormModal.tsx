import { useState } from 'react';
import Select, { type SingleValue } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import type { Empleado, MotivoRetiro } from '../../types';
import '../ventas/AddSaleForm.css';

type SelectOption = { value: string; label: string };
type MetodoRetiro = 'Efectivo' | 'Transferencia';

interface RetiroFormModalProps {
  onClose: () => void;
  onSave: (retiroData: { 
    monto: number; 
    metodo: MetodoRetiro; 
    motivo: string;
    empleado: {id: string, nombre: string}
  }) => void;
  empleados: Empleado[];
  motivos: MotivoRetiro[];
  onCreateMotivo: (nombreMotivo: string) => Promise<MotivoRetiro>;
}

const RetiroFormModal: React.FC<RetiroFormModalProps> = ({ onClose, onSave, empleados, motivos, onCreateMotivo }) => {
  const [monto, setMonto] = useState('');
  const [metodo, setMetodo] = useState<MetodoRetiro>('Efectivo');
  const [selectedEmpleado, setSelectedEmpleado] = useState<SelectOption | null>(null);
  const [selectedMotivo, setSelectedMotivo] = useState<SelectOption | null>(null);

  const opcionesEmpleado = empleados.map(e => ({ value: e.id, label: e.nombreCompleto }));
  const opcionesMotivo = motivos.map(m => ({ value: m.id, label: m.nombre }));

  const handleCreateMotivo = async (inputValue: string) => {
    // Llama a la función del padre para crear el nuevo motivo en la DB
    const nuevoMotivo = await onCreateMotivo(inputValue);
    // Selecciona automáticamente el motivo recién creado
    if (nuevoMotivo) {
        setSelectedMotivo({ value: nuevoMotivo.id, label: nuevoMotivo.nombre });
    }
  };

  const handleSubmit = () => {
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      alert('Por favor, ingrese un monto válido.');
      return;
    }
    if (!selectedEmpleado) {
      alert('Por favor, seleccione un empleado.');
      return;
    }
    if (!selectedMotivo) {
      alert('Por favor, seleccione o cree un motivo para el retiro.');
      return;
    }

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
        <label htmlFor="empleadoRetiro">Empleado que realiza el retiro</label>
        <Select 
          id="empleadoRetiro"
          options={opcionesEmpleado}
          placeholder="Seleccione un empleado..."
          value={selectedEmpleado}
          onChange={(option: SingleValue<SelectOption>) => setSelectedEmpleado(option)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="motivoRetiro">Motivo del Retiro</label>
        <CreatableSelect
          id="motivoRetiro"
          isClearable
          options={opcionesMotivo}
          value={selectedMotivo}
          onChange={(option: SingleValue<SelectOption>) => setSelectedMotivo(option)}
          onCreateOption={handleCreateMotivo}
          placeholder="Busque o escriba para crear un motivo..."
          formatCreateLabel={inputValue => `Crear motivo: "${inputValue}"`}
        />
      </div>

      <div className="form-group">
        <label>Método de Retiro</label>
        <div className="payment-method-selector">
          {(['Efectivo', 'Transferencia'] as MetodoRetiro[]).map((m) => (
            <div key={m}>
              <input type="radio" id={`ret-${m}`} name="metodoRetiro" value={m} checked={metodo === m} onChange={() => setMetodo(m)} />
              <label htmlFor={`ret-${m}`}>{m}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="montoRetiro">Monto a Retirar</label>
        <input type="number" id="montoRetiro" value={monto} onChange={e => setMonto(e.target.value)} required autoFocus />
      </div>
      
      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
        <button type="submit" className="primary-button">Confirmar Retiro</button>
      </div>
    </form>
  );
};

export default RetiroFormModal;