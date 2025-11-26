import { useState } from 'react';
import type { RegistroCaja } from '../../types';
import type { Timestamp } from 'firebase/firestore';
import { FaEye } from 'react-icons/fa';
import Modal from '../../components/Modal';
import DesgloseBilletesModal from './DesgloseBilletesModal';
import '../fidelizacion/PremiosTable.css';
import './HistorialCajaTable.css';

interface HistorialCajaTableProps {
  registros: RegistroCaja[];
  onVerDetalles: (registro: RegistroCaja) => void;
}

const HistorialCajaTable: React.FC<HistorialCajaTableProps> = ({ registros, onVerDetalles }) => {
  const [desgloseVisible, setDesgloseVisible] = useState<{titulo: string, data: any} | null>(null);

  const formatFecha = (fecha?: Timestamp | null) => {
    if (!fecha) return 'N/A';
    return fecha.toDate().toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatMoneda = (monto?: number | null) => {
    if (monto == null) return 'N/A';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);
  };

  const calcularArqueo = (registro: RegistroCaja) => {
    if (registro.montoFinal == null) return 0;
    const ingresosEnEfectivo = registro.totalEfectivo ?? 0;
    const retirosEnEfectivo = registro.totalRetirosEfectivo ?? 0;
    const esperadoEnCaja = registro.montoInicial + ingresosEnEfectivo - retirosEnEfectivo;
    return registro.montoFinal - esperadoEnCaja;
  };
  
  const getArqueoClass = (valor: number) => {
    if (valor === 0) return 'arqueo-ok';
    return valor > 0 ? 'arqueo-sobrante' : 'arqueo-faltante';
  }

  return (
    <>
      <div className="table-container caja-table">
        <table>
          <thead>
            <tr>
              <th>Encargado</th>
              <th>Fecha Apertura</th>
              <th>Monto Inicial</th>
              <th>Dif. Apertura</th>
              <th>Monto Final</th>
              <th>Arqueo</th>
              <th>Fecha Cierre</th>
              <th>Detalle</th> 
            </tr>
          </thead>
          <tbody>
            {registros.map((registro) => {
              const arqueo = calcularArqueo(registro);
              return (
                <tr key={registro.id}>
                  <td data-label="Encargado" className="encargado-principal">
                    <strong>{registro.empleadoNombre || 'No definido'}</strong>
                  </td>
                  <td data-label="Apertura">{formatFecha(registro.fechaApertura)}</td>
                  
                  {/* Celda de Monto Inicial ahora es clicable */}
                  <td 
                    data-label="Monto Inicial" 
                    className={registro.desgloseApertura ? 'clickable-cell' : ''}
                    onClick={() => registro.desgloseApertura && setDesgloseVisible({titulo: 'Desglose de Apertura', data: registro.desgloseApertura})}
                    title={registro.desgloseApertura ? "Ver desglose" : ""}
                  >
                    {formatMoneda(registro.montoInicial)}
                  </td>

                  <td data-label="Dif. Apertura" className={getArqueoClass(registro.diferenciaApertura || 0)}>
                    {formatMoneda(registro.diferenciaApertura || 0)}
                  </td>

                  {/* Celda de Monto Final ahora es clicable */}
                  <td 
                    data-label="Monto Final" 
                    className={registro.desgloseCierre ? 'clickable-cell' : ''}
                    onClick={() => registro.desgloseCierre && setDesgloseVisible({titulo: 'Desglose de Cierre', data: registro.desgloseCierre})}
                    title={registro.desgloseCierre ? "Ver desglose" : ""}
                  >
                    {formatMoneda(registro.montoFinal)}
                  </td>

                  <td data-label="Arqueo" className={getArqueoClass(arqueo)}>
                    {formatMoneda(arqueo)}
                  </td>
                  <td data-label="Cierre">{formatFecha(registro.fechaCierre)}</td>
                  <td data-label="Detalle">
                    <button 
                      className="secondary-button small-button"
                      onClick={() => onVerDetalles(registro)}
                      title="Ver detalle de ingresos"
                    >
                      <FaEye /> <span>Ver</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Renderizado del Modal para el desglose de billetes */}
      {desgloseVisible && (
        <Modal 
          isOpen={!!desgloseVisible} 
          onClose={() => setDesgloseVisible(null)} 
          title={desgloseVisible.titulo}
        >
          <DesgloseBilletesModal desglose={desgloseVisible.data} />
        </Modal>
      )}
    </>
  );
};

export default HistorialCajaTable;