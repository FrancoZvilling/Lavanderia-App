import React, { useState } from 'react';
import Select from 'react-select';
import { FaTrash, FaPlus } from 'react-icons/fa';
import type { Cliente, TipoDePrenda } from '../../types';
import './AddSaleForm.css';

// Interfaz simplificada: ya no necesitamos 'precio' aquí
interface VentaItem {
  id: number;
  tipoPrendaId: number | null;
  cantidad: number;
}

interface AddSaleFormProps {
  clientes: Cliente[];
  tiposDePrenda: TipoDePrenda[];
  onClose: () => void;
}

const AddSaleForm: React.FC<AddSaleFormProps> = ({ clientes, tiposDePrenda, onClose }) => {
  // Estado para la lista de ítems (sin precio)
  const [items, setItems] = useState<VentaItem[]>([
    { id: Date.now(), tipoPrendaId: null, cantidad: 1 }
  ]);
  
  // 1. NUEVO: Estado para manejar el monto total de la venta
  const [montoTotal, setMontoTotal] = useState<number>(0);

  const opcionesCliente = clientes.map(c => ({ value: c.id, label: `${c.nombre} ${c.apellido}` }));
  const opcionesPrenda = tiposDePrenda.map(p => ({ value: p.id, label: p.nombre }));

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), tipoPrendaId: null, cantidad: 1 }]);
  };

  const handleRemoveItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Función de actualización simplificada (ya no maneja 'precio')
  const handleItemChange = (id: number, field: keyof VentaItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <form className="add-sale-form" onSubmit={(e) => e.preventDefault()}>
      <div className="form-group">
        <label>Cliente</label>
        <Select options={opcionesCliente} placeholder="Busque o seleccione un cliente..." isClearable />
      </div>
      
      <div className="form-group">
        <label>Detalle de Prendas</label>
        <div className="items-container">
          {items.map((item) => (
            <div className="prenda-item-row" key={item.id}>
              <Select
                options={opcionesPrenda}
                placeholder="Prenda..."
                className="prenda-select"
                onChange={(option) => handleItemChange(item.id, 'tipoPrendaId', option?.value || null)}
              />
              <input
                type="number"
                placeholder="Cant."
                min="1"
                className="prenda-cantidad"
                value={item.cantidad}
                onChange={(e) => handleItemChange(item.id, 'cantidad', parseInt(e.target.value) || 1)}
              />
              {/* 2. HEMOS QUITADO el input de precio de aquí */}
              <button
                type="button"
                className="remove-item-btn"
                onClick={() => handleRemoveItem(item.id)}
                disabled={items.length <= 1}
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="add-item-btn" onClick={handleAddItem}>
          <FaPlus /> <span>Añadir otra prenda</span>
        </button>
      </div>

      {/* 3. AÑADIMOS el nuevo campo para el monto total */}
      <div className="form-group">
        <label htmlFor="montoTotal">Monto Total del Lavado</label>
        <input
          type="number"
          id="montoTotal"
          placeholder="Ingrese el precio total"
          value={montoTotal === 0 ? '' : montoTotal}
          onChange={(e) => setMontoTotal(parseFloat(e.target.value) || 0)}
        />
      </div>

      {/* 4. El total ahora refleja el estado 'montoTotal' */}
      <div className="total-container">
        <strong>Total:</strong>
        <span>
          {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(montoTotal)}
        </span>
      </div>

      <div className="form-group">
        <label htmlFor="observaciones">Observaciones (Opcional)</label>
        <textarea id="observaciones" rows={2}></textarea>
      </div>

      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
        <button type="button" className="primary-button">Guardar Venta</button>
      </div>
    </form>
  );
};

export default AddSaleForm;