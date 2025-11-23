import api from './axios';
import type { Servicio, CreateServicioDto, UpdateServicioDto } from '../types/servicio';

// GET - Obtener todos los servicios
export const getServicios = async (): Promise<Servicio[]> => {
  const response = await api.get<Servicio[]>('Servicios');
  return response.data;
};

// GET - Obtener un servicio por ID
export const getServicioById = async (id: number): Promise<Servicio> => {
  const response = await api.get<Servicio>(`Servicios/${id}`);
  return response.data;
};

// POST - Crear un nuevo servicio
export const createServicio = async (servicio: CreateServicioDto): Promise<Servicio> => {
  const response = await api.post<Servicio>('Servicios/crear', servicio);
  return response.data;
};

// PUT - Actualizar un servicio existente
export const updateServicio = async (servicio: UpdateServicioDto): Promise<Servicio> => {
  const response = await api.put<Servicio>(`Servicios/${servicio.id}`, servicio);
  return response.data;
};

// DELETE - Eliminar un servicio
export const deleteServicio = async (id: number): Promise<void> => {
  await api.delete(`Servicios/${id}`);
};
