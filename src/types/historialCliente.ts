export interface DetalleVenta {
  id: number;
  tipoItem: string;
  productoId: number | null;
  nombreProducto: string | null;
  servicioId: number | null;
  nombreServicio: string | null;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface VentaHistorial {
  id: number;
  fecha: string;
  total: number;
  metodoPago: string;
  estado: string | null;
  cantidadItems: number;
  detalles: DetalleVenta[];
}

export interface HistorialCliente {
  clienteId: string;
  nombre: string;
  telefono: string;
  email: string;
  fechaNacimiento: string;
  fechaRegistro: string;
  preferencias: string;
  activo: boolean;
  totalVentas: number;
  totalGastado: number;
  promedioGasto: number;
  ultimaCompra: string;
  ventas: VentaHistorial[];
}
