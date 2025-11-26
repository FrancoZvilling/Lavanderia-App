import { useState, useEffect, useMemo } from 'react';
import Select, { type SingleValue } from 'react-select';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import bcrypt from 'bcryptjs';
import type { Empleado } from '../../types';
// 1. Importamos BillCounter y su tipo BillCounts
import BillCounter, { type BillCounts } from './BillCounter';
import '../ventas/AddSaleForm.css';
import './CerrarCajaForm.css';

type SelectOption = { value: string; label: string };

interface AbrirCajaFormProps {
  onClose: () => void;
  // 2. La firma de onConfirm ahora incluye el desglose, pero MANTIENE el PIN
  onConfirm: (montoInicial: number, empleado: Empleado, pin: string, desglose: BillCounts) => void;
  montoCierreAnterior: number | null;
  empleados: Empleado[];
}

const AbrirCajaForm: React.FC<AbrirCajaFormProps> = ({ onClose, onConfirm, montoCierreAnterior, empleados }) => {
  const [monto, setMonto] = useState<number>(0);
  // 3. Nuevo estado para el desglose de billetes
  const [desglose, setDesglose] = useState<BillCounts>({});
  
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);
  const [pin, setPin] = useState<string>('');
  const [pinHash, setPinHash] = useState<string | null>(null);
  const [showPinInput, setShowPinInput] = useState(false);
  const [error, setError] = useState('');
  const [loadingEmpleado, setLoadingEmpleado] = useState(false);

  const opcionesEmpleado = empleados.map(e => ({ value: e.id, label: e.nombreCompleto }));

  useEffect(() => {
    const fetchPinHash = async () => {
      if (selectedEmpleado) {
        setLoadingEmpleado(true);
        setError('');
        const empleadoDocRef = doc(db, 'empleados', selectedEmpleado.id);
        try {
          const docSnap = await getDoc(empleadoDocRef);
          if (docSnap.exists() && docSnap.data().pinHash) {
            setPinHash(docSnap.data().pinHash);
            setShowPinInput(true);
          } else {
            setPinHash(null);
            setShowPinInput(false);
            setError('Este empleado no tiene un PIN configurado. Por favor, créelo desde el módulo de Configuración.');
          }
        } catch (err) {
            setError('No se pudo verificar el PIN. Revise las reglas de seguridad.');
        } finally {
            setLoadingEmpleado(false);
        }
      } else {
        setShowPinInput(false);
        setPinHash(null);
      }
    };
    setError('');
    setPin('');
    fetchPinHash();
  }, [selectedEmpleado]);

  const handleSelectEmpleado = (option: SingleValue<SelectOption>) => {
    const empleado = empleados.find(e => e.id === option?.value) || null;
    setSelectedEmpleado(empleado);
  };
  
  // 4. Nueva función para manejar el cambio del BillCounter
  const handleCounterChange = (data: { total: number; counts: BillCounts }) => {
    setMonto(data.total);
    setDesglose(data.counts);
  };

  const handleSubmit = () => {
    setError('');

    if (!selectedEmpleado) {
      setError('Por favor, seleccione un empleado.');
      return;
    }
    if (showPinInput && pin.length !== 4) {
      setError('El PIN debe tener 4 dígitos.');
      return;
    }
    if (showPinInput && pinHash) {
      const isPinValid = bcrypt.compareSync(pin, pinHash);
      if (!isPinValid) {
        setError('PIN incorrecto. Intente de nuevo.');
        return;
      }
    } else if (showPinInput && !pinHash) {
        return;
    }
    
    // 5. Pasamos todos los datos requeridos al confirmar
    onConfirm(monto, selectedEmpleado, pin, desglose);
  };

  const diferencia = useMemo(() => {
    if (montoCierreAnterior === null) return null;
    return monto - montoCierreAnterior;
  }, [monto, montoCierreAnterior]);

  const getDiferenciaClass = (val: number | null) => {
    if (val === null) return '';
    if (val === 0) return 'arqueo-ok';
    return val > 0 ? 'arqueo-sobrante' : 'arqueo-faltante';
  };
  
  const formatMoneda = (val: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

  return (
    <form className="add-sale-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      {montoCierreAnterior !== null && (
        <div className="summary-grid">
          <div>Monto del último cierre:</div>
          <div>{formatMoneda(montoCierreAnterior)}</div>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="empleado">Encargado de Apertura</label>
        <Select 
            id="empleado"
            options={opcionesEmpleado}
            onChange={handleSelectEmpleado}
            placeholder="Seleccione su nombre..."
            isLoading={loadingEmpleado}
        />
      </div>

      {showPinInput && (
        <div className="form-group">
          <label htmlFor="pin">PIN de Seguridad (4 dígitos)</label>
          <input 
            type="password" 
            id="pin" 
            value={pin} 
            onChange={e => setPin(e.target.value)} 
            maxLength={4}
            inputMode="numeric"
            autoComplete="off"
            required
            autoFocus
          />
        </div>
      )}
      
      <div className="form-group">
        <label>Conteo de Dinero Inicial</label>
        {/* 6. Usamos el BillCounter con su nueva función */}
        <BillCounter onChange={handleCounterChange} />
      </div>

      {diferencia !== null && (
        <div className="summary-grid arqueo-section">
          <div className="summary-total">Diferencia de Apertura:</div>
          <div className={`summary-total ${getDiferenciaClass(diferencia)}`}>
            {formatMoneda(diferencia)}
          </div>
        </div>
      )}

      {error && <p className="error-message" style={{marginTop: '15px'}}>{error}</p>}

      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onClose}>
          Cancelar
        </button>
        <button type="submit" className="primary-button" disabled={!selectedEmpleado || loadingEmpleado || (showPinInput && pin.length !== 4)}>
          {loadingEmpleado ? 'Verificando...' : 'Confirmar Apertura'}
        </button>
      </div>
    </form>
  );
};

export default AbrirCajaForm;