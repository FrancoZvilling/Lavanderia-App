import type { Cliente, Venta, RegistroCaja, Premio, TipoDePrenda } from '../types';

// --- Clientes de Ejemplo ---
export const mockClientes: Cliente[] = [
  { id: 1, nombre: 'Juan', apellido: 'Pérez', contacto: '1122334455', puntos: 1250, estadoLavado: 'Listo' },
  { id: 2, nombre: 'Ana', apellido: 'García', contacto: 'ana.garcia@email.com', puntos: 450, estadoLavado: 'En preparación' },
  { id: 3, nombre: 'Carlos', apellido: 'López', contacto: '5544332211', puntos: 2100, estadoLavado: 'Entregado' },
];

// --- Tipos de Prenda de Ejemplo ---
export const mockTiposDePrenda: TipoDePrenda[] = [
    { id: 1, nombre: 'Camisa' },
    { id: 2, nombre: 'Pantalón' },
    { id: 3, nombre: 'Acolchado' },
    { id: 4, nombre: 'Saco' },
    { id: 5, nombre: 'Vestido' },
];


// --- Ventas de Ejemplo ---
export const mockVentas: Venta[] = [
  {
    id: 101,
    fecha: new Date('2025-11-07T10:30:00'),
    clienteId: 1,
    montoTotal: 3500,
    metodoDePago: 'Efectivo',
    items: [{ tipoPrendaId: 1, cantidad: 1, precio: 1500 }, { tipoPrendaId: 2, cantidad: 1, precio: 2000 }],
    observaciones: 'Pantalón con mancha de café.',
  },
  {
    id: 102,
    fecha: new Date('2025-11-08T15:00:00'),
    clienteId: 2,
    montoTotal: 5000,
    metodoDePago: 'Transferencia',
    items: [{ tipoPrendaId: 3, cantidad: 1, precio: 5000 }],
  },
];

// --- Registros de Caja de Ejemplo ---
export const mockCajas: RegistroCaja[] = [
    {
        id: 1,
        fechaApertura: new Date('2025-11-08T09:00:00'),
        montoInicial: 10000,
        fechaCierre: new Date('2025-11-08T18:00:00'),
        montoFinal: 18500,
        ventasDelDia: mockVentas,
    }
];

// --- Tabla de Premios ---
export const mockPremios: Premio[] = [
  { id: 1, nombre: '30% Descuento', puntosRequeridos: 500, descripcion: '¡Felicitaciones! Has ganado un 30% de descuento en tu próxima compra.' },
  { id: 2, nombre: '50% Descuento', puntosRequeridos: 1000, descripcion: '¡Felicitaciones! Has ganado un 50% de descuento en tu próxima compra.' },
  { id: 3, nombre: 'Lavado Gratis', puntosRequeridos: 2000, descripcion: '¡Felicitaciones! Has ganado un lavado gratis (hasta 5 prendas).' },
];