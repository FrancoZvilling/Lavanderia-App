import type { Timestamp } from 'firebase/firestore';

export type EstadoLavado = 'En preparación' | 'Listo' | 'Entregado';

// --- CORRECCIÓN 1: Añadimos 'Cuenta Corriente' a los métodos de pago ---
export type MetodoDePago = 'Efectivo' | 'Transferencia' | 'Débito' | 'Crédito' | 'Cuenta Corriente';

export interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  documento?: string;
  contacto?: string;
  telefono?: string;
  observaciones?: string;
  descuentoFijo?: number;
  puntos: number;
  estadoLavado: EstadoLavado;
}
export interface CategoriaPrenda {
  id: string;
  nombre: string;
}

export interface TipoDePrenda {
  id: string;
  nombre: string;
  precio: number;
  categoriaId: string;
  categoriaNombre: string;
}

export interface Venta {
  id: string;
  fecha: Timestamp;
  cajaId: string;
  clienteId: string | null;
  // --- CORRECCIÓN 2: Añadimos el número de ticket (opcional) ---
  nroTicket?: string; 
  montoTotal: number;
  metodoDePago: MetodoDePago;
  devuelta?: boolean;
  items: {
    nombrePrenda: string;
    cantidad: number;
  }[];
  observaciones?: string;
}

export interface Empleado {
  id: string;
  nombreCompleto: string;
  pinHash?: string;
}

export interface MotivoRetiro {
  id: string;
  nombre: string;
}

export interface MotivoIngreso {
  id: string;
  nombre: string;
}

// NUEVA INTERFAZ para los tipos de beneficiario (ej: Proveedores)
export interface TipoBeneficiario {
  id: string;
  nombre: string;
}

// NUEVA INTERFAZ para los items dentro de un tipo (ej: Proveedor de Jabón)
export interface ItemBeneficiario {
  id: string;
  nombre: string;
}

export interface Retiro {
  id: string;
  monto: number;
  metodo: 'Efectivo' | 'Transferencia';
  motivo: string;
  categoriaBeneficiario: string;
  nombreBeneficiario: string; 
  fecha: Timestamp;
  cajaId: string;
}

export interface Ingreso {
  id: string;
  monto: number;
  metodo: 'Efectivo' | 'Transferencia';
  motivo: string;
  empleadoId: string;
  empleadoNombre: string;
  fecha: Timestamp;
  cajaId: string;
}

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
  totalIngresosManualesEfectivo?: number;     
  totalIngresosManualesTransferencia?: number;
  desgloseApertura?: { [key: string]: number };
  desgloseCierre?: { [key: string]: number };
  ventasDelDia: Venta[];
  retirosDelDia?: Retiro[];
  ingresosDelDia?: Ingreso[];
}

export interface Premio {
  id: string;
  nombre: string;
  puntosRequeridos: number;
  descripcion: string;
  activo: boolean;
}