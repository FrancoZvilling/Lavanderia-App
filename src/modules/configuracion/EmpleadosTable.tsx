import type { Empleado } from '../../types';
import { FaEdit, FaTrash, FaKey } from 'react-icons/fa'; // Importamos el icono de llave
import '../fidelizacion/PremiosTable.css';

interface EmpleadosTableProps {
  empleados: Empleado[];
  onEdit: (empleado: Empleado) => void;
  onDelete: (empleado: Empleado) => void;
  onSetPin: (empleado: Empleado) => void; // Nueva prop
}

const EmpleadosTable: React.FC<EmpleadosTableProps> = ({ empleados, onEdit, onDelete, onSetPin }) => {
  return (
    <div className="table-container premios-table">
      <table>
        <thead>
          <tr>
            <th>Nombre y Apellido</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map((empleado) => (
            <tr key={empleado.id}>
              <td data-label="Nombre"><strong>{empleado.nombreCompleto}</strong></td>
              <td data-label="Acciones" className="acciones">
                <button className="secondary-button small-button" onClick={() => onEdit(empleado)}>
                  <FaEdit /> <span>Editar</span>
                </button>
                {/* Botón para configurar/cambiar el PIN */}
                <button className="secondary-button small-button" onClick={() => onSetPin(empleado)}>
                  <FaKey /> <span>{empleado.pinHash ? 'Cambiar PIN' : 'Crear PIN'}</span>
                </button>
                <button className="secondary-button small-button toggle-btn desactivar" onClick={() => onDelete(empleado)}>
                  <FaTrash /> <span>Eliminar</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmpleadosTable;