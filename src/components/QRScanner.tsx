import React, { useState, useEffect } from 'react';
import { Modal, Button, Spin, Alert, Typography, Statistic, Card, Row, Col, Table, Tag, Descriptions } from 'antd';
import { QrCode, ShoppingCart, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useMutation } from '@tanstack/react-query';
import { getHistorialByQR } from '../api/historial';
import type { HistorialCliente } from '../types/historialCliente';
import dayjs from 'dayjs';

const { Text } = Typography;

export const QRScanner: React.FC = () => {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [historialData, setHistorialData] = useState<HistorialCliente | null>(null);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);

  const historialMutation = useMutation({
    mutationFn: (qrCode: string) => getHistorialByQR(qrCode),
    onSuccess: (data) => {
      setHistorialData(data);
      if (scanner) {
        scanner.clear();
      }
    },
    onError: (error: any) => {
      Modal.error({
        title: 'Error al cargar historial',
        content: error.response?.data?.message || 'No se encontró información para este código QR',
      });
      if (scanner) {
        scanner.clear();
      }
      setScannerOpen(false);
    },
  });

  useEffect(() => {
    if (scannerOpen && !scanner) {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        'qr-reader',
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      html5QrcodeScanner.render(
        (decodedText) => {
          // Validar que sea un UUID
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (uuidRegex.test(decodedText)) {
            historialMutation.mutate(decodedText);
          } else {
            Modal.error({
              title: 'Código QR inválido',
              content: 'El código escaneado no es un código válido del sistema',
            });
          }
        },
        (errorMessage) => {
          // Ignorar errores de escaneo continuo
          console.log(errorMessage);
        }
      );

      setScanner(html5QrcodeScanner);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [scannerOpen]);

  const handleOpenScanner = () => {
    setScannerOpen(true);
    setHistorialData(null);
  };

  const handleCloseScanner = () => {
    if (scanner) {
      scanner.clear().catch(console.error);
      setScanner(null);
    }
    setScannerOpen(false);
  };

  const handleCloseHistorial = () => {
    setHistorialData(null);
    setScannerOpen(false);
    if (scanner) {
      scanner.clear().catch(console.error);
      setScanner(null);
    }
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
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Alert
            message="Posiciona el código QR frente a la cámara"
            type="info"
            showIcon
            style={{ marginBottom: '20px' }}
          />
          <div id="qr-reader" style={{ width: '100%' }}></div>
          {historialMutation.isPending && (
            <div style={{ marginTop: '20px' }}>
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
