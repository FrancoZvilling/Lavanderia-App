import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, orderBy, query, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { toast } from 'react-toastify';
import type { Premio, TipoDePrenda, Empleado } from '../types';
import PremiosTable from '../modules/fidelizacion/PremiosTable';
import PremioFormModal from '../modules/fidelizacion/PremioFormModal';
import PrendasTable from '../modules/configuracion/PrendasTable';
import PrendaFormModal from '../modules/configuracion/PrendaFormModal';
import EmpleadosTable from '../modules/configuracion/EmpleadosTable';
import EmpleadoFormModal from '../modules/configuracion/EmpleadoFormModal';
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
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null); // Estado para el empleado a editar

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

  // --- LÓGICA COMPLETA PARA GESTIONAR EMPLEADOS ---
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
      if (id) { // Editando un empleado existente
        await updateDoc(doc(db, 'empleados', id), { nombreCompleto });
        setEmpleados(empleados.map(e => e.id === id ? { ...e, nombreCompleto } : e).sort((a,b) => a.nombreCompleto.localeCompare(b.nombreCompleto)));
        toast.success("Empleado actualizado con éxito.");
      } else { // Creando un nuevo empleado
        const docRef = await addDoc(collection(db, 'empleados'), { nombreCompleto });
        const nuevoEmpleado = { id: docRef.id, nombreCompleto };
        setEmpleados([...empleados, nuevoEmpleado].sort((a,b) => a.nombreCompleto.localeCompare(b.nombreCompleto)));
        toast.success("Empleado añadido con éxito.");
      }
      handleCloseEmpleadoModal();
    } catch (error) { toast.error("Error al guardar el empleado."); }
  };
  const handleDeleteEmpleado = async (empleado: Empleado) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${empleado.nombreCompleto}? Esta acción no se puede deshacer.`)) {
      try {
        await deleteDoc(doc(db, 'empleados', empleado.id));
        setEmpleados(empleados.filter(e => e.id !== empleado.id));
        toast.success("Empleado eliminado con éxito.");
      } catch (error) {
        toast.error("Error al eliminar el empleado.");
      }
    }
  };
  
  // --- Lógica para prendas ---
  const handleOpenPrendaModal = (prenda: TipoDePrenda | null = null) => { setEditingPrenda(prenda); setIsPrendaModalOpen(true); };
  const handleClosePrendaModal = () => { setIsPrendaModalOpen(false); setEditingPrenda(null); };
  const handleSavePrenda = async (prendaData: Omit<TipoDePrenda, 'id'>, id?: string) => {
    try {
      if (id) {
        const prendaDocRef = doc(db, 'tiposDePrenda', id);
        await updateDoc(prendaDocRef, prendaData);
        setTiposDePrenda(tiposDePrenda.map(p => p.id === id ? { id, ...prendaData } : p).sort((a, b) => a.nombre.localeCompare(b.nombre)));
        toast.success("Prenda actualizada con éxito.");
      } else {
        const docRef = await addDoc(collection(db, 'tiposDePrenda'), prendaData);
        const nuevaPrenda = { ...prendaData, id: docRef.id };
        setTiposDePrenda([...tiposDePrenda, nuevaPrenda].sort((a,b) => a.nombre.localeCompare(b.nombre)));
        toast.success("Prenda creada con éxito.");
      }
      handleClosePrendaModal();
    } catch (error) { 
      console.error("Error al guardar prenda:", error);
      toast.error("Error al guardar la prenda."); 
    }
  };
  
  // --- Lógica para premios ---
  const handleOpenModal = (premio: Premio | null = null) => { setEditingPremio(premio); setIsPremioModalOpen(true); };
  const handleCloseModal = () => { setIsPremioModalOpen(false); setEditingPremio(null); };
  const handleSavePremio = async (premioData: Omit<Premio, 'id' | 'activo'>, id?: string) => {
    try {
      if (id) {
        const premioDocRef = doc(db, 'premios', id);
        await updateDoc(premioDocRef, premioData);
        setPremios(premios.map(p => p.id === id ? { ...p, ...premioData } : p).sort((a,b) => a.puntosRequeridos - b.puntosRequeridos));
        toast.success("Premio actualizado con éxito.");
      } else {
        const docRef = await addDoc(collection(db, 'premios'), { ...premioData, activo: true });
        const nuevoPremio = { ...premioData, id: docRef.id, activo: true };
        setPremios([...premios, nuevoPremio].sort((a,b) => a.puntosRequeridos - b.puntosRequeridos));
        toast.success("Premio creado con éxito.");
      }
      handleCloseModal();
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

  // --- Lógica para reglas de puntos ---
  const handleSaveConfig = async () => {
    const puntosNum = parseInt(puntosOtorgados, 10);
    const montoNum = parseFloat(montoRequerido);
    if (isNaN(puntosNum) || puntosNum <= 0 || isNaN(montoNum) || montoNum <= 0) {
      toast.error("Por favor, ingrese valores numéricos válidos en ambos campos.");
      return;
    }
    setLoadingConfig(true);
    try {
      const configDocRef = doc(db, 'configuracion', 'puntos');
      await updateDoc(configDocRef, { 
        puntosOtorgados: puntosNum,
        montoRequerido: montoNum,
      });
      toast.success("Regla de puntos actualizada con éxito.");
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
        <PrendasTable prendas={tiposDePrenda} onEdit={handleOpenPrendaModal} />
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
          <button className="primary-button" onClick={() => handleOpenModal()}>
            <FaPlus /> Añadir Nuevo Premio
          </button>
        </header>
        <PremiosTable premios={premios} onEdit={handleOpenModal} onToggleActive={handleToggleActive} />
      </section>

      <Modal isOpen={isPrendaModalOpen} onClose={handleClosePrendaModal} title={editingPrenda ? 'Editar Prenda' : 'Nueva Prenda'}>
        <PrendaFormModal onClose={handleClosePrendaModal} onSave={handleSavePrenda} prendaInicial={editingPrenda} />
      </Modal>
      <Modal isOpen={isEmpleadoModalOpen} onClose={handleCloseEmpleadoModal} title={editingEmpleado ? 'Editar Empleado' : 'Nuevo Empleado'}>
        <EmpleadoFormModal onClose={handleCloseEmpleadoModal} onSave={handleSaveEmpleado} empleadoInicial={editingEmpleado} />
      </Modal>
      <Modal isOpen={isPremioModalOpen} onClose={handleCloseModal} title={editingPremio ? 'Editar Premio' : 'Nuevo Premio'}>
        <PremioFormModal onClose={handleCloseModal} onSave={handleSavePremio} premioInicial={editingPremio} />
      </Modal>
    </div>
  );
};

export default ConfiguracionPage;