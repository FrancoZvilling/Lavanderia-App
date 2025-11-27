import type { TipoDePrenda } from '../../types';
import { FaEdit, FaTrash } from 'react-icons/fa';
import '../fidelizacion/PremiosTable.css';

interface PrendasTableProps {
  prendas: TipoDePrenda[];
  onEdit: (prenda: TipoDePrenda) => void;
  onDelete: (prenda: TipoDePrenda) => void;
}

const PrendasTable: React.FC<PrendasTableProps> = ({ prendas, onEdit, onDelete }) => {
  return (
    <div className="table-container premios-table">
      <table>
        <thead>
          <tr>
            <th>Nombre de la Prenda</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {prendas.map((prenda) => (
            <tr key={prenda.id}>
              <td data-label="Nombre"><strong>{prenda.nombre}</strong></td>
              <td data-label="Categoría">{prenda.categoriaNombre || 'Sin categoría'}</td>
              <td data-label="Precio">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(prenda.precio)}</td>
              <td data-label="Acciones" className="acciones">
                <button className="secondary-button small-button" onClick={() => onEdit(prenda)}>
                  <FaEdit /> <span>Editar</span>
                </button>
                <button className="secondary-button small-button toggle-btn desactivar" onClick={() => onDelete(prenda)}>
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

export default PrendasTable;