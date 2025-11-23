import api from './axios';
import type { ReporteVentas, FiltrosReporte } from '../types/reporte';

// GET - Obtener reporte de ventas
export const getReporteVentas = async (filtros?: FiltrosReporte): Promise<ReporteVentas> => {
  const params = new URLSearchParams();
  
  if (filtros?.fechaInicio) {
    params.append('fechaInicio', filtros.fechaInicio);
  }
  if (filtros?.fechaFin) {
    params.append('fechaFin', filtros.fechaFin);
  }
  if (filtros?.clienteId) {
    params.append('clienteId', filtros.clienteId);
  }

  const queryString = params.toString();
  const url = queryString ? `Reportes/ventas?${queryString}` : 'Reportes/ventas';
  
  const response = await api.get<ReporteVentas>(url);
  return response.data;
};
