import { useState, useMemo } from 'react';
import type { Cliente, Venta } from '../../types';
import './VentaDetallesModal.css';
// Importamos los estilos del formulario para reutilizar las clases del resumen de total
import './AddSaleForm.css';

interface VentaDetallesModalProps {
  venta: Venta;
  cliente: Cliente | undefined;
  onSaveChanges: (ventaId: string, nuevasObservaciones: string) => void;
}

const VentaDetallesModal: React.FC<VentaDetallesModalProps> = ({ venta, cliente, onSaveChanges }) => {
  const [observaciones, setObservaciones] = useState(venta.observaciones || '');
  const [hasChanges, setHasChanges] = useState(false);

  const handleObservacionesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setObservaciones(e.target.value);
    if (e.target.value !== (venta.observaciones || '')) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  };

  const handleGuardar = () => {
    onSaveChanges(venta.id, observaciones);
    setHasChanges(false);
  };

  const formatMoneda = (monto: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);

  // --- LÓGICA PARA CALCULAR EL DESGLOSE DEL PRECIO ---
  const { subtotal, montoDescuento } = useMemo(() => {
    // Si el cliente tiene un descuento fijo y es mayor a 0
    if (cliente?.descuentoFijo && cliente.descuentoFijo > 0) {
      // Usamos la fórmula inversa para calcular el subtotal original antes del descuento
      // total = subtotal * (1 - descuento/100) => subtotal = total / (1 - descuento/100)
      const sub = venta.montoTotal / (1 - (cliente.descuentoFijo / 100));
      const desc = sub - venta.montoTotal;
      return { subtotal: sub, montoDescuento: desc };
    }
    // Si no hubo descuento, el subtotal es simplemente el monto total de la venta
    return { subtotal: venta.montoTotal, montoDescuento: 0 };
  }, [venta.montoTotal, cliente?.descuentoFijo]);

  return (
    <div className="detalles-container">
      <div className="detalle-seccion">
        <h4>Ticket N° {venta.nroTicket}</h4>
      </div>
      <div className="detalle-seccion">
        <h4>Cliente</h4>
        <p>{cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente Anónimo'}</p>
      </div>

      {cliente && cliente.telefono && (
        <div className="detalle-seccion">
          <h4>Teléfono</h4>
          <p>{cliente.telefono}</p>
        </div>
      )}
      
      <div className="detalle-seccion">
        <h4>Prendas Incluidas</h4>
        <ul className="prenda-lista">
          {venta.items.map((item, index) => (
            <li key={index}>
              <span>{item.cantidad}x</span> {item.nombrePrenda}
            </li>
          ))}
        </ul>
      </div>

      <div className="detalle-seccion">
        <h4>Observaciones</h4>
        <textarea
          className="observaciones-textarea"
          rows={4}
          value={observaciones}
          onChange={handleObservacionesChange}
          placeholder="Añada o edite las observaciones aquí..."
        />
      </div>

      {/* --- SECCIÓN DE TOTALES ACTUALIZADA CON EL DESGLOSE --- */}
      <div className="total-summary" style={{ marginTop: 0 }}>
        <div className="summary-row">
            <span>Subtotal:</span>
            <span>{formatMoneda(subtotal)}</span>
        </div>
        {/* Solo mostramos la fila del descuento si el monto del descuento es mayor a 0 */}
        {montoDescuento > 0 && (
            <div className="summary-row discount">
                <span>Descuento ({cliente?.descuentoFijo}%):</span>
                <span>- {formatMoneda(montoDescuento)}</span>
            </div>
        )}
      </div>

      <div className="total-container">
        <strong>Total Pagado:</strong>
        <span>{formatMoneda(venta.montoTotal)}</span>
      </div>

      <div className="modal-actions-footer">
        <button 
          className="primary-button" 
          onClick={handleGuardar} 
          disabled={!hasChanges}
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};

export default VentaDetallesModal;