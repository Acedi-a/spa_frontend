export interface ReporteVentas {
  tipoReporte: string;
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
  clienteFiltro?: {
    id: string;
    nombre: string;
  } | null;
  totalIngresos: number;
  totalTransacciones: number;
  promedioVenta: number;
  ventaMayor: number;
  ventaMenor: number;
  detalles: {
    id: number;
    clienteId: string;
    nombreCliente: string;
    fecha: string;
    total: number;
    metodoPago: string;
    estado: string | null;
    cantidadItems: number;
  }[];
  ventasPorMetodoPago: Record<string, number>;
  ingresosPorMetodoPago: Record<string, number>;
  ventasPorDia: Record<string, {
    fecha: string;
    cantidadVentas: number;
    totalIngresos: number;
  }>;
}

export interface FiltrosReporte {
  fechaInicio?: string;
  fechaFin?: string;
  clienteId?: string;
}
