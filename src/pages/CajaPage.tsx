import React, { useState } from 'react';
import CajaActual from '../modules/caja/CajaActual';
import HistorialCajaTable from '../modules/caja/HistorialCajaTable';
import AbrirCajaForm from '../modules/caja/AbrirCajaForm';
import CerrarCajaForm from '../modules/caja/CerrarCajaForm'; // 1. Importar el nuevo formulario
import Modal from '../components/Modal';
import { mockCajas, mockVentas } from '../data/mockData';
import type { RegistroCaja } from '../types';
import './VentasPage.css';

const CajaPage = () => {
  const [isAbrirModalOpen, setIsAbrirModalOpen] = useState(false);
  const [isCerrarModalOpen, setIsCerrarModalOpen] = useState(false); // 2. Nuevo estado para el modal de cierre
  const [cajaActual, setCajaActual] = useState<RegistroCaja | null>(null);
  
  // 3. Estado para el historial, iniciado con los datos de ejemplo
  const [historialCajas, setHistorialCajas] = useState<RegistroCaja[]>(mockCajas);

  const handleAbrirCaja = (montoInicial: number) => {
    const nuevaCaja: RegistroCaja = {
      id: Date.now(),
      fechaApertura: new Date(),
      montoInicial: montoInicial,
      ventasDelDia: mockVentas,
    };
    setCajaActual(nuevaCaja);
    setIsAbrirModalOpen(false);
  };

  // 4. Nueva función para manejar el cierre de caja
  const handleCerrarCaja = (montoFinal: number) => {
    if (!cajaActual) return; // Seguridad por si acaso

    const cajaCerrada: RegistroCaja = {
      ...cajaActual,
      fechaCierre: new Date(),
      montoFinal: montoFinal,
    };
    
    // Añadimos la caja cerrada al principio del historial
    setHistorialCajas([cajaCerrada, ...historialCajas]);
    
    // Reseteamos el estado de la caja actual a 'cerrada'
    setCajaActual(null);
    setIsCerrarModalOpen(false);
  };

  return (
    <div className="page-container">
      <CajaActual
        caja={cajaActual}
        onAbrirCaja={() => setIsAbrirModalOpen(true)}
        onCerrarCaja={() => setIsCerrarModalOpen(true)} // 5. Conectar el evento
      />

      <div className="history-section">
        <header className="page-header">
          <h1>Historial de Cajas</h1>
        </header>
        <HistorialCajaTable registros={historialCajas} /> {/* 6. Usamos el estado del historial */}
      </div>

      {/* Modal para Abrir Caja */}
      <Modal
        isOpen={isAbrirModalOpen}
        onClose={() => setIsAbrirModalOpen(false)}
        title="Abrir Caja"
      >
        <AbrirCajaForm
          onClose={() => setIsAbrirModalOpen(false)}
          onConfirm={handleAbrirCaja}
        />
      </Modal>

      {/* 7. Nuevo Modal para Cerrar Caja */}
      {cajaActual && (
        <Modal
          isOpen={isCerrarModalOpen}
          onClose={() => setIsCerrarModalOpen(false)}
          title="Cerrar Caja"
        >
          <CerrarCajaForm
            caja={cajaActual}
            onClose={() => setIsCerrarModalOpen(false)}
            onConfirm={handleCerrarCaja}
          />
        </Modal>
      )}
    </div>
  );
};

export default CajaPage;