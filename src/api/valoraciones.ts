import api from './axios';
import type { Valoracion, CreateValoracionDto, PromedioValoracion, ReporteEmpleada } from '../types/valoracion';

/**
 * Obtener todas las valoraciones del sistema
 */
export const getValoraciones = async (): Promise<Valoracion[]> => {
  const response = await api.get<any>('Valoraciones');
  return response.data.data || response.data;
};

/**
 * Obtener una valoración específica por ID
 */
export const getValoracionById = async (id: number): Promise<Valoracion> => {
  const response = await api.get<any>(`Valoraciones/${id}`);
  return response.data.data || response.data;
};

/**
 * Obtener todas las valoraciones de un cliente específico
 */
export const getValoracionesByCliente = async (clienteId: string): Promise<Valoracion[]> => {
  const response = await api.get<any>(`Valoraciones/cliente/${clienteId}`);
  return response.data.data || response.data;
};

/**
 * Obtener reporte completo de una empleada (valoraciones, promedio, distribución, etc.)
 * Endpoint: GET /api/Valoraciones/reporte/empleada/{empleadaId}
 * 
 * Retorna estructura completa con:
 * - empleadaId, nombreEmpleada, especialidad
 * - promedioCalificacion, totalValoraciones
 * - distribucionCalificaciones (conteo por estrellas)
 * - valoraciones[] (array de valoraciones detalladas)
 * - estadísticas generales
 */
export const getReporteEmpleada = async (empleadaId: number): Promise<ReporteEmpleada> => {
  try {
    const response = await api.get<any>(`Valoraciones/reporte/empleada/${empleadaId}`);
    const data = response.data.data || response.data;
    console.log('Reporte empleada:', data);
    return data;
  } catch (error) {
    console.error('Error al obtener reporte:', error);
    throw error;
  }
};

/**
 * Obtener todas las valoraciones de una empleada (DEPRECADO - usa getReporteEmpleada)
 * Endpoint: GET /api/Valoraciones/reporte/empleada/{empleadaId}
 */
export const getValoracionesByEmpleada = async (empleadaId: number): Promise<Valoracion[]> => {
  try {
    const reporte = await getReporteEmpleada(empleadaId);
    return reporte.valoraciones || [];
  } catch (error) {
    console.error('Error al obtener valoraciones:', error);
    return [];
  }
};

/**
 * Obtener valoraciones de una empleada filtradas por rango de fechas
 */
export const getValoracionesByEmpleadaFechas = async (
  empleadaId: number,
  fechaInicio: string,
  fechaFin: string
): Promise<Valoracion[]> => {
  const response = await api.get<any>(
    `Valoraciones/reporte/empleada/${empleadaId}/fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
  );
  const data = response.data.data || response.data;
  return data.valoraciones || [];
};

/**
 * Obtener el promedio de calificación de una empleada
 * Endpoint: GET /api/Valoraciones/promedio/empleada/{empleadaId}
 * 
 * Retorna: { empleadaId, promedioCalificacion, mensaje }
 */
export const getPromedioEmpleada = async (empleadaId: number): Promise<PromedioValoracion> => {
  try {
    const response = await api.get<any>(`Valoraciones/promedio/empleada/${empleadaId}`);
    const data = response.data.data || response.data;
    console.log('Promedio empleada:', data);
    return {
      empleadaId: data.empleadaId,
      promedioCalificacion: data.promedioCalificacion || 0,
      mensaje: data.mensaje,
    };
  } catch (error) {
    console.error('Error al obtener promedio:', error);
    return {
      empleadaId,
      promedioCalificacion: 0,
    };
  }
};

/**
 * Crear una nueva valoración
 * Endpoint: POST /api/Valoraciones
 */
export const createValoracion = async (valoracion: CreateValoracionDto): Promise<Valoracion> => {
  const response = await api.post<any>('Valoraciones', valoracion);
  return response.data.data || response.data;
};
