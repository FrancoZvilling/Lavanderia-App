import { useState } from 'react';
import type { Cliente, Venta } from '../../types';
import './VentaDetallesModal.css';

// 1. Actualizamos la interfaz para recibir la función de guardado
interface VentaDetallesModalProps {
  venta: Venta;
  cliente: Cliente | undefined;
  onSaveChanges: (ventaId: string, nuevasObservaciones: string) => void;
}

const VentaDetallesModal: React.FC<VentaDetallesModalProps> = ({ venta, cliente, onSaveChanges }) => {
  // 2. Añadimos estados para manejar la edición
  const [observaciones, setObservaciones] = useState(venta.observaciones || '');
  const [hasChanges, setHasChanges] = useState(false);

  // Función que se ejecuta cada vez que el usuario escribe en el textarea
  const handleObservacionesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setObservaciones(e.target.value);
    // Comparamos con el valor original para saber si hay cambios reales
    if (e.target.value !== (venta.observaciones || '')) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  };

  // Función que se llama al hacer clic en "Guardar Cambios"
  const handleGuardar = () => {
    onSaveChanges(venta.id, observaciones);
    // Reseteamos el estado de cambios para deshabilitar el botón de nuevo
    setHasChanges(false);
  };

  const formatMoneda = (monto: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);

  return (
    <div className="detalles-container">
      <div className="detalle-seccion">
        <h4>Ticket N° {venta.nroTicket}</h4>
      </div>
      <div className="detalle-seccion">
        <h4>Cliente</h4>
        <p>{cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente Anónimo'}</p>
      </div>
      
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

      {/* --- SECCIÓN DE OBSERVACIONES MODIFICADA --- */}
      <div className="detalle-seccion">
        <h4>Observaciones</h4>
        {/* Reemplazamos el <p> por un <textarea> interactivo */}
        <textarea
          className="observaciones-textarea"
          rows={4}
          value={observaciones}
          onChange={handleObservacionesChange}
          placeholder="Añada o edite las observaciones aquí..."
        />
      </div>

      <div className="detalle-seccion total-final">
        <h4>Monto Total Pagado</h4>
        <p>
          {formatMoneda(venta.montoTotal)}
        </p>
      </div>

      {/* --- NUEVA SECCIÓN PARA EL BOTÓN DE GUARDADO --- */}
      <div className="modal-actions-footer">
        <button 
          className="primary-button" 
          onClick={handleGuardar} 
          disabled={!hasChanges} // El botón está deshabilitado si no hay cambios
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};

export default VentaDetallesModal;