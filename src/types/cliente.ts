export interface Cliente {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  fechaNacimiento: string; // ISO 8601 date format (YYYY-MM-DD)
  preferencias: string | null;
  fechaRegistro: string; // ISO 8601 date-time format
}

export interface CreateClienteDto {
  nombre: string;
  telefono?: string | null;
  email?: string | null;
  fechaNacimiento: string;
  preferencias?: string | null;
}

export interface UpdateClienteDto {
  id: string;
  nombre: string;
  telefono?: string | null;
  email?: string | null;
  fechaNacimiento: string;
  preferencias?: string | null;
}
