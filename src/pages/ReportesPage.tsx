import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReporteVentas } from '../api/reportes';
import { getClientes } from '../api/clientes';
import { Typography, Card, DatePicker, Select, Button, Space, Statistic, Row, Col, Table, Alert, Tag } from 'antd';
import { Download, TrendingUp, ShoppingCart, DollarSign } from 'lucide-react';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const ReportesPage = () => {
  // Inicializar con rango del último mes
  const [fechaInicio, setFechaInicio] = useState<string>(dayjs().subtract(1, 'month').format('YYYY-MM-DD'));
  const [fechaFin, setFechaFin] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [clienteId, setClienteId] = useState<string | undefined>();

  const { data: reporte, isLoading, isError } = useQuery({
    queryKey: ['reporte-ventas', fechaInicio, fechaFin, clienteId],
    queryFn: () => getReporteVentas({ fechaInicio, fechaFin, clienteId }),
    enabled: !!fechaInicio && !!fechaFin,
  });

  const { data: clientes } = useQuery({ queryKey: ['clientes'], queryFn: getClientes });

  const handleDateChange = (dates: any) => {
    if (dates) {
      setFechaInicio(dates[0].format('YYYY-MM-DD'));
      setFechaFin(dates[1].format('YYYY-MM-DD'));
    } else {
      // Reset a último mes
      setFechaInicio(dayjs().subtract(1, 'month').format('YYYY-MM-DD'));
      setFechaFin(dayjs().format('YYYY-MM-DD'));
    }
  };

  if (isError) return <Alert message="Error al cargar reportes" type="error" showIcon />;

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} style={{ margin: 0 }}>Reportes de Ventas</Title>
        <Text type="secondary">Análisis y estadísticas de ventas.</Text>
      </div>

      <Card bordered={false} className="shadow-sm rounded-2xl">
        <Space wrap size="large">
          <RangePicker 
            format="DD/MM/YYYY" 
            placeholder={['Fecha inicio', 'Fecha fin']} 
            onChange={handleDateChange}
            defaultValue={[dayjs().subtract(1, 'month'), dayjs()]}
          />
          <Select
            placeholder="Filtrar por cliente"
            className="w-64"
            allowClear
            showSearch
            optionFilterProp="children"
            onChange={(value) => setClienteId(value)}
          >
            {Array.isArray(clientes) && clientes.map(c => <Select.Option key={c.id} value={c.id}>{c.nombre}</Select.Option>)}
          </Select>
          <Button icon={<Download size={18} />}>Exportar PDF</Button>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Total Transacciones"
              value={reporte?.totalTransacciones || 0}
              prefix={<ShoppingCart size={20} />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Ingresos Totales"
              value={reporte?.totalIngresos ? reporte.totalIngresos.toFixed(2) : '0.00'}
              prefix="Bs."
              suffix={<DollarSign size={20} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Promedio por Venta"
              value={reporte?.promedioVenta ? reporte.promedioVenta.toFixed(2) : '0.00'}
              prefix="Bs."
              suffix={<TrendingUp size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Venta Mayor"
              value={reporte?.ventaMayor ? reporte.ventaMayor.toFixed(2) : '0.00'}
              prefix="Bs."
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card bordered={false} className="shadow-md rounded-2xl" title="Ventas por Método de Pago">
            <Table
              dataSource={reporte?.ventasPorMetodoPago ? Object.entries(reporte.ventasPorMetodoPago).map(([metodo, cantidad]) => ({
                metodoPago: metodo,
                cantidad,
                monto: reporte.ingresosPorMetodoPago[metodo] || 0
              })) : []}
              columns={[
                { title: 'Método de Pago', dataIndex: 'metodoPago', key: 'metodoPago' },
                { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
                { title: 'Monto Total', dataIndex: 'monto', key: 'monto', render: (monto) => `Bs. ${monto.toFixed(2)}` },
              ]}
              rowKey="metodoPago"
              pagination={false}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card bordered={false} className="shadow-md rounded-2xl" title="Detalle de Ventas">
            <Table
              dataSource={reporte?.detalles || []}
              columns={[
                { title: 'Cliente', dataIndex: 'nombreCliente', key: 'nombreCliente' },
                { title: 'Fecha', dataIndex: 'fecha', key: 'fecha', render: (fecha) => dayjs(fecha).format('DD/MM/YYYY') },
                { title: 'Total', dataIndex: 'total', key: 'total', render: (total) => `Bs. ${total.toFixed(2)}` },
                { title: 'Método', dataIndex: 'metodoPago', key: 'metodoPago', render: (m) => <Tag color="blue">{m}</Tag> },
              ]}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              loading={isLoading}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
