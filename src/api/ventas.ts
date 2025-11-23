import api from './axios';
import type { Venta, CreateVentaDto } from '../types/venta';

// GET - Obtener todas las ventas
export const getVentas = async (): Promise<Venta[]> => {
  const response = await api.get<Venta[]>('Ventas');
  return response.data;
};

// GET - Obtener historial de venta por QR
export const getVentaByQR = async (qrCode: string): Promise<Venta> => {
  const response = await api.get<Venta>(`Ventas/historial/${qrCode}`);
  return response.data;
};

// GET - Obtener ventas por cliente
export const getVentasByCliente = async (clienteId: string): Promise<Venta[]> => {
  const response = await api.get<Venta[]>(`Ventas/cliente/${clienteId}`);
  return response.data;
};

// POST - Crear una nueva venta
export const createVenta = async (venta: CreateVentaDto): Promise<Venta> => {
  const response = await api.post<Venta>('Ventas', venta);
  return response.data;
};
