import { useState, useEffect, useMemo } from 'react';
import Select, { type SingleValue } from 'react-select';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import bcrypt from 'bcryptjs';
import type { Empleado } from '../../types';
import '../ventas/AddSaleForm.css';
import './CerrarCajaForm.css';

type SelectOption = { value: string; label: string };

interface AbrirCajaFormProps {
  onClose: () => void;
  onConfirm: (montoInicial: number, empleado: Empleado, pin: string) => void;
  montoCierreAnterior: number | null;
  empleados: Empleado[];
}

const AbrirCajaForm: React.FC<AbrirCajaFormProps> = ({ onClose, onConfirm, montoCierreAnterior, empleados }) => {
  const [monto, setMonto] = useState<string>('');
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);
  const [pin, setPin] = useState<string>('');
  const [pinHash, setPinHash] = useState<string | null>(null);
  const [showPinInput, setShowPinInput] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const opcionesEmpleado = empleados.map(e => ({ value: e.id, label: e.nombreCompleto }));

  // useEffect para buscar el pinHash cuando se selecciona un empleado
  useEffect(() => {
    const fetchPinHash = async () => {
      if (selectedEmpleado) {
        setLoading(true);
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
            setLoading(false);
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

  const handleSubmit = () => {
    setError('');
    setLoading(true);

    const montoNumerico = parseFloat(monto);
    if (isNaN(montoNumerico) || montoNumerico < 0) {
      setError('Por favor, ingrese un monto válido.');
      setLoading(false);
      return;
    }
    if (!selectedEmpleado) {
      setError('Por favor, seleccione un empleado.');
      setLoading(false);
      return;
    }
    if (showPinInput && pin.length !== 4) {
      setError('El PIN debe tener 4 dígitos.');
      setLoading(false);
      return;
    }
    if (showPinInput && pinHash) {
      const isPinValid = bcrypt.compareSync(pin, pinHash);
      if (!isPinValid) {
        setError('PIN incorrecto. Intente de nuevo.');
        setLoading(false);
        return;
      }
    } else {
        // Este error se mostrará si el empleado no tiene PIN configurado
        setError('No se pudo verificar el PIN. Contacte al administrador.');
        setLoading(false);
        return;
    }

    onConfirm(montoNumerico, selectedEmpleado, pin);
    setLoading(false);
  };

  const diferencia = useMemo(() => {
    if (montoCierreAnterior === null || monto === '') return null;
    return parseFloat(monto) - montoCierreAnterior;
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
            isLoading={loading}
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
        <label htmlFor="montoInicial">Monto Inicial en Caja</label>
        <input
          type="number"
          id="montoInicial"
          placeholder="Ingrese el dinero contado"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          required
        />
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
        <button type="submit" className="primary-button" disabled={!selectedEmpleado || loading}>
          {loading ? 'Verificando...' : 'Confirmar Apertura'}
        </button>
      </div>
    </form>
  );
};

export default AbrirCajaForm;