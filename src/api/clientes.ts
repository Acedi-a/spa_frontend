import api from './axios';
import type { Cliente, CreateClienteDto, UpdateClienteDto } from '../types/cliente';

// GET - Obtener todos los clientes
export const getClientes = async (): Promise<Cliente[]> => {
  const response = await api.get<Cliente[]>('Clientes');
  return response.data;
};

// GET - Obtener un cliente por ID
export const getClienteById = async (id: string): Promise<Cliente> => {
  const response = await api.get<Cliente>(`Clientes/${id}`);
  return response.data;
};

// POST - Crear un nuevo cliente
export const createCliente = async (cliente: CreateClienteDto): Promise<Cliente> => {
  const response = await api.post<Cliente>('Clientes', cliente);
  return response.data;
};

// PUT - Actualizar un cliente existente
export const updateCliente = async (cliente: UpdateClienteDto): Promise<Cliente> => {
  const response = await api.put<Cliente>(`Clientes/${cliente.id}`, cliente);
  return response.data;
};

// DELETE - Eliminar un cliente
export const deleteCliente = async (id: string): Promise<void> => {
  await api.delete(`Clientes/${id}`);
};
