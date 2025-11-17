import type { Premio } from '../../types';
import { FaEdit, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import './PremiosTable.css';

interface PremiosTableProps {
  premios: Premio[];
  onEdit: (premio: Premio) => void;
  onToggleActive: (premio: Premio) => void;
}

const PremiosTable: React.FC<PremiosTableProps> = ({ premios, onEdit, onToggleActive }) => {
  return (
    <div className="table-container premios-table">
      <table>
        <thead>
          <tr>
            <th>Nombre del Premio</th>
            <th>Puntos Requeridos</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {premios.map((premio) => (
            <tr key={premio.id}>
              <td data-label="Nombre del Premio">
                <strong>{premio.nombre}</strong>
                <p className="descripcion-premio">{premio.descripcion}</p>
              </td>
              <td data-label="Puntos" className="puntos">{premio.puntosRequeridos.toLocaleString('es-AR')}</td>
              <td data-label="Estado">
                <span className={`status-badge ${premio.activo ? 'activo' : 'inactivo'}`}>
                  {premio.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td data-label="Acciones" className="acciones">
                {/* --- CORRECCIÓN: Texto envuelto en <span> --- */}
                <button className="secondary-button small-button" onClick={() => onEdit(premio)}>
                  <FaEdit /> <span>Editar</span>
                </button>
                <button 
                  className={`secondary-button small-button toggle-btn ${premio.activo ? 'desactivar' : 'activar'}`} 
                  onClick={() => onToggleActive(premio)}
                >
                  {premio.activo ? <FaToggleOff /> : <FaToggleOn />}
                  {/* --- CORRECCIÓN: Textos envueltos en <span> --- */}
                  {premio.activo ? <span>Desactivar</span> : <span>Activar</span>}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PremiosTable;