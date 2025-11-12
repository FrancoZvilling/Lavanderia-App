import React, { useState } from 'react';
import Select, { type SingleValue } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { FaTrash, FaPlus } from 'react-icons/fa';
import type { Cliente, TipoDePrenda, Venta, MetodoDePago } from '../../types';
import './AddSaleForm.css';

// --- INTERFAZ MODIFICADA ---
// 'cantidad' ahora puede ser un número o una cadena vacía para manejar el input.
interface VentaItem {
  id: number;
  tipoPrendaId: string | null;
  cantidad: number | '';
}

type SelectOption = { value: string; label: string };

interface AddSaleFormProps {
  clientes: Cliente[];
  tiposDePrenda: TipoDePrenda[];
  onClose: () => void;
  onSave: (nuevaVentaData: Omit<Venta, 'id' | 'fecha'>) => void;
  onCreatePrenda: (nombrePrenda: string) => Promise<TipoDePrenda>;
}

const AddSaleForm: React.FC<AddSaleFormProps> = ({ clientes, tiposDePrenda, onClose, onSave, onCreatePrenda }) => {
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [items, setItems] = useState<VentaItem[]>([{ id: Date.now(), tipoPrendaId: null, cantidad: 1 }]);
  const [montoTotal, setMontoTotal] = useState<number>(0);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [metodoDePago, setMetodoDePago] = useState<MetodoDePago>('Efectivo');

  const opcionesCliente: SelectOption[] = clientes.map(c => ({ value: c.id, label: `${c.nombre} ${c.apellido}` }));
  const opcionesPrenda: SelectOption[] = tiposDePrenda.map(p => ({ value: p.id, label: p.nombre }));

  const handleAddItem = () => { setItems([...items, { id: Date.now(), tipoPrendaId: null, cantidad: 1 }]); };
  const handleRemoveItem = (id: number) => { setItems(items.filter(item => item.id !== id)); };

  // --- LÓGICA DE ACTUALIZACIÓN CORREGIDA ---
  const handleItemChange = (id: number, field: keyof VentaItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        if (field === 'cantidad') {
          // Si el input está vacío, guardamos una cadena vacía en el estado.
          if (value === '') {
            return { ...item, cantidad: '' };
          }
          // Si no, intentamos convertirlo a número.
          const numValue = parseInt(value);
          // Si no es un número válido (ej. "abc"), lo dejamos como estaba o vacío.
          // Si es válido, lo guardamos.
          return { ...item, cantidad: isNaN(numValue) ? '' : numValue };
        }
        // Para otros campos (como tipoPrendaId), la lógica no cambia.
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleCreateOption = async (inputValue: string, itemId: number) => {
    // La lógica de creación de prenda no cambia
    const nuevaPrenda = await onCreatePrenda(inputValue);
    if (!nuevaPrenda.id.startsWith('error-')) {
      handleItemChange(itemId, 'tipoPrendaId', nuevaPrenda.id);
    }
  };

  const handleSave = () => {
    if (!isAnonymous && !selectedClientId) { alert('Por favor, seleccione un cliente.'); return; }
    
    // --- VALIDACIÓN CORREGIDA ---
    // Verificamos que 'cantidad' no sea una cadena vacía o un número <= 0.
    if (items.some(item => !item.tipoPrendaId || item.cantidad === '' || item.cantidad <= 0)) { 
      alert('Por favor, complete todas las prendas con una cantidad válida.'); 
      return; 
    }
    
    if (montoTotal <= 0) { alert('El monto total debe ser mayor a cero.'); return; }
    
    const nuevaVentaData: Omit<Venta, 'id' | 'fecha'> = {
      clienteId: isAnonymous ? null : selectedClientId,
      montoTotal: montoTotal,
      metodoDePago: metodoDePago,
      items: items
        .filter(item => item.tipoPrendaId !== null)
        .map(item => {
          const prenda = tiposDePrenda.find(p => p.id === item.tipoPrendaId);
          return {
            nombrePrenda: prenda ? prenda.nombre : 'Desconocido',
            // Aseguramos que la cantidad se guarde como número
            cantidad: Number(item.cantidad), 
          };
      }),
      observaciones: observaciones,
    };
    onSave(nuevaVentaData);
  };

  return (
    <form className="add-sale-form" onSubmit={(e) => e.preventDefault()}>
      <div className="form-group-inline">
        <input type="checkbox" id="anonymous-sale" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)}/>
        <label htmlFor="anonymous-sale">Venta Anónima (Cliente no registrado)</label>
      </div>
      {!isAnonymous && (
        <div className="form-group">
          <label>Cliente</label>
          <Select 
            options={opcionesCliente} 
            placeholder="Busque o seleccione un cliente..." 
            isClearable
            onChange={(option: SingleValue<SelectOption>) => setSelectedClientId(option ? option.value : null)}
          />
        </div>
      )}
      
      <div className="form-group">
        <label>Prendas</label>
        <div className="items-container">
          {items.map((item) => (
            <div className="prenda-item-row" key={item.id}>
              <CreatableSelect
                isClearable
                options={opcionesPrenda}
                placeholder="Busque o cree una prenda..."
                className="prenda-select"
                classNamePrefix="react-select"
                value={opcionesPrenda.find(opt => opt.value === item.tipoPrendaId)}
                onChange={(option: SingleValue<SelectOption>) => handleItemChange(item.id, 'tipoPrendaId', option?.value || null)}
                onCreateOption={(inputValue) => handleCreateOption(inputValue, item.id)}
                formatCreateLabel={(inputValue) => `Crear "${inputValue}"`}
              />
              {/* --- INPUT DE CANTIDAD CORREGIDO --- */}
              <input 
                type="number" 
                placeholder="Cant." 
                min="1" 
                className="prenda-cantidad" 
                // El value ahora es controlado completamente por el estado
                value={item.cantidad} 
                // El onChange ahora pasa el valor de la cadena directamente
                onChange={(e) => handleItemChange(item.id, 'cantidad', e.target.value)} 
              />
              <button type="button" className="remove-item-btn" onClick={() => handleRemoveItem(item.id)} disabled={items.length <= 1}> <FaTrash /> </button>
            </div>
          ))}
        </div>
        <button type="button" className="add-item-btn" onClick={handleAddItem}> <FaPlus /> <span>Añadir otra prenda</span> </button>
      </div>

      <div className="form-group">
        <label htmlFor="montoTotal">Monto Total del Lavado</label>
        <input type="number" id="montoTotal" placeholder="Ingrese el precio total" value={montoTotal === 0 ? '' : montoTotal} onChange={(e) => setMontoTotal(parseFloat(e.target.value) || 0)} />
      </div>

      <div className="form-group">
        <label>Método de Pago</label>
        <div className="payment-method-selector">
          {(['Efectivo', 'Transferencia', 'Débito', 'Crédito'] as MetodoDePago[]).map((metodo) => (
            <React.Fragment key={metodo}>
              <input 
                type="radio" 
                id={`pay-${metodo}`} 
                name="paymentMethod" 
                value={metodo}
                checked={metodoDePago === metodo}
                onChange={() => setMetodoDePago(metodo)}
              />
              <label htmlFor={`pay-${metodo}`}>{metodo}</label>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="total-container">
        <strong>Total:</strong>
        <span> {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(montoTotal)} </span>
      </div>
      <div className="form-group">
        <label htmlFor="observaciones">Observaciones (Opcional)</label>
        <textarea 
          id="observaciones" 
          rows={2}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        ></textarea>
      </div>
      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
        <button type="button" className="primary-button" onClick={handleSave}>Guardar Venta</button>
      </div>
    </form>
  );
};

export default AddSaleForm;