import React, { useRef, useState } from 'react';
import { Modal, Button, Space, message, Spin } from 'antd';
import { Download, Mail, Copy, Printer, X } from 'lucide-react';
import type { CardDesign } from '../types/cardDesign';
import { defaultCardDesign } from '../types/cardDesign';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import type { Cliente } from '../types/cliente';
import { getBackgroundPatternStyle } from '../utils/backgroundPatterns';

interface QRCardModalProps {
  open: boolean;
  onClose: () => void;
  cliente: Cliente;
}

const STORAGE_KEY = 'spa_card_design';

export const QRCardModal: React.FC<QRCardModalProps> = ({ open, onClose, cliente }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [design, setDesign] = useState<CardDesign>(defaultCardDesign);

  // Cargar diseño guardado
  React.useEffect(() => {
    const savedDesign = localStorage.getItem(STORAGE_KEY);
    if (savedDesign) {
      try {
        setDesign(JSON.parse(savedDesign));
      } catch (error) {
        console.error('Error loading design:', error);
      }
    }
  }, []);

  const getQRPosition = () => {
    switch (design.qrPosition) {
      case 'left':
        return { justifyContent: 'flex-start', flexDirection: 'row' as const };
      case 'right':
        return { justifyContent: 'space-between', flexDirection: 'row' as const };
      case 'center':
        return { justifyContent: 'center', flexDirection: 'column' as const, alignItems: 'center' };
      case 'top':
        return { justifyContent: 'flex-start', flexDirection: 'column' as const, alignItems: 'center' };
      case 'bottom':
        return { justifyContent: 'flex-end', flexDirection: 'column' as const, alignItems: 'center' };
      default:
        return { justifyContent: 'space-between', flexDirection: 'row' as const };
    }
  };

  const exportAsImage = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;

    setLoading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 3, // Alta resolución
        logging: false,
      });

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      });
    } catch (error) {
      console.error('Error exporting image:', error);
      message.error('Error al exportar la imagen');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    const blob = await exportAsImage();
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tarjeta-${cliente.nombre.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success('Tarjeta descargada correctamente');
    }
  };

  const handleCopyToClipboard = async () => {
    const blob = await exportAsImage();
    if (blob) {
      try {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        message.success('Tarjeta copiada al portapapeles');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        message.error('Error al copiar al portapapeles');
      }
    }
  };

  const handlePrint = async () => {
    const blob = await exportAsImage();
    if (blob) {
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          URL.revokeObjectURL(url);
        };
      }
    }
  };

  const handleSendEmail = async () => {
    const blob = await exportAsImage();
    if (blob) {
      // Convertir blob a base64 para email
      const reader = new FileReader();
      reader.onloadend = () => {
        // const base64data = reader.result as string;
        const subject = encodeURIComponent('Tu Tarjeta de Cliente - SPA Premium');
        const body = encodeURIComponent(
          `Hola ${cliente.nombre},\n\nAdjunto encontrarás tu tarjeta de cliente con código QR.\n\nSaludos,\nEquipo SPA Premium`
        );
        // Abrir cliente de email (nota: el attachment no funcionará así, pero abre el email)
        window.location.href = `mailto:${cliente.email}?subject=${subject}&body=${body}`;
        message.info('Se ha abierto tu cliente de email');
      };
      reader.readAsDataURL(blob);
    }
  };

  const positionStyle = getQRPosition();
  const patternStyle = getBackgroundPatternStyle(design.backgroundPattern, design.primaryColor, design.secondaryColor);

  return (
    <Modal
      title="Tarjeta QR del Cliente"
      open={open}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      <Spin spinning={loading} tip="Procesando...">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: '40px 20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          marginBottom: '24px',
        }}>
          <div
            ref={cardRef}
            style={{
              width: `${design.cardWidth}px`,
              height: `${design.cardHeight}px`,
              backgroundColor: design.backgroundColor,
              borderRadius: `${design.borderRadius}px`,
              padding: '24px',
              display: 'flex',
              ...positionStyle,
              ...patternStyle,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Gradiente decorativo */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '200px',
                height: '200px',
                background: `linear-gradient(135deg, ${design.primaryColor}20, ${design.secondaryColor}20)`,
                borderRadius: '50%',
                filter: 'blur(40px)',
                zIndex: 0,
              }}
            />

            {/* Contenido */}
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              zIndex: 1,
              gap: '8px',
            }}>
              {design.showLogo && (
                <div style={{ marginBottom: '12px' }}>
                  <svg 
                    width="100%" 
                    height={design.logoFontSize + 10}
                    style={{ overflow: 'visible' }}
                  >
                    <defs>
                      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={design.primaryColor} />
                        <stop offset="100%" stopColor={design.secondaryColor} />
                      </linearGradient>
                    </defs>
                    <text
                      x="0"
                      y={design.logoFontSize}
                      fill="url(#logoGradient)"
                      fontSize={design.logoFontSize}
                      fontWeight="bold"
                      fontFamily={design.fontFamily}
                    >
                      {design.logoText}
                    </text>
                  </svg>
                </div>
              )}
              
              {design.showName && (
                <div style={{ 
                  fontSize: `${design.fontSize + 4}px`, 
                  fontWeight: '600',
                  color: design.textColor,
                  fontFamily: design.fontFamily,
                }}>
                  {cliente.nombre}
                </div>
              )}
              
              {design.showEmail && cliente.email && (
                <div style={{ 
                  fontSize: `${design.fontSize}px`,
                  color: design.textColor,
                  opacity: 0.8,
                  fontFamily: design.fontFamily,
                }}>
                  {cliente.email}
                </div>
              )}
              
              {design.showPhone && cliente.telefono && (
                <div style={{ 
                  fontSize: `${design.fontSize}px`,
                  color: design.textColor,
                  opacity: 0.8,
                  fontFamily: design.fontFamily,
                }}>
                  {cliente.telefono}
                </div>
              )}
              
              {design.showId && (
                <div style={{ 
                  fontSize: `${design.fontSize - 2}px`,
                  color: design.textColor,
                  opacity: 0.6,
                  fontFamily: 'monospace',
                  marginTop: '8px',
                  wordBreak: 'break-all',
                }}>
                  ID: {cliente.id.substring(0, 18)}...
                </div>
              )}
            </div>

            {/* Código QR */}
            <div style={{ 
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
              backgroundColor: design.qrBackgroundColor,
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}>
              <QRCodeSVG
                value={cliente.id}
                size={design.qrSize}
                bgColor={design.qrBackgroundColor}
                fgColor={design.qrForegroundColor}
                level="H"
                includeMargin={false}
              />
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <Space style={{ width: '100%', justifyContent: 'center' }} size="middle">
          <Button
            type="primary"
            icon={<Download size={16} />}
            onClick={handleDownload}
            size="large"
          >
            Descargar
          </Button>
          <Button
            icon={<Copy size={16} />}
            onClick={handleCopyToClipboard}
            size="large"
          >
            Copiar
          </Button>
          <Button
            icon={<Printer size={16} />}
            onClick={handlePrint}
            size="large"
          >
            Imprimir
          </Button>
          <Button
            icon={<Mail size={16} />}
            onClick={handleSendEmail}
            size="large"
          >
            Enviar Email
          </Button>
          <Button
            icon={<X size={16} />}
            onClick={onClose}
            size="large"
          >
            Cerrar
          </Button>
        </Space>
      </Spin>
    </Modal>
  );
};
