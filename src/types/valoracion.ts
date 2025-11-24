export interface Valoracion {
  id: number;
  clienteId: string;
  empleadaId: number;
  servicioId: number;
  ventaId: number;
  calificacion: number; // 1-5
  comentario: string | null;
  fecha: string;
  nombreCliente: string;
  nombreServicio: string;
  nombreEmpleada: string | null;
}

export interface CreateValoracionDto {
  clienteId: string;
  empleadaId: number;
  servicioId: number;
  ventaId: number;
  calificacion: number;
  comentario?: string | null;
}

export interface PromedioValoracion {
  empleadaId: number;
  promedioCalificacion: number;
  mensaje?: string;
}

export interface ReporteEmpleada {
  empleadaId: number;
  nombreEmpleada: string;
  especialidad: string;
  promedioCalificacion: number;
  totalValoraciones: number;
  distribucionCalificaciones: Record<string, number>;
  valoraciones: Valoracion[];
  fechaGeneracion: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  calificacionesAltasCount: number;
  calificacionesMediasCount: number;
  calificacionesBajasCount: number;
  observacionesGenerales: string;
}
