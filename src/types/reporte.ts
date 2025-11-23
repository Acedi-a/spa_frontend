export interface ReporteVentas {
  totalVentas: number;
  montoTotal: number;
  ventasPorMetodoPago: {
    metodoPago: string;
    cantidad: number;
    monto: number;
  }[];
  ventasPorDia?: {
    fecha: string;
    cantidad: number;
    monto: number;
  }[];
  productosVendidos?: {
    productoId: number;
    nombre: string;
    cantidad: number;
    monto: number;
  }[];
  serviciosVendidos?: {
    servicioId: number;
    nombre: string;
    cantidad: number;
    monto: number;
  }[];
}

export interface FiltrosReporte {
  fechaInicio?: string;
  fechaFin?: string;
  clienteId?: string;
}
