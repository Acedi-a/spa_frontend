export interface Servicio {
  id: number;
  nombre: string;
  precio: number;
  duracion: number; // en minutos
  empleadaId: number;
  categoriaId: number;
  empleada?: {
    id: number;
    nombre: string;
  };
  categoria?: {
    id: number;
    nombre: string;
  };
}

export interface CreateServicioDto {
  nombre: string;
  precio: number;
  duracion: number;
  empleadaId: number;
  categoriaId: number;
}

export interface UpdateServicioDto {
  id: number;
  nombre: string;
  precio: number;
  duracion: number;
  empleadaId: number;
  categoriaId: number;
}
