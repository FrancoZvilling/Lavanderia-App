import React, { useState, useEffect } from 'react';
import Select, { type SingleValue } from 'react-select';
import { FaTrash, FaPlus } from 'react-icons/fa';
import type { Cliente, TipoDePrenda, Venta, MetodoDePago } from '../../types';
import './AddSaleForm.css';

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
  // La prop 'onCreatePrenda' ha sido eliminada
}

const AddSaleForm: React.FC<AddSaleFormProps> = ({ clientes, tiposDePrenda, onClose, onSave }) => {
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [items, setItems] = useState<VentaItem[]>([{ id: Date.now(), tipoPrendaId: null, cantidad: 1 }]);
  const [montoTotal, setMontoTotal] = useState<number>(0);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [metodoDePago, setMetodoDePago] = useState<MetodoDePago>('Efectivo');
  
  // --- NUEVO ESTADO PARA EL MODO MANUAL ---
  const [isManualAmount, setIsManualAmount] = useState<boolean>(false);

  // Opciones con precio en la etiqueta para mayor claridad
  const opcionesCliente: SelectOption[] = clientes.map(c => ({ value: c.id, label: `${c.nombre} ${c.apellido}` }));
  const opcionesPrenda: SelectOption[] = tiposDePrenda.map(p => ({ value: p.id, label: `${p.nombre} (${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(p.precio)})` }));

  // --- useEffect PARA EL CÁLCULO AUTOMÁTICO ---
  useEffect(() => {
    if (!isManualAmount) {
      const totalCalculado = items.reduce((sum, item) => {
        const prenda = tiposDePrenda.find(p => p.id === item.tipoPrendaId);
        const cantidad = typeof item.cantidad === 'number' ? item.cantidad : 0;
        if (prenda && cantidad > 0) {
          return sum + (prenda.precio * cantidad);
        }
        return sum;
      }, 0);
      setMontoTotal(totalCalculado);
    }
  }, [items, isManualAmount, tiposDePrenda]);

  const handleAddItem = () => { setItems([...items, { id: Date.now(), tipoPrendaId: null, cantidad: 1 }]); };
  const handleRemoveItem = (id: number) => { setItems(items.filter(item => item.id !== id)); };

  const handleItemChange = (id: number, field: keyof VentaItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        if (field === 'cantidad') {
          if (value === '') return { ...item, cantidad: '' };
          const numValue = parseInt(value);
          return { ...item, cantidad: isNaN(numValue) ? '' : numValue };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSave = () => {
    if (!isAnonymous && !selectedClientId) { alert('Por favor, seleccione un cliente.'); return; }
    if (items.some(item => !item.tipoPrendaId || item.cantidad === '' || item.cantidad <= 0)) { alert('Por favor, complete todas las prendas con una cantidad válida.'); return; }
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
              {/* --- SELECTOR DE PRENDAS ACTUALIZADO (NO CREABLE) --- */}
              <Select
                options={opcionesPrenda}
                placeholder="Seleccione una prenda..."
                className="prenda-select"
                classNamePrefix="react-select"
                value={opcionesPrenda.find(opt => opt.value === item.tipoPrendaId)}
                onChange={(option: SingleValue<SelectOption>) => handleItemChange(item.id, 'tipoPrendaId', option?.value || null)}
              />
              <input 
                type="number" 
                placeholder="Cant." 
                min="1" 
                className="prenda-cantidad" 
                value={item.cantidad} 
                onChange={(e) => handleItemChange(item.id, 'cantidad', e.target.value)} 
              />
              <button type="button" className="remove-item-btn" onClick={() => handleRemoveItem(item.id)} disabled={items.length <= 1}> <FaTrash /> </button>
            </div>
          ))}
        </div>
        <button type="button" className="add-item-btn" onClick={handleAddItem}> <FaPlus /> <span>Añadir otra prenda</span> </button>
      </div>

      {/* --- NUEVA CASILLA PARA INGRESO MANUAL --- */}
      <div className="form-group-inline">
        <input 
          type="checkbox" 
          id="manual-amount" 
          checked={isManualAmount} 
          onChange={(e) => setIsManualAmount(e.target.checked)}
        />
        <label htmlFor="manual-amount">Ingresar Monto Manualmente</label>
      </div>

      <div className="form-group">
        <label htmlFor="montoTotal">Monto Total del Lavado</label>
        {/* --- INPUT DE MONTO TOTAL CONDICIONALMENTE DESHABILITADO --- */}
        <input 
          type="number" 
          id="montoTotal" 
          placeholder={isManualAmount ? "Ingrese el precio total" : "Calculado automáticamente"}
          value={montoTotal === 0 ? '' : montoTotal} 
          onChange={(e) => setMontoTotal(parseFloat(e.target.value) || 0)} 
          disabled={!isManualAmount} // Clave: se deshabilita si NO es manual
        />
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