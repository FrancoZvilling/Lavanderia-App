import React, { useState } from 'react';
import Select, { type SingleValue } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { FaTrash, FaPlus } from 'react-icons/fa';
import type { Cliente, TipoDePrenda, Venta } from '../../types';
import './AddSaleForm.css';

// Interfaz para los ítems DENTRO del formulario. Aún usamos ID numérico para la key de React.
interface VentaItem {
  id: number;
  tipoPrendaId: string | null; // Cambiado a string
  cantidad: number;
}

// Las opciones del selector ahora usan 'string' para el value.
type SelectOption = { value: string; label: string };

interface AddSaleFormProps {
  clientes: Cliente[];
  tiposDePrenda: TipoDePrenda[];
  onClose: () => void;
  // La data que pasamos al guardar ya no incluye id ni fecha
  onSave: (nuevaVentaData: Omit<Venta, 'id' | 'fecha'>) => void;
  // La creación de prenda ahora es asíncrona
  onCreatePrenda: (nombrePrenda: string) => Promise<TipoDePrenda>;
}

const AddSaleForm: React.FC<AddSaleFormProps> = ({ clientes, tiposDePrenda, onClose, onSave, onCreatePrenda }) => {
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [items, setItems] = useState<VentaItem[]>([{ id: Date.now(), tipoPrendaId: null, cantidad: 1 }]);
  const [montoTotal, setMontoTotal] = useState<number>(0);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null); // Cambiado a string
  const [observaciones, setObservaciones] = useState('');

  // Las opciones se mapean con los IDs de tipo string
  const opcionesCliente: SelectOption[] = clientes.map(c => ({ value: c.id, label: `${c.nombre} ${c.apellido}` }));
  const opcionesPrenda: SelectOption[] = tiposDePrenda.map(p => ({ value: p.id, label: p.nombre }));

  const handleAddItem = () => { setItems([...items, { id: Date.now(), tipoPrendaId: null, cantidad: 1 }]); };
  const handleRemoveItem = (id: number) => { setItems(items.filter(item => item.id !== id)); };
  const handleItemChange = (id: number, field: keyof VentaItem, value: any) => { setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item)); };

  // Ahora es una función asíncrona para esperar la creación en la DB
  const handleCreateOption = async (inputValue: string, itemId: number) => {
    // Mostramos un feedback visual mientras se crea
    const prendaSelect = document.querySelector('.prenda-select');
    if (prendaSelect) prendaSelect.classList.add('is-loading');
    
    const nuevaPrenda = await onCreatePrenda(inputValue);
    
    if (prendaSelect) prendaSelect.classList.remove('is-loading');
    
    // Solo actualizamos si la creación fue exitosa
    if (!nuevaPrenda.id.startsWith('error-')) {
      handleItemChange(itemId, 'tipoPrendaId', nuevaPrenda.id);
    }
  };

  const handleSave = () => {
    if (!isAnonymous && !selectedClientId) { alert('Por favor, seleccione un cliente.'); return; }
    if (items.some(item => !item.tipoPrendaId || item.cantidad <= 0)) { alert('Por favor, complete todos los campos de las prendas.'); return; }
    if (montoTotal <= 0) { alert('El monto total debe ser mayor a cero.'); return; }
    
    // Construimos el objeto sin los campos que genera el backend (id, fecha)
    const nuevaVentaData: Omit<Venta, 'id' | 'fecha'> = {
      clienteId: isAnonymous ? null : selectedClientId,
      montoTotal: montoTotal,
      metodoDePago: 'Efectivo',
      items: items
        .filter(item => item.tipoPrendaId !== null) // Filtramos items incompletos
        .map(item => {
          const prenda = tiposDePrenda.find(p => p.id === item.tipoPrendaId);
          return {
            nombrePrenda: prenda ? prenda.nombre : 'Desconocido',
            cantidad: item.cantidad,
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
              <input type="number" placeholder="Cant." min="1" className="prenda-cantidad" value={item.cantidad} onChange={(e) => handleItemChange(item.id, 'cantidad', parseInt(e.target.value) || 1)} />
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