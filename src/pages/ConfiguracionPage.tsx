import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, orderBy, query, getDoc, writeBatch, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { toast } from 'react-toastify';
import bcrypt from 'bcryptjs';
import type { Premio, TipoDePrenda, Empleado, CategoriaPrenda } from '../types';
import PremiosTable from '../modules/fidelizacion/PremiosTable';
import PremioFormModal from '../modules/fidelizacion/PremioFormModal';
import PrendasTable from '../modules/configuracion/PrendasTable';
import PrendaFormModal from '../modules/configuracion/PrendaFormModal';
import EmpleadosTable from '../modules/configuracion/EmpleadosTable';
import EmpleadoFormModal from '../modules/configuracion/EmpleadoFormModal';
import PinFormModal from '../modules/configuracion/PinFormModal';
import PriceModifierModal from '../modules/configuracion/PriceModifierModal';
import Modal from '../components/Modal';
import { FaPlus, FaKey } from 'react-icons/fa';
import Spinner from '../components/Spinner';
import './VentasPage.css';
import './ConfiguracionPage.css';

const ConfiguracionPage = () => {
  const [premios, setPremios] = useState<Premio[]>([]);
  const [tiposDePrenda, setTiposDePrenda] = useState<TipoDePrenda[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [categoriasPrenda, setCategoriasPrenda] = useState<CategoriaPrenda[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isPremioModalOpen, setIsPremioModalOpen] = useState(false);
  const [editingPremio, setEditingPremio] = useState<Premio | null>(null);
  const [isPrendaModalOpen, setIsPrendaModalOpen] = useState(false);
  const [editingPrenda, setEditingPrenda] = useState<TipoDePrenda | null>(null);
  const [isEmpleadoModalOpen, setIsEmpleadoModalOpen] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [empleadoParaPin, setEmpleadoParaPin] = useState<Empleado | null>(null);
  const [isPriceModifierModalOpen, setIsPriceModifierModalOpen] = useState(false);
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false); // Nuevo estado para el PIN de admin

  const [puntosOtorgados, setPuntosOtorgados] = useState<string>('');
  const [montoRequerido, setMontoRequerido] = useState<string>('');
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    const fetchConfigData = async () => {
      try {
        const [premiosSnapshot, prendasSnapshot, empleadosSnapshot, categoriasSnapshot, configSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'premios'), orderBy('puntosRequeridos'))),
          getDocs(query(collection(db, 'tiposDePrenda'), orderBy('nombre'))),
          getDocs(query(collection(db, 'empleados'), orderBy('nombreCompleto'))),
          getDocs(query(collection(db, 'categoriasPrenda'), orderBy('nombre'))),
          getDoc(doc(db, 'configuracion', 'puntos'))
        ]);
        
        setPremios(premiosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Premio)));
        setTiposDePrenda(prendasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TipoDePrenda)));
        setEmpleados(empleadosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Empleado)));
        setCategoriasPrenda(categoriasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CategoriaPrenda)));

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

  // --- NUEVA LÓGICA PARA EL PIN DE ADMINISTRADOR ---
  const handleSaveAdminPin = async (pin: string) => {
    try {
      const salt = bcrypt.genSaltSync(10);
      const pinHash = bcrypt.hashSync(pin, salt);

      const securityDocRef = doc(db, 'configuracion', 'seguridad');
      await setDoc(securityDocRef, { adminPinHash: pinHash }, { merge: true });

      toast.success("PIN de Administrador actualizado con éxito.");
      setIsAdminPinModalOpen(false);
    } catch (error) {
      console.error("Error al guardar el PIN de admin:", error);
      toast.error("No se pudo actualizar el PIN.");
    }
  };

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

  const handleCreateCategoria = async (nombreCategoria: string): Promise<CategoriaPrenda> => {
    try {
      const docRef = await addDoc(collection(db, 'categoriasPrenda'), { nombre: nombreCategoria });
      const nuevaCategoria = { id: docRef.id, nombre: nombreCategoria };
      setCategoriasPrenda(prev => [...prev, nuevaCategoria].sort((a,b) => a.nombre.localeCompare(b.nombre)));
      toast.info(`Nueva categoría "${nombreCategoria}" creada.`);
      return nuevaCategoria;
    } catch (error) {
      toast.error("No se pudo crear la nueva categoría.");
      return { id: 'error-' + Date.now(), nombre: nombreCategoria };
    }
  };

  const handleApplyPriceChange = async (alcance: 'todo' | 'categoria' | 'manual', porcentaje: number, targetId?: string, targetList?: string[]) => {
    const prendasAfectadas = tiposDePrenda.filter(prenda => {
        if (alcance === 'todo') return true;
        if (alcance === 'categoria') return prenda.categoriaId === targetId;
        if (alcance === 'manual') return targetList?.includes(prenda.id);
        return false;
    });

    if (prendasAfectadas.length === 0) {
        toast.warn("No hay prendas que coincidan con los criterios para modificar.");
        return;
    }

    if (!window.confirm(`Esto modificará el precio de ${prendasAfectadas.length} prenda(s). ¿Estás seguro de que quieres aplicar un ajuste del ${porcentaje}%?`)) {
        return;
    }

    try {
        const batch = writeBatch(db);
        const prendasActualizadas: TipoDePrenda[] = [];

        tiposDePrenda.forEach(prenda => {
            if (prendasAfectadas.some(p => p.id === prenda.id)) {
                const nuevoPrecio = Math.round(prenda.precio * (1 + (porcentaje / 100)));
                const prendaRef = doc(db, 'tiposDePrenda', prenda.id);
                batch.update(prendaRef, { precio: nuevoPrecio });
                prendasActualizadas.push({ ...prenda, precio: nuevoPrecio });
            } else {
                prendasActualizadas.push(prenda);
            }
        });

        await batch.commit();
        setTiposDePrenda(prendasActualizadas.sort((a,b) => a.nombre.localeCompare(b.nombre)));
        toast.success(`${prendasAfectadas.length} precios actualizados con éxito.`);
        setIsPriceModifierModalOpen(false);
    } catch (error) {
        console.error("Error al actualizar precios:", error);
        toast.error("Hubo un problema al actualizar los precios.");
    }
  };

  if (loading) { return <Spinner />; }

  return (
    <div className="page-container">
      <header className="page-header"><h1>Configuración General</h1></header>
      
      <section className="config-section">
        <h2>Seguridad</h2>
        <div className="config-item">
          <span>PIN de Administrador</span>
          <button className="secondary-button" onClick={() => setIsAdminPinModalOpen(true)}>
            <FaKey /> Cambiar PIN
          </button>
        </div>
      </section>

      <section className="config-section">
        <header className="page-header">
          <h2>Precios de Prendas</h2>
          <div className="header-actions" style={{ flexDirection: 'row', gap: '10px' }}>
            <button className="secondary-button" onClick={() => setIsPriceModifierModalOpen(true)}>
              Modificador de Precios
            </button>
            <button className="primary-button" onClick={() => handleOpenPrendaModal()}>
              <FaPlus /> Añadir Prenda
            </button>
          </div>
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
        <PrendaFormModal 
          onClose={handleClosePrendaModal} 
          onSave={handleSavePrenda} 
          prendaInicial={editingPrenda}
          categorias={categoriasPrenda}
          onCreateCategoria={handleCreateCategoria}
        />
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
      <Modal isOpen={isPriceModifierModalOpen} onClose={() => setIsPriceModifierModalOpen(false)} title="Modificador Masivo de Precios">
        <PriceModifierModal
          onClose={() => setIsPriceModifierModalOpen(false)}
          onConfirm={handleApplyPriceChange}
          prendas={tiposDePrenda}
          categorias={categoriasPrenda}
        />
      </Modal>
      <Modal isOpen={isAdminPinModalOpen} onClose={() => setIsAdminPinModalOpen(false)} title="Configurar PIN de Administrador">
        <PinFormModal 
          onClose={() => setIsAdminPinModalOpen(false)}
          onSave={handleSaveAdminPin}
        />
      </Modal>
    </div>
  );
};

export default ConfiguracionPage;