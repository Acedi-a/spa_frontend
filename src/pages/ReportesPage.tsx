import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReporteVentas } from '../api/reportes';
import { getClientes } from '../api/clientes';
import { Typography, Card, DatePicker, Select, Button, Space, Statistic, Row, Col, Table, Alert } from 'antd';
import { Download, TrendingUp, ShoppingCart, DollarSign } from 'lucide-react';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const ReportesPage = () => {
  const [fechaInicio, setFechaInicio] = useState<string | undefined>();
  const [fechaFin, setFechaFin] = useState<string | undefined>();
  const [clienteId, setClienteId] = useState<string | undefined>();

  const { data: reporte, isLoading, isError } = useQuery({
    queryKey: ['reporte-ventas', fechaInicio, fechaFin, clienteId],
    queryFn: () => getReporteVentas({ fechaInicio, fechaFin, clienteId }),
  });

  const { data: clientes } = useQuery({ queryKey: ['clientes'], queryFn: getClientes });

  const handleDateChange = (dates: any) => {
    if (dates) {
      setFechaInicio(dates[0].format('YYYY-MM-DD'));
      setFechaFin(dates[1].format('YYYY-MM-DD'));
    } else {
      setFechaInicio(undefined);
      setFechaFin(undefined);
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
          <RangePicker format="DD/MM/YYYY" placeholder={['Fecha inicio', 'Fecha fin']} onChange={handleDateChange} />
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
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Total Ventas"
              value={reporte?.totalVentas || 0}
              prefix={<ShoppingCart size={20} />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Monto Total"
              value={reporte?.montoTotal ? reporte.montoTotal.toFixed(2) : '0.00'}
              prefix="Bs."
              suffix={<DollarSign size={20} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Promedio por Venta"
              value={reporte && reporte.montoTotal && reporte.totalVentas ? (reporte.montoTotal / reporte.totalVentas).toFixed(2) : '0.00'}
              prefix="Bs."
              suffix={<TrendingUp size={20} />}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} className="shadow-md rounded-2xl" title="Ventas por Método de Pago">
        <Table
          dataSource={Array.isArray(reporte?.ventasPorMetodoPago) ? reporte.ventasPorMetodoPago : []}
          columns={[
            { title: 'Método de Pago', dataIndex: 'metodoPago', key: 'metodoPago' },
            { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
            { title: 'Monto Total', dataIndex: 'monto', key: 'monto', render: (monto) => monto ? `Bs. ${monto.toFixed(2)}` : 'Bs. 0.00' },
          ]}
          rowKey="metodoPago"
          pagination={false}
          loading={isLoading}
        />
      </Card>
    </div>
  );
};
