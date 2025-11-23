import api from './axios';
import type { Categoria, CreateCategoriaDto, UpdateCategoriaDto } from '../types/categoria';

// GET - Obtener todas las categorías
export const getCategorias = async (): Promise<Categoria[]> => {
  const response = await api.get<Categoria[]>('Categorias');
  return response.data;
};

// GET - Obtener una categoría por ID
export const getCategoriaById = async (id: number): Promise<Categoria> => {
  const response = await api.get<Categoria>(`Categorias/${id}`);
  return response.data;
};

// POST - Crear una nueva categoría
export const createCategoria = async (categoria: CreateCategoriaDto): Promise<Categoria> => {
  const response = await api.post<Categoria>('Categorias', categoria);
  return response.data;
};

// PUT - Actualizar una categoría existente
export const updateCategoria = async (categoria: UpdateCategoriaDto): Promise<Categoria> => {
  const response = await api.put<Categoria>(`Categorias/${categoria.id}`, categoria);
  return response.data;
};

// DELETE - Eliminar una categoría
export const deleteCategoria = async (id: number): Promise<void> => {
  await api.delete(`Categorias/${id}`);
};
