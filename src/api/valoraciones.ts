import api from './axios';
import type { Valoracion, CreateValoracionDto, PromedioValoracion } from '../types/valoracion';

// GET - Obtener todas las valoraciones
export const getValoraciones = async (): Promise<Valoracion[]> => {
  const response = await api.get<Valoracion[]>('Valoraciones');
  return response.data;
};

// GET - Obtener promedio de valoración por empleada
export const getPromedioEmpleada = async (empleadaId: number): Promise<PromedioValoracion> => {
  const response = await api.get<PromedioValoracion>(`Valoraciones/promedio/empleada/${empleadaId}`);
  return response.data;
};

// POST - Crear una nueva valoración
export const createValoracion = async (valoracion: CreateValoracionDto): Promise<Valoracion> => {
  const response = await api.post<Valoracion>('Valoraciones', valoracion);
  return response.data;
};
