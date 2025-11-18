import type { Retiro } from '../../types';
import type { Timestamp } from 'firebase/firestore';
// Reutilizamos los estilos de tabla responsiva que ya creamos
import '../fidelizacion/PremiosTable.css'; 

interface RetirosHistorialProps {
  retiros: Retiro[];
}

const RetirosHistorial: React.FC<RetirosHistorialProps> = ({ retiros }) => {
  const formatFecha = (fecha: Timestamp) => fecha.toDate().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
  const formatMoneda = (monto: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);

  if (retiros.length === 0) {
    return <p style={{textAlign: 'center', color: '#7f8c8d', padding: '20px'}}>No se han registrado retiros para el período seleccionado.</p>
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
          {retiros.map((retiro) => (
            <tr key={retiro.id}>
              <td data-label="Encargado"><strong>{retiro.empleadoNombre}</strong></td>
              <td data-label="Fecha">{formatFecha(retiro.fecha)}</td>
              <td data-label="Motivo">{retiro.motivo}</td>
              <td data-label="Monto">{formatMoneda(retiro.monto)}</td>
              <td data-label="Método">{retiro.metodo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RetirosHistorial;