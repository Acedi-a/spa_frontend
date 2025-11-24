import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Input, InputNumber, Select, Switch, Button, Space, Divider, message, ColorPicker } from 'antd';
import { Save, RotateCcw } from 'lucide-react';
import type { CardDesign } from '../types/cardDesign';
import { defaultCardDesign } from '../types/cardDesign';
import { QRCodeSVG } from 'qrcode.react';
import type { Color } from 'antd/es/color-picker';
import { getBackgroundPatternStyle } from '../utils/backgroundPatterns';

const STORAGE_KEY = 'spa_card_design';

export const CardDesignerPage: React.FC = () => {
  const [design, setDesign] = useState<CardDesign>(defaultCardDesign);
  const [form] = Form.useForm();

  // Cargar diseño guardado al montar
  useEffect(() => {
    const savedDesign = localStorage.getItem(STORAGE_KEY);
    if (savedDesign) {
      try {
        const parsed = JSON.parse(savedDesign);
        setDesign(parsed);
        form.setFieldsValue(parsed);
      } catch (error) {
        console.error('Error loading saved design:', error);
      }
    }
  }, [form]);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(design));
    message.success('Diseño guardado correctamente');
  };

  const handleReset = () => {
    setDesign(defaultCardDesign);
    form.setFieldsValue(defaultCardDesign);
    localStorage.removeItem(STORAGE_KEY);
    message.info('Diseño restablecido a valores por defecto');
  };

  const handleColorChange = (field: keyof CardDesign, color: Color) => {
    const hexColor = color.toHexString();
    setDesign(prev => ({ ...prev, [field]: hexColor }));
    form.setFieldValue(field, hexColor);
  };

  // Preview de la tarjeta
  const CardPreview = () => {
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

    const positionStyle = getQRPosition();
    const patternStyle = getBackgroundPatternStyle(design.backgroundPattern, design.primaryColor, design.secondaryColor);

    return (
      <div
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
              <div
                style={{
                  fontSize: `${design.logoFontSize}px`,
                  fontWeight: 'bold',
                  background: `linear-gradient(135deg, ${design.primaryColor}, ${design.secondaryColor})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: design.fontFamily,
                }}
              >
                {design.logoText}
              </div>
            </div>
          )}
          
          {design.showName && (
            <div style={{ 
              fontSize: `${design.fontSize + 4}px`, 
              fontWeight: '600',
              color: design.textColor,
              fontFamily: design.fontFamily,
            }}>
              María González
            </div>
          )}
          
          {design.showEmail && (
            <div style={{ 
              fontSize: `${design.fontSize}px`,
              color: design.textColor,
              opacity: 0.8,
              fontFamily: design.fontFamily,
            }}>
              maria@example.com
            </div>
          )}
          
          {design.showPhone && (
            <div style={{ 
              fontSize: `${design.fontSize}px`,
              color: design.textColor,
              opacity: 0.8,
              fontFamily: design.fontFamily,
            }}>
              +591 77123456
            </div>
          )}
          
          {design.showId && (
            <div style={{ 
              fontSize: `${design.fontSize - 2}px`,
              color: design.textColor,
              opacity: 0.6,
              fontFamily: 'monospace',
              marginTop: '8px',
            }}>
              ID: 040dcaeb-c632-4f99
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
            value="040dcaeb-c632-4f99-8e73-f2e0606ea699"
            size={design.qrSize}
            bgColor={design.qrBackgroundColor}
            fgColor={design.qrForegroundColor}
            level="H"
            includeMargin={false}
          />
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Diseñador de Tarjetas QR</h1>
        <p style={{ color: '#6b7280', marginTop: '8px' }}>
          Personaliza el diseño de las tarjetas de identificación para tus clientes
        </p>
      </div>

      <Row gutter={24}>
        {/* Panel de controles - scrollable */}
        <Col xs={24} lg={10}>
          <Card 
            title="Configuración" 
            style={{ 
              marginBottom: '24px',
              maxHeight: 'calc(100vh - 200px)',
              overflow: 'auto'
            }}
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={design}
              onValuesChange={(_, allValues) => {
                setDesign(allValues);
              }}
            >
              <Divider>Colores</Divider>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Fondo de tarjeta" name="backgroundColor">
                    <ColorPicker
                      value={design.backgroundColor}
                      onChange={(color) => handleColorChange('backgroundColor', color)}
                      showText
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Color de texto" name="textColor">
                    <ColorPicker
                      value={design.textColor}
                      onChange={(color) => handleColorChange('textColor', color)}
                      showText
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Color primario" name="primaryColor">
                    <ColorPicker
                      value={design.primaryColor}
                      onChange={(color) => handleColorChange('primaryColor', color)}
                      showText
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Color secundario" name="secondaryColor">
                    <ColorPicker
                      value={design.secondaryColor}
                      onChange={(color) => handleColorChange('secondaryColor', color)}
                      showText
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider>Dimensiones</Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Ancho" name="cardWidth">
                    <InputNumber
                      min={300}
                      max={600}
                      style={{ width: '100%' }}
                      addonAfter="px"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Alto" name="cardHeight">
                    <InputNumber
                      min={200}
                      max={400}
                      style={{ width: '100%' }}
                      addonAfter="px"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Radio del borde" name="borderRadius">
                <InputNumber
                  min={0}
                  max={32}
                  style={{ width: '100%' }}
                  addonAfter="px"
                />
              </Form.Item>

              <Form.Item label="Patrón de fondo" name="backgroundPattern">
                <Select>
                  <Select.Option value="none">Sin patrón</Select.Option>
                  <Select.Option value="dots">Puntos</Select.Option>
                  <Select.Option value="grid">Cuadrícula</Select.Option>
                  <Select.Option value="waves">Ondas</Select.Option>
                  <Select.Option value="circles">Círculos</Select.Option>
                  <Select.Option value="diagonal">Diagonal</Select.Option>
                  <Select.Option value="hexagon">Hexágonos</Select.Option>
                </Select>
              </Form.Item>

              <Divider>Código QR</Divider>

              <Form.Item label="Tamaño del QR" name="qrSize">
                <InputNumber
                  min={80}
                  max={200}
                  style={{ width: '100%' }}
                  addonAfter="px"
                />
              </Form.Item>

              <Form.Item label="Posición del QR" name="qrPosition">
                <Select>
                  <Select.Option value="left">Izquierda</Select.Option>
                  <Select.Option value="right">Derecha</Select.Option>
                  <Select.Option value="center">Centro</Select.Option>
                  <Select.Option value="top">Arriba</Select.Option>
                  <Select.Option value="bottom">Abajo</Select.Option>
                </Select>
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Fondo QR" name="qrBackgroundColor">
                    <ColorPicker
                      value={design.qrBackgroundColor}
                      onChange={(color) => handleColorChange('qrBackgroundColor', color)}
                      showText
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Color QR" name="qrForegroundColor">
                    <ColorPicker
                      value={design.qrForegroundColor}
                      onChange={(color) => handleColorChange('qrForegroundColor', color)}
                      showText
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider>Contenido</Divider>

              <Form.Item label="Mostrar logo" name="showLogo" valuePropName="checked">
                <Switch />
              </Form.Item>

              {design.showLogo && (
                <>
                  <Form.Item label="Texto del logo" name="logoText">
                    <Input placeholder="SPA Premium" />
                  </Form.Item>
                  <Form.Item label="Tamaño del logo" name="logoFontSize">
                    <InputNumber
                      min={16}
                      max={40}
                      style={{ width: '100%' }}
                      addonAfter="px"
                    />
                  </Form.Item>
                </>
              )}

              <Form.Item label="Mostrar nombre" name="showName" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item label="Mostrar email" name="showEmail" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item label="Mostrar teléfono" name="showPhone" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item label="Mostrar ID" name="showId" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item label="Tamaño de texto" name="fontSize">
                <InputNumber
                  min={10}
                  max={20}
                  style={{ width: '100%' }}
                  addonAfter="px"
                />
              </Form.Item>

              <Form.Item label="Fuente" name="fontFamily">
                <Select>
                  <Select.Option value="Inter, sans-serif">Inter</Select.Option>
                  <Select.Option value="Arial, sans-serif">Arial</Select.Option>
                  <Select.Option value="Georgia, serif">Georgia</Select.Option>
                  <Select.Option value="'Courier New', monospace">Courier</Select.Option>
                  <Select.Option value="'Times New Roman', serif">Times New Roman</Select.Option>
                </Select>
              </Form.Item>

              <Space style={{ width: '100%', marginTop: '24px' }}>
                <Button
                  type="primary"
                  icon={<Save size={16} />}
                  onClick={handleSave}
                  size="large"
                >
                  Guardar Diseño
                </Button>
                <Button
                  icon={<RotateCcw size={16} />}
                  onClick={handleReset}
                  size="large"
                >
                  Restablecer
                </Button>
              </Space>
            </Form>
          </Card>
        </Col>

        {/* Panel de vista previa - sticky/fijo */}
        <Col xs={24} lg={14}>
          <div style={{ position: 'sticky', top: '100px' }}>
            <Card title="Vista Previa" style={{ marginBottom: '24px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                minHeight: '400px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                padding: '40px',
              }}>
                <CardPreview />
              </div>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};
