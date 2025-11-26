import type { Ingreso } from '../../types';
import type { Timestamp } from 'firebase/firestore';
import '../fidelizacion/PremiosTable.css'; 

interface IngresosHistorialProps {
  ingresos: Ingreso[];
}

const IngresosHistorial: React.FC<IngresosHistorialProps> = ({ ingresos }) => {
  const formatFecha = (fecha: Timestamp) => fecha.toDate().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
  const formatMoneda = (monto: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);

  if (ingresos.length === 0) {
    return <p style={{textAlign: 'center', color: '#7f8c8d'}}>No se han registrado ingresos manuales.</p>
  }

  return (
    <div className="table-container premios-table">
      <table>
        <thead>
          <tr>
            <th>Encargado</th>
            <th>Fecha</th>
            <th>Motivo</th>
            <th>Monto</th>
            <th>Método</th>
          </tr>
        </thead>
        <tbody>
          {ingresos.map((ingreso) => (
            <tr key={ingreso.id}>
              <td data-label="Encargado"><strong>{ingreso.empleadoNombre}</strong></td>
              <td data-label="Fecha">{formatFecha(ingreso.fecha)}</td>
              <td data-label="Motivo">{ingreso.motivo}</td>
              <td data-label="Monto">{formatMoneda(ingreso.monto)}</td>
              <td data-label="Método">{ingreso.metodo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IngresosHistorial;