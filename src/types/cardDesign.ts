export type BackgroundPattern = 'none' | 'dots' | 'grid' | 'waves' | 'circles' | 'diagonal' | 'hexagon';

export interface CardDesign {
  // Colores
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  
  // Diseño
  cardWidth: number;
  cardHeight: number;
  borderRadius: number;
  backgroundPattern: BackgroundPattern;
  
  // QR
  qrSize: number;
  qrPosition: 'left' | 'right' | 'center' | 'top' | 'bottom';
  qrBackgroundColor: string;
  qrForegroundColor: string;
  
  // Texto
  showName: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showId: boolean;
  fontSize: number;
  fontFamily: string;
  
  // Logo/Marca
  showLogo: boolean;
  logoText: string;
  logoFontSize: number;
}

export const defaultCardDesign: CardDesign = {
  backgroundColor: '#ffffff',
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  textColor: '#1f2937',
  
  cardWidth: 400,
  cardHeight: 250,
  borderRadius: 16,
  backgroundPattern: 'none',
  
  qrSize: 120,
  qrPosition: 'right',
  qrBackgroundColor: '#ffffff',
  qrForegroundColor: '#000000',
  
  showName: true,
  showEmail: true,
  showPhone: true,
  showId: false,
  fontSize: 14,
  fontFamily: 'Inter, sans-serif',
  
  showLogo: true,
  logoText: 'SPA Premium',
  logoFontSize: 24,
};
