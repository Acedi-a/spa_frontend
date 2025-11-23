export interface Valoracion {
  id: number;
  clienteId: string;
  empleadaId: number;
  servicioId: number;
  ventaId: number;
  calificacion: number; // 1-5
  comentario: string | null;
  fecha?: string;
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
  promedio: number;
  totalValoraciones: number;
}
