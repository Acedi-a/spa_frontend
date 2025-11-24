import api from './axios';
import { HistorialCliente } from '../types/historialCliente';

export const getHistorialByQR = async (qrCode: string): Promise<HistorialCliente> => {
  const response = await api.get<HistorialCliente>(`Ventas/historial/${qrCode}`);
  return response.data;
};
