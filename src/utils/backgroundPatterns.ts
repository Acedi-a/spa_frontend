import type { BackgroundPattern } from '../types/cardDesign';

export const getBackgroundPatternStyle = (
  pattern: BackgroundPattern,
  primaryColor: string,
  secondaryColor: string
): React.CSSProperties => {
  const opacity = '15';
  const primary = primaryColor + opacity;
  const secondary = secondaryColor + opacity;

  switch (pattern) {
    case 'dots':
      return {
        backgroundImage: `radial-gradient(circle, ${primary} 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
      };
    
    case 'grid':
      return {
        backgroundImage: `
          linear-gradient(${primary} 1px, transparent 1px),
          linear-gradient(90deg, ${primary} 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
      };
    
    case 'waves':
      return {
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='${primaryColor.replace('#', '%23')}' fill-opacity='0.15' fill-rule='evenodd'/%3E%3C/svg%3E")`,
      };
    
    case 'circles':
      return {
        backgroundImage: `radial-gradient(circle, ${primary} 2px, transparent 2px), radial-gradient(circle, ${secondary} 2px, transparent 2px)`,
        backgroundSize: '40px 40px',
        backgroundPosition: '0 0, 20px 20px',
      };
    
    case 'diagonal':
      return {
        backgroundImage: `repeating-linear-gradient(45deg, ${primary}, ${primary} 10px, transparent 10px, transparent 20px)`,
      };
    
    case 'hexagon':
      return {
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='28' height='49' viewBox='0 0 28 49' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='${primaryColor.replace('#', '%23')}' fill-opacity='0.15' fill-rule='evenodd'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/svg%3E")`,
      };
    
    case 'none':
    default:
      return {};
  }
};

export const patternOptions = [
  { value: 'none', label: 'Sin patrón' },
  { value: 'dots', label: 'Puntos' },
  { value: 'grid', label: 'Cuadrícula' },
  { value: 'waves', label: 'Ondas' },
  { value: 'circles', label: 'Círculos' },
  { value: 'diagonal', label: 'Diagonal' },
  { value: 'hexagon', label: 'Hexágonos' },
];
