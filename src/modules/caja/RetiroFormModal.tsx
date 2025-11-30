import { useState, useEffect } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import type { Empleado, TipoBeneficiario, ItemBeneficiario } from '../../types';
import '../ventas/AddSaleForm.css';

type SelectOption = { value: string; label: string };
type MetodoRetiro = 'Efectivo' | 'Transferencia';

interface RetiroFormModalProps {
  onClose: () => void;
  onSave: (retiroData: { 
    monto: number; 
    metodo: MetodoRetiro; 
    motivo: string; 
    categoria: string;
    beneficiario: string;
  }) => void;
  empleados: Empleado[];
  tiposDeBeneficiario: TipoBeneficiario[];
  itemsPorTipo: { [key: string]: ItemBeneficiario[] };
  onCreateTipoBeneficiario: (nombre: string) => Promise<TipoBeneficiario>;
  onCreateItemBeneficiario: (tipoId: string, nombre: string) => Promise<ItemBeneficiario>;
}

const RetiroFormModal: React.FC<RetiroFormModalProps> = (props) => {
  const { onClose, onSave, empleados, tiposDeBeneficiario, itemsPorTipo, onCreateTipoBeneficiario, onCreateItemBeneficiario } = props;

  const [monto, setMonto] = useState('');
  const [metodo, setMetodo] = useState<MetodoRetiro>('Efectivo');
  const [motivo, setMotivo] = useState('');
  
  const [selectedTipo, setSelectedTipo] = useState<SelectOption | null>(null);
  const [selectedItem, setSelectedItem] = useState<SelectOption | null>(null);
  const [opcionesItems, setOpcionesItems] = useState<SelectOption[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const opcionesTipo: SelectOption[] = [
    { value: 'empleado', label: 'Empleado' },
    ...tiposDeBeneficiario.map(t => ({ value: t.id, label: t.nombre }))
  ];

  useEffect(() => {
    setSelectedItem(null);
    if (!selectedTipo) {
      setOpcionesItems([]);
      return;
    }
    
    setLoadingItems(true);
    if (selectedTipo.value === 'empleado') {
      setOpcionesItems(empleados.map(e => ({ value: e.id, label: e.nombreCompleto })));
    } else {
      setOpcionesItems((itemsPorTipo[selectedTipo.value] || []).map(i => ({ value: i.id, label: i.nombre })));
    }
    setLoadingItems(false);
  }, [selectedTipo, empleados, itemsPorTipo, tiposDeBeneficiario]);

  const handleCreateTipo = async (inputValue: string) => {
    const nuevoTipo = await onCreateTipoBeneficiario(inputValue);
    if (nuevoTipo && !nuevoTipo.id.startsWith('error-')) {
        setSelectedTipo({ value: nuevoTipo.id, label: nuevoTipo.nombre });
    }
  };

  const handleCreateItem = async (inputValue: string) => {
    if (!selectedTipo) return;
    const nuevoItem = await onCreateItemBeneficiario(selectedTipo.value, inputValue);
    if (nuevoItem && !nuevoItem.id.startsWith('error-')) {
        setSelectedItem({ value: nuevoItem.id, label: nuevoItem.nombre });
    }
  };
  
  const handleSubmit = () => {
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) { alert('Por favor, ingrese un monto válido.'); return; }
    if (!selectedTipo) { alert('Por favor, seleccione una categoría de beneficiario.'); return; }
    if (!selectedItem) { alert('Por favor, seleccione o cree un beneficiario.'); return; }
    if (!motivo.trim()) { alert('Por favor, ingrese un motivo.'); return; }
    
    onSave({
      monto: montoNum,
      metodo,
      motivo: motivo.trim(),
      categoria: selectedTipo.label,
      beneficiario: selectedItem.label
    });
  };

  return (
    <form className="add-sale-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div className="form-group">
        <label>Categoría del Beneficiario</label>
        <CreatableSelect
          isClearable
          options={opcionesTipo}
          value={selectedTipo}
          onChange={(option) => setSelectedTipo(option as SelectOption | null)}
          onCreateOption={handleCreateTipo}
          placeholder="Seleccione o cree una categoría..."
          formatCreateLabel={inputValue => `Crear categoría: "${inputValue}"`}
        />
      </div>

      {selectedTipo && (
        <div className="form-group">
          <label>{selectedTipo.label}</label>
          {selectedTipo.value === 'empleado' ? (
            <Select 
              options={opcionesItems}
              value={selectedItem}
              onChange={(option) => setSelectedItem(option as SelectOption | null)}
              placeholder={`Seleccione un ${selectedTipo.label.toLowerCase()}...`}
              isLoading={loadingItems}
            />
          ) : (
            <CreatableSelect
              options={opcionesItems}
              value={selectedItem}
              onChange={(option) => setSelectedItem(option as SelectOption | null)}
              onCreateOption={handleCreateItem}
              placeholder={`Seleccione o cree un ${selectedTipo.label.toLowerCase()}...`}
              formatCreateLabel={inputValue => `Crear: "${inputValue}"`}
              isLoading={loadingItems}
            />
          )}
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="motivoRetiro">Motivo del Retiro</label>
        <input type="text" id="motivoRetiro" value={motivo} onChange={e => setMotivo(e.target.value)} required />
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
        <input type="number" id="montoRetiro" value={monto} onChange={e => setMonto(e.target.value)} required />
      </div>
      
      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
        <button type="submit" className="primary-button" disabled={!selectedItem || !motivo.trim() || !monto}>Confirmar Retiro</button>
      </div>
    </form>
  );
};

export default RetiroFormModal;