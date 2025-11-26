import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, orderBy, query, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { toast } from 'react-toastify';
import bcrypt from 'bcryptjs';
import type { Premio, TipoDePrenda, Empleado } from '../types';
import PremiosTable from '../modules/fidelizacion/PremiosTable';
import PremioFormModal from '../modules/fidelizacion/PremioFormModal';
import PrendasTable from '../modules/configuracion/PrendasTable';
import PrendaFormModal from '../modules/configuracion/PrendaFormModal';
import EmpleadosTable from '../modules/configuracion/EmpleadosTable';
import EmpleadoFormModal from '../modules/configuracion/EmpleadoFormModal';
import PinFormModal from '../modules/configuracion/PinFormModal';
import Modal from '../components/Modal';
import { FaPlus } from 'react-icons/fa';
import './VentasPage.css';
import './ConfiguracionPage.css';

const ConfiguracionPage = () => {
  const [premios, setPremios] = useState<Premio[]>([]);
  const [tiposDePrenda, setTiposDePrenda] = useState<TipoDePrenda[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isPremioModalOpen, setIsPremioModalOpen] = useState(false);
  const [editingPremio, setEditingPremio] = useState<Premio | null>(null);
  const [isPrendaModalOpen, setIsPrendaModalOpen] = useState(false);
  const [editingPrenda, setEditingPrenda] = useState<TipoDePrenda | null>(null);
  const [isEmpleadoModalOpen, setIsEmpleadoModalOpen] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [empleadoParaPin, setEmpleadoParaPin] = useState<Empleado | null>(null);

  const [puntosOtorgados, setPuntosOtorgados] = useState<string>('');
  const [montoRequerido, setMontoRequerido] = useState<string>('');
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    const fetchConfigData = async () => {
      try {
        const [premiosSnapshot, prendasSnapshot, empleadosSnapshot, configSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'premios'), orderBy('puntosRequeridos'))),
          getDocs(query(collection(db, 'tiposDePrenda'), orderBy('nombre'))),
          getDocs(query(collection(db, 'empleados'), orderBy('nombreCompleto'))),
          getDoc(doc(db, 'configuracion', 'puntos'))
        ]);
        
        setPremios(premiosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Premio)));
        setTiposDePrenda(prendasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TipoDePrenda)));
        setEmpleados(empleadosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Empleado)));

        if (configSnapshot.exists()) {
          const data = configSnapshot.data();
          setPuntosOtorgados(data.puntosOtorgados.toString());
          setMontoRequerido(data.montoRequerido.toString());
        }
      } catch (error) {
        console.error("Error al cargar datos de configuración:", error);
        toast.error("Error al cargar los datos de configuración.");
      } finally {
        setLoading(false);
        setLoadingConfig(false);
      }
    };
    fetchConfigData();
  }, []);

  const handleOpenPrendaModal = (prenda: TipoDePrenda | null = null) => {
    setEditingPrenda(prenda);
    setIsPrendaModalOpen(true);
  };
  const handleClosePrendaModal = () => {
    setIsPrendaModalOpen(false);
    setEditingPrenda(null);
  };
  const handleSavePrenda = async (prendaData: Omit<TipoDePrenda, 'id'>, id?: string) => {
    try {
      if (id) {
        await updateDoc(doc(db, 'tiposDePrenda', id), prendaData);
        setTiposDePrenda(tiposDePrenda.map(p => p.id === id ? { id, ...prendaData } : p).sort((a, b) => a.nombre.localeCompare(b.nombre)));
        toast.success("Prenda actualizada.");
      } else {
        const docRef = await addDoc(collection(db, 'tiposDePrenda'), prendaData);
        const nuevaPrenda = { ...prendaData, id: docRef.id };
        setTiposDePrenda([...tiposDePrenda, nuevaPrenda].sort((a,b) => a.nombre.localeCompare(b.nombre)));
        toast.success("Prenda creada.");
      }
      handleClosePrendaModal();
    } catch (error) { 
      console.error("Error al guardar prenda:", error);
      toast.error("Error al guardar la prenda.");
    }
  };
  const handleDeletePrenda = async (prenda: TipoDePrenda) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la prenda "${prenda.nombre}"?`)) {
      try {
        await deleteDoc(doc(db, 'tiposDePrenda', prenda.id));
        setTiposDePrenda(tiposDePrenda.filter(p => p.id !== prenda.id));
        toast.success("Prenda eliminada con éxito.");
      } catch (error) {
        console.error("Error al eliminar la prenda:", error);
        toast.error("No se pudo eliminar la prenda.");
      }
    }
  };

  const handleOpenEmpleadoModal = (empleado: Empleado | null = null) => {
    setEditingEmpleado(empleado);
    setIsEmpleadoModalOpen(true);
  };
  const handleCloseEmpleadoModal = () => {
    setIsEmpleadoModalOpen(false);
    setEditingEmpleado(null);
  };
  const handleSaveEmpleado = async (nombreCompleto: string, id?: string) => {
    try {
      if (id) {
        await updateDoc(doc(db, 'empleados', id), { nombreCompleto });
        setEmpleados(empleados.map(e => e.id === id ? { ...e, nombreCompleto } : e).sort((a,b) => a.nombreCompleto.localeCompare(b.nombreCompleto)));
        toast.success("Empleado actualizado.");
      } else {
        const docRef = await addDoc(collection(db, 'empleados'), { nombreCompleto });
        const nuevoEmpleado = { id: docRef.id, nombreCompleto };
        setEmpleados([...empleados, nuevoEmpleado].sort((a,b) => a.nombreCompleto.localeCompare(b.nombreCompleto)));
        toast.success("Empleado añadido.");
      }
      handleCloseEmpleadoModal();
    } catch (error) { toast.error("Error al guardar el empleado."); }
  };
  const handleDeleteEmpleado = async (empleado: Empleado) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${empleado.nombreCompleto}?`)) {
      try {
        await deleteDoc(doc(db, 'empleados', empleado.id));
        setEmpleados(empleados.filter(e => e.id !== empleado.id));
        toast.success("Empleado eliminado.");
      } catch (error) {
        toast.error("Error al eliminar el empleado.");
      }
    }
  };
  
  const handleOpenPinModal = (empleado: Empleado) => {
    setEmpleadoParaPin(empleado);
    setIsPinModalOpen(true);
  };
  const handleClosePinModal = () => {
    setIsPinModalOpen(false);
    setEmpleadoParaPin(null);
  };
  const handleSavePin = async (pin: string) => {
    if (!empleadoParaPin) return;
    try {
      const salt = bcrypt.genSaltSync(10);
      const pinHash = bcrypt.hashSync(pin, salt);
      const empleadoDocRef = doc(db, 'empleados', empleadoParaPin.id);
      await updateDoc(empleadoDocRef, { pinHash: pinHash });
      setEmpleados(empleados.map(e => e.id === empleadoParaPin.id ? { ...e, pinHash } : e));
      toast.success(`PIN para ${empleadoParaPin.nombreCompleto} configurado con éxito.`);
      handleClosePinModal();
    } catch (error) {
      console.error("Error al guardar el PIN:", error);
      toast.error("No se pudo guardar el PIN.");
    }
  };

  const handleOpenPremioModal = (premio: Premio | null = null) => {
    setEditingPremio(premio);
    setIsPremioModalOpen(true);
  };
  const handleClosePremioModal = () => {
    setIsPremioModalOpen(false);
    setEditingPremio(null);
  };
  const handleSavePremio = async (premioData: Omit<Premio, 'id' | 'activo'>, id?: string) => {
    try {
      if (id) {
        await updateDoc(doc(db, 'premios', id), premioData);
        setPremios(premios.map(p => p.id === id ? { ...p, ...premioData } : p).sort((a,b) => a.puntosRequeridos - b.puntosRequeridos));
        toast.success("Premio actualizado.");
      } else {
        const docRef = await addDoc(collection(db, 'premios'), { ...premioData, activo: true });
        const nuevoPremio = { ...premioData, id: docRef.id, activo: true };
        setPremios([...premios, nuevoPremio].sort((a,b) => a.puntosRequeridos - b.puntosRequeridos));
        toast.success("Premio creado.");
      }
      handleClosePremioModal();
    } catch (error) { toast.error("Error al guardar el premio."); }
  };
  const handleToggleActive = async (premio: Premio) => {
    const premioDocRef = doc(db, 'premios', premio.id);
    try {
      await updateDoc(premioDocRef, { activo: !premio.activo });
      setPremios(premios.map(p => p.id === premio.id ? { ...p, activo: !p.activo } : p));
      toast.info(`El premio "${premio.nombre}" ha sido ${!premio.activo ? 'activado' : 'desactivado'}.`);
    } catch (error) { toast.error("No se pudo cambiar el estado del premio."); }
  };

  const handleSaveConfig = async () => {
    const puntosNum = parseInt(puntosOtorgados, 10);
    const montoNum = parseFloat(montoRequerido);
    if (isNaN(puntosNum) || puntosNum <= 0 || isNaN(montoNum) || montoNum <= 0) {
      toast.error("Por favor, ingrese valores válidos en ambos campos.");
      return;
    }
    setLoadingConfig(true);
    try {
      await updateDoc(doc(db, 'configuracion', 'puntos'), { 
        puntosOtorgados: puntosNum,
        montoRequerido: montoNum,
      });
      toast.success("Regla de puntos actualizada.");
    } catch (error) {
      toast.error("No se pudo actualizar la regla de puntos.");
    } finally {
      setLoadingConfig(false);
    }
  };

  if (loading) { return <div className="page-container">Cargando...</div>; }

  return (
    <div className="page-container">
      <header className="page-header"><h1>Configuración General</h1></header>
      
      <section className="config-section">
        <header className="page-header">
          <h2>Precios de Prendas</h2>
          <button className="primary-button" onClick={() => handleOpenPrendaModal()}>
            <FaPlus /> Añadir Nueva Prenda
          </button>
        </header>
        <PrendasTable 
          prendas={tiposDePrenda} 
          onEdit={handleOpenPrendaModal}
          onDelete={handleDeletePrenda}
        />
      </section>
      
      <section className="config-section">
        <header className="page-header">
          <h2>Gestión de Empleados</h2>
          <button className="primary-button" onClick={() => handleOpenEmpleadoModal()}>
            <FaPlus /> Añadir Empleado
          </button>
        </header>
        <EmpleadosTable 
          empleados={empleados}
          onEdit={handleOpenEmpleadoModal}
          onDelete={handleDeleteEmpleado}
          onSetPin={handleOpenPinModal}
        />
      </section>

      <section className="config-section">
        <h2>Fidelización</h2>
        <div className="config-form">
          <span>Se otorgan</span>
          <input type="number" value={puntosOtorgados} onChange={e => setPuntosOtorgados(e.target.value)} disabled={loadingConfig} />
          <span>puntos por cada $</span>
          <input type="number" value={montoRequerido} onChange={e => setMontoRequerido(e.target.value)} disabled={loadingConfig} />
          <span>gastados.</span>
          <button className="primary-button small-button" onClick={handleSaveConfig} disabled={loadingConfig}>
            {loadingConfig ? 'Guardando...' : 'Guardar Regla'}
          </button>
        </div>
      </section>

      <section className="config-section">
        <header className="page-header">
          <h3>Gestión de Premios</h3>
          <button className="primary-button" onClick={() => handleOpenPremioModal()}>
            <FaPlus /> Añadir Nuevo Premio
          </button>
        </header>
        <PremiosTable premios={premios} onEdit={handleOpenPremioModal} onToggleActive={handleToggleActive} />
      </section>

      <Modal isOpen={isPrendaModalOpen} onClose={handleClosePrendaModal} title={editingPrenda ? 'Editar Prenda' : 'Nueva Prenda'}>
        <PrendaFormModal onClose={handleClosePrendaModal} onSave={handleSavePrenda} prendaInicial={editingPrenda} />
      </Modal>
      <Modal isOpen={isEmpleadoModalOpen} onClose={handleCloseEmpleadoModal} title={editingEmpleado ? 'Editar Empleado' : 'Nuevo Empleado'}>
        <EmpleadoFormModal onClose={handleCloseEmpleadoModal} onSave={handleSaveEmpleado} empleadoInicial={editingEmpleado} />
      </Modal>
      {empleadoParaPin && (
        <Modal isOpen={isPinModalOpen} onClose={handleClosePinModal} title={`Configurar PIN para ${empleadoParaPin.nombreCompleto}`}>
          <PinFormModal 
            onClose={handleClosePinModal}
            onSave={handleSavePin}
          />
        </Modal>
      )}
      <Modal isOpen={isPremioModalOpen} onClose={handleClosePremioModal} title={editingPremio ? 'Editar Premio' : 'Nuevo Premio'}>
        <PremioFormModal onClose={handleClosePremioModal} onSave={handleSavePremio} premioInicial={editingPremio} />
      </Modal>
    </div>
  );
};

export default ConfiguracionPage;