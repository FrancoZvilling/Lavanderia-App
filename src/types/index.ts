import type { Timestamp } from 'firebase/firestore';

export type EstadoLavado = 'En preparación' | 'Listo' | 'Entregado';
export type MetodoDePago = 'Efectivo' | 'Transferencia' | 'Débito' | 'Crédito';

export interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  documento: string; // <-- AÑADIDO (o verificado que exista)
  contacto: string;   // Sigue siendo el email
  telefono: string; // <-- AÑADIDO (o verificado que exista)
  puntos: number;
  estadoLavado: EstadoLavado;
}

export interface TipoDePrenda {
  id: string; // CAMBIO CLAVE: de 'number' a 'string'
  nombre: string;
  precio: number;
}

export interface Venta {
  id: string; // CAMBIO CLAVE: de 'number' a 'string'
  fecha: Timestamp; // CAMBIO CLAVE: de 'Date' a 'Timestamp'
  cajaId: string;
  clienteId: string | null; // CAMBIO CLAVE: de 'number | null' a 'string | null'
  montoTotal: number;
  metodoDePago: MetodoDePago;
  items: {
    nombrePrenda: string;
    cantidad: number;
  }[];
  observaciones?: string;
}

export interface Empleado {
  id: string;
  nombreCompleto: string;
}
export interface MotivoRetiro {
  id: string;
  nombre: string;
}

export interface Retiro {
  id: string;
  monto: number;
  metodo: 'Efectivo' | 'Transferencia';
  motivo: string;
  empleadoId: string;
  empleadoNombre: string;
  fecha: Timestamp;
  cajaId: string;
}

// Interfaz para el módulo de Caja
export interface RegistroCaja {
  id: string;
  fechaApertura: Timestamp;
  montoInicial: number;
  diferenciaApertura?: number;
  empleadoId: string;
  empleadoNombre: string;
  fechaCierre?: Timestamp | null;
  montoFinal?: number | null;
  totalVentas?: number; 
  totalEfectivo?: number;
  totalTransferencia?: number;
  totalDebito?: number;       
  totalCredito?: number; 
  totalRetirosEfectivo?: number; 
  totalRetirosTransferencia?: number;
  ventasDelDia: Venta[]; // Lo seguimos usando para la caja activa
  retirosDelDia?: Retiro[];
}

// Interfaz para los Premios del sistema de fidelización
export interface Premio {
  id: string; // El ID del documento de Firestore
  nombre: string;
  puntosRequeridos: number;
  descripcion: string;
  activo: boolean; // Para activar o desactivar el premio
}