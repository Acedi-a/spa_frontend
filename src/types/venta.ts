export interface DetalleVenta {
  id?: number;
  productoId?: number | null;
  servicioId?: number | null;
  cantidad: number;
  precioUnitario: number;
  subtotal?: number;
  producto?: {
    id: number;
    nombre: string;
  };
  servicio?: {
    id: number;
    nombre: string;
  };
}

export interface Venta {
  id: number;
  clienteId: string;
  fecha: string;
  metodoPago: string;
  total: number;
  qrCode?: string;
  cliente?: {
    id: string;
    nombre: string;
  };
  detalleVentas?: DetalleVenta[];
}

export interface CreateVentaDto {
  clienteId: string;
  fecha: string;
  metodoPago: string;
  total: number;
  detalleVentas: {
    productoId?: number | null;
    servicioId?: number | null;
    cantidad: number;
    precioUnitario: number;
  }[];
}
