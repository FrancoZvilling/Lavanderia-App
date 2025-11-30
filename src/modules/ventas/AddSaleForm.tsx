import React, { useState, useEffect, useMemo } from 'react';
import Select, { type SingleValue } from 'react-select'; 
import CreatableSelect from 'react-select/creatable';
import { FaTrash, FaPlus } from 'react-icons/fa';
import type { Cliente, TipoDePrenda, Venta, MetodoDePago } from '../../types';
import Modal from '../../components/Modal';
import AddClientMiniForm from './AddClientMiniForm';
import './AddSaleForm.css';

interface VentaItem {
  id: number;
  tipoPrendaId: string | null;
  cantidad: number | '';
}

type SelectOption = { value: string; label: string };

interface AddSaleFormProps {
  nroTicket: string | null;
  clientes: Cliente[];
  tiposDePrenda: TipoDePrenda[];
  onClose: () => void;
  onSave: (nuevaVentaData: Omit<Venta, 'id' | 'fecha' | 'cajaId' | 'nroTicket'>) => void;
  onCreateCliente: (
    nombreCompleto: string, 
    telefono: string, 
    email: string, 
    descuento: number, 
    observaciones: string
  ) => Promise<Cliente | null>;
}

const AddSaleForm: React.FC<AddSaleFormProps> = ({ nroTicket, clientes, tiposDePrenda, onClose, onSave, onCreateCliente }) => {
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [items, setItems] = useState<VentaItem[]>([{ id: Date.now(), tipoPrendaId: null, cantidad: 1 }]);
  const [montoTotal, setMontoTotal] = useState<number>(0);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [metodoDePago, setMetodoDePago] = useState<MetodoDePago>('Efectivo');
  const [isManualAmount, setIsManualAmount] = useState<boolean>(false);
  
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');

  const opcionesCliente: SelectOption[] = clientes.map(c => ({ value: c.id, label: `${c.nombre} ${c.apellido}` }));
  const opcionesPrenda: SelectOption[] = tiposDePrenda.map(p => ({ value: p.id, label: `${p.nombre} (${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(p.precio)})` }));

  const clienteSeleccionado = useMemo(() => {
    return clientes.find(c => c.id === selectedClientId);
  }, [selectedClientId, clientes]);

  useEffect(() => {
    if (isManualAmount) {
      setSubtotal(0);
      return;
    };

    const calculatedSubtotal = items.reduce((sum, item) => {
      const prenda = tiposDePrenda.find(p => p.id === item.tipoPrendaId);
      const cantidad = typeof item.cantidad === 'number' ? item.cantidad : 0;
      if (prenda && cantidad > 0) {
        return sum + (prenda.precio * cantidad);
      }
      return sum;
    }, 0);
    
    setSubtotal(calculatedSubtotal);

    if (clienteSeleccionado?.descuentoFijo && clienteSeleccionado.descuentoFijo > 0) {
      const descuento = calculatedSubtotal * (clienteSeleccionado.descuentoFijo / 100);
      setMontoTotal(calculatedSubtotal - descuento);
    } else {
      setMontoTotal(calculatedSubtotal);
    }
  }, [items, isManualAmount, tiposDePrenda, clienteSeleccionado]);

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

  const handleCreateClienteOption = (inputValue: string) => {
    setNewClientName(inputValue);
    setIsClientModalOpen(true);
  };

  const handleSaveNewCliente = async (clienteData: { 
    nombreCompleto: string; 
    telefono: string;
    email: string;
    descuento: number;
    observaciones: string;
  }) => {
    const nuevoCliente = await onCreateCliente(
      clienteData.nombreCompleto, 
      clienteData.telefono,
      clienteData.email,
      clienteData.descuento,
      clienteData.observaciones
    );
    if (nuevoCliente) {
      setSelectedClientId(nuevoCliente.id);
    }
    setIsClientModalOpen(false);
  };

  const handleSave = () => {
    if (!isAnonymous && !selectedClientId) { alert('Por favor, seleccione un cliente.'); return; }
    if (items.some(item => !item.tipoPrendaId || item.cantidad === '' || item.cantidad <= 0)) { alert('Por favor, complete todas las prendas con una cantidad válida.'); return; }
    if (montoTotal < 0) { alert('El monto total no puede ser negativo.'); return; }
    if (montoTotal === 0 && (clienteSeleccionado?.descuentoFijo ?? 0) < 100 && !window.confirm("El total es $0.00, ¿desea continuar?")) return;
    
    const nuevaVentaData: Omit<Venta, 'id' | 'fecha' | 'cajaId' | 'nroTicket'> = {
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
    <>
      <form className="add-sale-form" onSubmit={(e) => e.preventDefault()}>
        {nroTicket && (
          <div className="ticket-display">
            Ticket N°: <strong>{nroTicket}</strong>
          </div>
        )}
        
        <div className="form-group-inline">
          <input type="checkbox" id="anonymous-sale" checked={isAnonymous} onChange={(e) => { setIsAnonymous(e.target.checked); if(e.target.checked) setSelectedClientId(null); }} />
          <label htmlFor="anonymous-sale">Venta Anónima (Cliente no registrado)</label>
        </div>
        {!isAnonymous && (
          <div className="form-group">
            <label>Cliente</label>
            <CreatableSelect
              isClearable
              options={opcionesCliente}
              placeholder="Busque o cree un cliente..."
              value={opcionesCliente.find(opt => opt.value === selectedClientId)}
              onChange={(option: SingleValue<SelectOption>) => setSelectedClientId(option ? option.value : null)}
              onCreateOption={handleCreateClienteOption}
              formatCreateLabel={inputValue => `Crear "${inputValue}"`}
            />
          </div>
        )}
        
        <div className="form-group">
          <label>Servicio</label>
          <div className="items-container">
            {items.map((item) => (
              <div className="prenda-item-row" key={item.id}>
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

        <div className="form-group-inline">
          <input type="checkbox" id="manual-amount" checked={isManualAmount} onChange={(e) => setIsManualAmount(e.target.checked)} />
          <label htmlFor="manual-amount">Ingresar Monto Manualmente</label>
        </div>

        <div className="form-group">
          <label htmlFor="montoTotal">Monto Total del Lavado</label>
          <input 
            type="number" 
            id="montoTotal" 
            placeholder={isManualAmount ? "Ingrese el precio total" : "Calculado automáticamente"}
            value={montoTotal === 0 ? '' : montoTotal} 
            onChange={(e) => setMontoTotal(parseFloat(e.target.value) || 0)} 
            disabled={!isManualAmount}
          />
        </div>

        <div className="form-group">
          <label>Método de Pago</label>
          <div className="payment-method-selector">
            {(['Efectivo', 'Transferencia', 'Débito', 'Crédito', 'Cuenta Corriente'] as MetodoDePago[]).map((metodo) => (
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
        
        {/* --- SECCIÓN DE RESUMEN DE TOTALES CORREGIDA --- */}
        {!isManualAmount && subtotal > 0 && (
          <div className="total-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(subtotal)}</span>
            </div>
            {/* Lógica ternaria para mostrar descuento o "Sin descuento" */}
            {clienteSeleccionado && (
              (clienteSeleccionado.descuentoFijo && clienteSeleccionado.descuentoFijo > 0) ? (
                <div className="summary-row discount">
                  <span>Descuento ({clienteSeleccionado.descuentoFijo}%):</span>
                  <span>- {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(subtotal - montoTotal)}</span>
                </div>
              ) : (
                <div className="summary-row no-discount">
                  <span>Descuento:</span>
                  <span>Sin descuento</span>
                </div>
              )
            )}
          </div>
        )}

        <div className="total-container">
          <strong>Total a Pagar:</strong>
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
      
      <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="Crear Nuevo Cliente">
        <AddClientMiniForm 
          nombreInicial={newClientName}
          onClose={() => setIsClientModalOpen(false)}
          onSave={handleSaveNewCliente}
        />
      </Modal>
    </>
  );
};

export default AddSaleForm;