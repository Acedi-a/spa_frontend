import api from './axios';
import type { Cita, CreateCitaDto } from '../types/cita';

// GET - Obtener todas las citas
export const getCitas = async (): Promise<Cita[]> => {
  const response = await api.get<Cita[]>('Citas');
  return response.data;
};

// GET - Obtener una cita por ID
export const getCitaById = async (id: number): Promise<Cita> => {
  const response = await api.get<Cita>(`Citas/${id}`);
  return response.data;
};

// GET - Obtener citas por empleada
export const getCitasByEmpleada = async (empleadaId: number): Promise<Cita[]> => {
  const response = await api.get<Cita[]>(`Citas/empleada/${empleadaId}`);
  return response.data;
};

// POST - Crear una nueva cita
export const createCita = async (cita: CreateCitaDto): Promise<Cita> => {
  const response = await api.post<Cita>('Citas', cita);
  return response.data;
};
