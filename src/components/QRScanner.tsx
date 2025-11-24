import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Spin, Alert, Typography, Statistic, Card, Row, Col, Table, Tag, Descriptions, Select } from 'antd';
import { QrCode, ShoppingCart, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useMutation } from '@tanstack/react-query';
import { getHistorialByQR } from '../api/historial';
import type { HistorialCliente } from '../types/historialCliente';
import dayjs from 'dayjs';

const { Text } = Typography;

export const QRScanner: React.FC = () => {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [historialData, setHistorialData] = useState<HistorialCliente | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const historialMutation = useMutation({
    mutationFn: (qrCode: string) => getHistorialByQR(qrCode),
    onSuccess: (data) => {
      setHistorialData(data);
      stopScanning();
    },
    onError: (error: any) => {
      Modal.error({
        title: 'Error al cargar historial',
        content: error.response?.data?.message || 'No se encontró información para este código QR',
      });
      stopScanning();
      setScannerOpen(false);
    },
  });

  // Obtener lista de cámaras disponibles
  useEffect(() => {
    if (scannerOpen) {
      Html5Qrcode.getCameras()
        .then((devices) => {
          if (devices && devices.length > 0) {
            const cameraList = devices.map((device) => ({
              id: device.id,
              label: device.label || `Cámara ${device.id}`,
            }));
            setCameras(cameraList);
            setSelectedCamera(cameraList[0].id);
            setScannerError(null);
          } else {
            setScannerError('No se encontraron cámaras disponibles');
          }
        })
        .catch((err) => {
          console.error('Error al obtener cámaras:', err);
          setScannerError('Error al acceder a las cámaras. Verifique los permisos.');
        });
    }
  }, [scannerOpen]);

  // Iniciar escaneo cuando se selecciona una cámara
  useEffect(() => {
    if (scannerOpen && selectedCamera && !isScanning) {
      startScanning();
    }
    return () => {
      stopScanning();
    };
  }, [selectedCamera]);

  const startScanning = async () => {
    if (!selectedCamera || isScanning) return;

    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Validar que sea un UUID
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (uuidRegex.test(decodedText)) {
            historialMutation.mutate(decodedText);
          } else {
            Modal.warning({
              title: 'Código QR inválido',
              content: 'El código escaneado no es un código válido del sistema',
            });
          }
        },
        undefined
      );
      setIsScanning(true);
      setScannerError(null);
    } catch (err: any) {
      console.error('Error al iniciar scanner:', err);
      setScannerError(err.message || 'Error al iniciar la cámara');
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error('Error al detener scanner:', err);
      }
    }
  };

  const handleOpenScanner = () => {
    setScannerOpen(true);
    setHistorialData(null);
    setScannerError(null);
  };

  const handleCloseScanner = () => {
    stopScanning();
    setScannerOpen(false);
    setCameras([]);
    setSelectedCamera('');
  };

  const handleCloseHistorial = () => {
    setHistorialData(null);
    setScannerOpen(false);
  };

  const ventasColumns = [
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      render: (fecha: string) => dayjs(fecha).format('DD/MM/YYYY'),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => `Bs. ${total.toFixed(2)}`,
    },
    {
      title: 'Método de Pago',
      dataIndex: 'metodoPago',
      key: 'metodoPago',
      render: (metodo: string) => (
        <Tag color={metodo === 'Efectivo' ? 'green' : metodo === 'QR' ? 'blue' : 'purple'}>
          {metodo}
        </Tag>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: string | null) => (
        estado ? <Tag color="success">{estado}</Tag> : <Tag>Sin estado</Tag>
      ),
    },
    {
      title: 'Items',
      dataIndex: 'cantidadItems',
      key: 'cantidadItems',
    },
  ];

  const detallesColumns = [
    {
      title: 'Tipo',
      dataIndex: 'tipoItem',
      key: 'tipoItem',
      render: (tipo: string) => (
        <Tag color={tipo === 'Producto' ? 'blue' : 'green'}>{tipo}</Tag>
      ),
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (_: any, record: any) => 
        record.tipoItem === 'Producto' ? record.nombreProducto : record.nombreServicio,
    },
    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
      key: 'cantidad',
    },
    {
      title: 'Precio Unitario',
      dataIndex: 'precioUnitario',
      key: 'precioUnitario',
      render: (precio: number) => `Bs. ${precio.toFixed(2)}`,
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (subtotal: number) => `Bs. ${subtotal.toFixed(2)}`,
    },
  ];

  return (
    <>
      {/* Botón flotante para abrir escáner */}
      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={<QrCode size={24} />}
        onClick={handleOpenScanner}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      />

      {/* Modal de escáner */}
      <Modal
        title="Escanear Código QR"
        open={scannerOpen && !historialData}
        onCancel={handleCloseScanner}
        footer={[
          <Button key="close" onClick={handleCloseScanner}>
            Cerrar
          </Button>,
        ]}
        width={600}
      >
        <div style={{ padding: '20px' }}>
          {scannerError ? (
            <Alert
              message="Error al acceder a la cámara"
              description={scannerError}
              type="error"
              showIcon
              style={{ marginBottom: '20px' }}
            />
          ) : (
            <>
              <Alert
                message="Escanear Código QR del Cliente"
                description="Posiciona el código QR del cliente frente a la cámara. El sistema detectará automáticamente el código."
                type="info"
                showIcon
                style={{ marginBottom: '20px' }}
              />
              
              {cameras.length > 1 && (
                <div style={{ marginBottom: '20px' }}>
                  <Text strong style={{ marginRight: '10px' }}>Seleccionar Cámara:</Text>
                  <Select
                    value={selectedCamera}
                    onChange={(value) => {
                      stopScanning();
                      setSelectedCamera(value);
                    }}
                    style={{ width: '100%' }}
                  >
                    {cameras.map((cam) => (
                      <Select.Option key={cam.id} value={cam.id}>
                        {cam.label}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              )}
            </>
          )}

          <div 
            id="qr-reader" 
            style={{ 
              width: '100%', 
              minHeight: isScanning ? '300px' : '100px',
              border: isScanning ? '2px solid #1890ff' : '2px dashed #d9d9d9',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          ></div>

          {!isScanning && !scannerError && cameras.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Spin size="large" />
              <Text style={{ display: 'block', marginTop: '10px' }} type="secondary">
                Iniciando cámara...
              </Text>
            </div>
          )}

          {historialMutation.isPending && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Spin size="large" />
              <Text style={{ display: 'block', marginTop: '10px' }}>
                Cargando historial del cliente...
              </Text>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de historial del cliente */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <QrCode size={24} />
            <span>Historial del Cliente</span>
          </div>
        }
        open={!!historialData}
        onCancel={handleCloseHistorial}
        footer={[
          <Button key="close" type="primary" onClick={handleCloseHistorial}>
            Cerrar
          </Button>,
        ]}
        width={1200}
        style={{ top: 20 }}
      >
        {historialData && (
          <div>
            {/* Información del cliente */}
            <Card style={{ marginBottom: '20px' }}>
              <Descriptions title="Información del Cliente" bordered column={2}>
                <Descriptions.Item label="Nombre">{historialData.nombre}</Descriptions.Item>
                <Descriptions.Item label="Teléfono">{historialData.telefono}</Descriptions.Item>
                <Descriptions.Item label="Email">{historialData.email}</Descriptions.Item>
                <Descriptions.Item label="Fecha de Nacimiento">
                  {dayjs(historialData.fechaNacimiento).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Fecha de Registro">
                  {dayjs(historialData.fechaRegistro).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Estado">
                  <Tag color={historialData.activo ? 'success' : 'error'}>
                    {historialData.activo ? 'Activo' : 'Inactivo'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Preferencias" span={2}>
                  {historialData.preferencias || 'Sin preferencias registradas'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Estadísticas */}
            <Row gutter={16} style={{ marginBottom: '20px' }}>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Total de Ventas"
                    value={historialData.totalVentas}
                    prefix={<ShoppingCart size={20} />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Total Gastado"
                    value={historialData.totalGastado}
                    prefix={<DollarSign size={20} />}
                    valueStyle={{ color: '#1890ff' }}
                    suffix="Bs."
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Promedio de Gasto"
                    value={historialData.promedioGasto}
                    prefix={<TrendingUp size={20} />}
                    valueStyle={{ color: '#cf1322' }}
                    suffix="Bs."
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Última Compra"
                    value={dayjs(historialData.ultimaCompra).format('DD/MM/YYYY')}
                    prefix={<Calendar size={20} />}
                  />
                </Card>
              </Col>
            </Row>

            {/* Tabla de ventas */}
            <Card title="Historial de Ventas" style={{ marginBottom: '20px' }}>
              <Table
                columns={ventasColumns}
                dataSource={historialData.ventas}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                expandable={{
                  expandedRowRender: (record) => (
                    <Table
                      columns={detallesColumns}
                      dataSource={record.detalles}
                      rowKey="id"
                      pagination={false}
                      size="small"
                    />
                  ),
                  rowExpandable: (record) => record.detalles.length > 0,
                }}
              />
            </Card>
          </div>
        )}
      </Modal>
    </>
  );
};
