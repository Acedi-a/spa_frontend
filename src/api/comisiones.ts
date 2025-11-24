import api from './axios';
import type { ComisionResponse, ComisionData } from '../types/comision';

/**
 * Calcular comisiones de una empleada en un rango de fechas
 * Endpoint: GET /api/Comisiones/calcular?empleadaId=X&fechaInicio=YYYY-MM-DDTHH:mm:ss&fechaFin=YYYY-MM-DDTHH:mm:ss
 * 
 * @param empleadaId ID de la empleada
 * @param fechaInicio Fecha de inicio en formato ISO (YYYY-MM-DDTHH:mm:ss)
 * @param fechaFin Fecha de fin en formato ISO (YYYY-MM-DDTHH:mm:ss)
 * @returns Objeto con detalles de comisiones incluyendo comisionTotal
 */
export const calcularComisiones = async (
  empleadaId: number,
  fechaInicio: string,
  fechaFin: string
): Promise<ComisionData> => {
  const response = await api.get<ComisionResponse>('Comisiones/calcular', {
    params: {
      empleadaId,
      fechaInicio,
      fechaFin,
    },
  });
  return response.data.data;
};
