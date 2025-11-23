import api from './axios';
import type { Empleada, CreateEmpleadaDto, UpdateEmpleadaDto } from '../types/empleada';

// GET - Obtener todas las empleadas
export const getEmpleadas = async (): Promise<Empleada[]> => {
  const response = await api.get<Empleada[]>('Empleadas');
  return response.data;
};

// GET - Obtener una empleada por ID
export const getEmpleadaById = async (id: number): Promise<Empleada> => {
  const response = await api.get<Empleada>(`Empleadas/${id}`);
  return response.data;
};

// POST - Crear una nueva empleada
export const createEmpleada = async (empleada: CreateEmpleadaDto): Promise<Empleada> => {
  const response = await api.post<Empleada>('Empleadas', empleada);
  return response.data;
};

// PUT - Actualizar una empleada existente
export const updateEmpleada = async (empleada: UpdateEmpleadaDto): Promise<Empleada> => {
  const response = await api.put<Empleada>(`Empleadas/${empleada.id}`, empleada);
  return response.data;
};

// DELETE - Eliminar una empleada
export const deleteEmpleada = async (id: number): Promise<void> => {
  await api.delete(`Empleadas/${id}`);
};
