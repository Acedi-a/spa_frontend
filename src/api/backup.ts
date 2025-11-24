import axios from './axios';

/**
 * Descargar un backup de la base de datos
 * @returns Blob con el contenido del archivo .sql
 */
export const descargarBackup = async (): Promise<Blob> => {
  const response = await axios.post('/Backup/descargar', {}, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Restaurar un backup de la base de datos
 * @param archivo Archivo .sql a restaurar
 * @returns Respuesta del servidor
 */
export const restaurarBackup = async (archivo: File): Promise<{ mensaje: string }> => {
  const formData = new FormData();
  formData.append('archivoBackup', archivo);

  const response = await axios.post('/Backup/restaurar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
