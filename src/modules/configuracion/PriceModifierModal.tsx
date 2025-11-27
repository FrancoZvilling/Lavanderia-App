import { useState } from 'react';
import Select, { type SingleValue } from 'react-select';
import type { TipoDePrenda, CategoriaPrenda } from '../../types';
import Modal from '../../components/Modal';
import PrendaSelectorModal from './PrendaSelectorModal';
import '../ventas/AddSaleForm.css'; // Reutilizamos estilos de formulario

// Definimos los tipos locales para claridad
type Alcance = 'todo' | 'categoria' | 'manual';
type Accion = 'aumentar' | 'disminuir';
type SelectOption = { value: string; label: string };

interface PriceModifierModalProps {
  onClose: () => void;
  onConfirm: (alcance: Alcance, porcentaje: number, targetId?: string, targetList?: string[]) => void;
  prendas: TipoDePrenda[];
  categorias: CategoriaPrenda[];
}

const PriceModifierModal: React.FC<PriceModifierModalProps> = ({ onClose, onConfirm, prendas, categorias }) => {
  const [alcance, setAlcance] = useState<Alcance>('todo');
  const [accion, setAccion] = useState<Accion>('aumentar');
  const [porcentaje, setPorcentaje] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<SelectOption | null>(null);
  const [prendasSeleccionadas, setPrendasSeleccionadas] = useState<string[]>([]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const opcionesCategoria = categorias.map(c => ({ value: c.id, label: c.nombre }));

  const handleSubmit = () => {
    const porcNum = parseFloat(porcentaje);
    if (isNaN(porcNum) || porcNum <= 0) {
      alert('Por favor, ingrese un porcentaje válido y mayor a cero.');
      return;
    }
    if (alcance === 'categoria' && !selectedCategoria) {
      alert('Por favor, seleccione una categoría.');
      return;
    }
    if (alcance === 'manual' && prendasSeleccionadas.length === 0) {
      alert('Por favor, seleccione al menos una prenda.');
      return;
    }

    const finalPorcentaje = accion === 'aumentar' ? porcNum : -porcNum;
    onConfirm(alcance, finalPorcentaje, selectedCategoria?.value, prendasSeleccionadas);
  };

  return (
    <>
      <form className="add-sale-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        
        <div className="form-group">
          <label>1. Seleccione el alcance del ajuste</label>
          <div className="payment-method-selector">
            <input type="radio" id="alcance-todo" name="alcance" value="todo" checked={alcance === 'todo'} onChange={() => setAlcance('todo')} />
            <label htmlFor="alcance-todo">Todas las Prendas</label>
            <input type="radio" id="alcance-cat" name="alcance" value="categoria" checked={alcance === 'categoria'} onChange={() => setAlcance('categoria')} />
            <label htmlFor="alcance-cat">Por Categoría</label>
            <input type="radio" id="alcance-manual" name="alcance" value="manual" checked={alcance === 'manual'} onChange={() => setAlcance('manual')} />
            <label htmlFor="alcance-manual">Selección Manual</label>
          </div>
        </div>

        {alcance === 'categoria' && (
          <div className="form-group">
            <Select
              options={opcionesCategoria}
              placeholder="Seleccione una categoría..."
              value={selectedCategoria}
              onChange={(option: SingleValue<SelectOption>) => setSelectedCategoria(option)}
            />
          </div>
        )}

        {alcance === 'manual' && (
          <div className="form-group">
            <button type="button" className="secondary-button" style={{width: '100%'}} onClick={() => setIsSelectorOpen(true)}>
              Seleccionar Prendas ({prendasSeleccionadas.length} seleccionadas)
            </button>
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />

        <div className="form-group">
          <label>2. Defina el ajuste de precio</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Select
              options={[{value: 'aumentar', label: 'Aumentar'}, {value: 'disminuir', label: 'Disminuir'}]}
              value={{value: accion, label: accion === 'aumentar' ? 'Aumentar' : 'Disminuir'}}
              onChange={(option) => setAccion(option?.value as Accion)}
              styles={{ container: (base) => ({ ...base, flex: 1 }) }}
            />
            <input 
              type="number" 
              value={porcentaje}
              onChange={e => setPorcentaje(e.target.value)}
              placeholder="Ej: 10"
              style={{ width: '100px', textAlign: 'center' }}
            />
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>%</span>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
          <button type="submit" className="primary-button">Previsualizar y Aplicar</button>
        </div>
      </form>

      {/* Sub-Modal para la selección de prendas */}
      <Modal isOpen={isSelectorOpen} onClose={() => setIsSelectorOpen(false)} title="Seleccionar Prendas Manualmente">
        <PrendaSelectorModal 
          prendas={prendas}
          seleccionInicial={prendasSeleccionadas}
          onConfirm={setPrendasSeleccionadas}
          onClose={() => setIsSelectorOpen(false)}
        />
      </Modal>
    </>
  );
};

export default PriceModifierModal;