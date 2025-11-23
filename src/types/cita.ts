export interface Cita {
  id: number;
  clienteId: string;
  empleadaId: number;
  servicioId: number;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm:ss
  estado?: string;
  // Relaciones pobladas (opcionales)
  cliente?: {
    id: string;
    nombre: string;
  };
  empleada?: {
    id: number;
    nombre: string;
  };
  servicio?: {
    id: number;
    nombre: string;
    duracion: number;
  };
}

export interface CreateCitaDto {
  clienteId: string;
  empleadaId: number;
  servicioId: number;
  fecha: string;
  hora: string;
}
