import React, { useState } from 'react';
import Select from 'react-select';
import { FaTrash, FaPlus } from 'react-icons/fa';
// 1. Importamos el tipo Venta para poder construir el objeto
import type { Cliente, TipoDePrenda, Venta } from '../../types';
import './AddSaleForm.css';

interface VentaItem {
  id: number;
  tipoPrendaId: number | null;
  cantidad: number;
}

interface AddSaleFormProps {
  clientes: Cliente[];
  tiposDePrenda: TipoDePrenda[];
  onClose: () => void;
  onSave: (nuevaVenta: Venta) => void; // Prop para guardar la venta
}

const AddSaleForm: React.FC<AddSaleFormProps> = ({ clientes, tiposDePrenda, onClose, onSave }) => {
  // 2. Nuevo estado para la casilla de venta anónima
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  
  const [items, setItems] = useState<VentaItem[]>([{ id: Date.now(), tipoPrendaId: null, cantidad: 1 }]);
  const [montoTotal, setMontoTotal] = useState<number>(0);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const opcionesCliente = clientes.map(c => ({ value: c.id, label: `${c.nombre} ${c.apellido}` }));
  const opcionesPrenda = tiposDePrenda.map(p => ({ value: p.id, label: p.nombre, ...p }));

  // ... (las funciones handleAddItem, handleRemoveItem, handleItemChange no cambian)
  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), tipoPrendaId: null, cantidad: 1 }]);
  };
  const handleRemoveItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };
  const handleItemChange = (id: number, field: keyof VentaItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSave = () => {
    // Validaciones básicas
    if (!isAnonymous && !selectedClientId) {
      alert('Por favor, seleccione un cliente.');
      return;
    }
    if (items.some(item => !item.tipoPrendaId || item.cantidad <= 0)) {
        alert('Por favor, complete todos los campos de las prendas.');
        return;
    }
    if (montoTotal <= 0) {
        alert('El monto total debe ser mayor a cero.');
        return;
    }

    // Construimos el objeto de la nueva venta
    const nuevaVenta: Venta = {
      id: Date.now(),
      fecha: new Date(),
      clienteId: isAnonymous ? null : selectedClientId,
      montoTotal: montoTotal,
      metodoDePago: 'Efectivo', // Método por defecto
      items: items.map(item => {
        const prenda = tiposDePrenda.find(p => p.id === item.tipoPrendaId);
        return {
          nombrePrenda: prenda ? prenda.nombre : 'Desconocido',
          cantidad: item.cantidad
        };
      }),
      // Podríamos añadir las observaciones aquí
    };

    onSave(nuevaVenta); // Llamamos a la función del padre
  };

  return (
    <form className="add-sale-form" onSubmit={(e) => e.preventDefault()}>
      
      {/* 3. Casilla de verificación para venta anónima */}
      <div className="form-group-inline">
        <input 
          type="checkbox" 
          id="anonymous-sale" 
          checked={isAnonymous} 
          onChange={(e) => setIsAnonymous(e.target.checked)}
        />
        <label htmlFor="anonymous-sale">Venta Anónima (Cliente no registrado)</label>
      </div>

      {/* 4. El selector de cliente solo se muestra si la casilla NO está marcada */}
      {!isAnonymous && (
        <div className="form-group">
          <label>Cliente</label>
          <Select 
            options={opcionesCliente} 
            placeholder="Busque o seleccione un cliente..." 
            isClearable
            onChange={(option) => setSelectedClientId(option ? option.value : null)}
          />
        </div>
      )}
      
      {/* ... (el resto del formulario sigue igual) ... */}
      <div className="form-group">
        <label>Detalle de Prendas</label>
        <div className="items-container">
          {items.map((item) => (
            <div className="prenda-item-row" key={item.id}>
              <Select options={opcionesPrenda} placeholder="Prenda..." className="prenda-select" onChange={(option) => handleItemChange(item.id, 'tipoPrendaId', option?.value || null)} />
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
        <textarea id="observaciones" rows={2}></textarea>
      </div>

      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
        <button type="button" className="primary-button" onClick={handleSave}>Guardar Venta</button>
      </div>
    </form>
  );
};

export default AddSaleForm;