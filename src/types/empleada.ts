export interface Empleada {
  id: number;
  nombre: string;
  email: string;
  fechaContratacion: string;
  porcentajeComision: number;
  especialidad: string | null;
}

export interface CreateEmpleadaDto {
  nombre: string;
  email: string;
  fechaContratacion: string;
  porcentajeComision: number;
  especialidad?: string | null;
}

export interface UpdateEmpleadaDto {
  id: number;
  nombre: string;
  email: string;
  fechaContratacion: string;
  porcentajeComision: number;
  especialidad?: string | null;
}
