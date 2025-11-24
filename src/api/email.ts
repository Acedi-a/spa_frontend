import api from './axios';

export interface SendEmailDto {
  destinatario: string;
  asunto: string;
  mensaje: string;
  imagen?: string; // Base64 de la imagen
}

/**
 * Enviar email con adjunto
 * Endpoint: POST /api/Email/enviar
 * 
 * @param data Datos del email
 * @returns Confirmación de envío
 */
export const sendEmailWithAttachment = async (data: SendEmailDto): Promise<any> => {
  try {
    const response = await api.post<any>('Email/enviar', data);
    return response.data;
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw error;
  }
};

/**
 * Enviar tarjeta QR por email al cliente
 * @param clienteEmail Email del cliente
 * @param clienteNombre Nombre del cliente
 * @param imagenBase64 Imagen de la tarjeta en base64
 */
export const sendQRCardByEmail = async (
  clienteEmail: string,
  clienteNombre: string,
  imagenBase64: string
): Promise<any> => {
  const asunto = 'Tu Tarjeta de Cliente - SPA Premium';
  const mensaje = `¡Hola ${clienteNombre}!

Adjunto encontrarás tu tarjeta de cliente con código QR.
Esta tarjeta te permitirá acceder a nuestros servicios de forma rápida y segura.

Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.

Saludos cordiales,
Equipo SPA Premium`;

  return sendEmailWithAttachment({
    destinatario: clienteEmail,
    asunto,
    mensaje,
    imagen: imagenBase64,
  });
};
