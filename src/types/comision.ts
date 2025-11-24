export interface DetalleServicio {
  ventaId: number;
  fechaVenta: string;
  nombreServicio: string;
  precioServicio: number;
  cantidad: number;
  subtotalServicio: number;
  comisionServicio: number;
}

export interface ComisionData {
  empleadaId: number;
  nombreEmpleada: string;
  porcentajeComision: number;
  fechaInicio: string;
  fechaFin: string;
  totalVentas: number;
  cantidadVentas: number;
  comisionTotal: number;
  detalleServicios: DetalleServicio[];
}

export interface ComisionResponse {
  mensaje: string;
  data: ComisionData;
}
