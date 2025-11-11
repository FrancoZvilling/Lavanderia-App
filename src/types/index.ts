import type { Timestamp } from 'firebase/firestore';

export type EstadoLavado = 'En preparación' | 'Listo' | 'Entregado';
export type MetodoDePago = 'Efectivo' | 'Transferencia' | 'Débito' | 'Crédito';

export interface Cliente {
  id: string; // Ya está como string, ¡perfecto!
  nombre: string;
  apellido: string;
  contacto: string;
  puntos: number;
  estadoLavado: EstadoLavado;
}

export interface TipoDePrenda {
  id: string; // CAMBIO CLAVE: de 'number' a 'string'
  nombre: string;
}

export interface Venta {
  id: string; // CAMBIO CLAVE: de 'number' a 'string'
  fecha: Timestamp; // CAMBIO CLAVE: de 'Date' a 'Timestamp'
  clienteId: string | null; // CAMBIO CLAVE: de 'number | null' a 'string | null'
  montoTotal: number;
  metodoDePago: MetodoDePago;
  items: {
    nombrePrenda: string;
    cantidad: number;
  }[];
  observaciones?: string;
}

// Interfaz para el módulo de Caja
export interface RegistroCaja {
  id: string;
  fechaApertura: Timestamp;
  montoInicial: number;
  // CAMBIO CLAVE: Permitimos que fechaCierre sea Timestamp, undefined, O null.
  fechaCierre?: Timestamp | null;
  montoFinal?: number | null; // Hacemos lo mismo para montoFinal por consistencia
  ventasDelDia: Venta[];
}

// Interfaz para los Premios del sistema de fidelización
export interface Premio { // <-- ASEGÚRATE DE QUE TENGA 'export'
  id: number;
  nombre: string;
  puntosRequeridos: number;
  descripcion: string;
}