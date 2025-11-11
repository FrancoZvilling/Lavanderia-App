// Define los posibles estados de un lavado
export type EstadoLavado = 'En preparación' | 'Listo' | 'Entregado';

// Define los métodos de pago aceptados
export type MetodoDePago = 'Efectivo' | 'Transferencia' | 'Débito' | 'Crédito';

// Interfaz para un Cliente
export interface Cliente { // <-- ASEGÚRATE DE QUE TENGA 'export'
  id: number;
  nombre: string;
  apellido: string;
  contacto: string;
  puntos: number;
  estadoLavado: EstadoLavado;
}

// Interfaz para un Tipo de Prenda
export interface TipoDePrenda { // <-- ASEGÚRATE DE QUE TENGA 'export'
  id: number;
  nombre: string;
}

// Interfaz para una Venta
export interface Venta {
  id: number;
  fecha: Date;
  // CAMBIO CLAVE: clienteId ahora puede ser un número o nulo
  clienteId: number | null; 
  montoTotal: number;
  metodoDePago: MetodoDePago; // Asumiremos un método por defecto por ahora
  items: {
    // Para simplificar, solo guardaremos el nombre de la prenda y la cantidad
    nombrePrenda: string; 
    cantidad: number;
  }[];
  observaciones?: string;
}

// Interfaz para el módulo de Caja
export interface RegistroCaja { // <-- ASEGÚRATE DE QUE TENGA 'export'
  id: number;
  fechaApertura: Date;
  montoInicial: number;
  fechaCierre?: Date;
  montoFinal?: number;
  ventasDelDia: Venta[];
}

// Interfaz para los Premios del sistema de fidelización
export interface Premio { // <-- ASEGÚRATE DE QUE TENGA 'export'
  id: number;
  nombre: string;
  puntosRequeridos: number;
  descripcion: string;
}