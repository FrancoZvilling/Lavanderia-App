import type { TipoDePrenda } from '../../types';
import { FaEdit } from 'react-icons/fa';
// Importamos el CSS de la tabla de premios para reutilizar sus estilos responsivos
import '../fidelizacion/PremiosTable.css';

interface PrendasTableProps {
  prendas: TipoDePrenda[];
  onEdit: (prenda: TipoDePrenda) => void;
}

const PrendasTable: React.FC<PrendasTableProps> = ({ prendas, onEdit }) => {
  return (
    // Añadimos la clase 'premios-table' para que herede los estilos de tarjeta
    <div className="table-container premios-table">
      <table>
        <thead>
          <tr>
            <th>Nombre de la Prenda</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {prendas.map((prenda) => (
            <tr key={prenda.id}>
              <td data-label="Nombre"><strong>{prenda.nombre}</strong></td>
              <td data-label="Precio">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(prenda.precio)}</td>
              <td data-label="Acciones" className="acciones">
                <button className="secondary-button small-button" onClick={() => onEdit(prenda)}>
                  <FaEdit /> <span>Editar</span>
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