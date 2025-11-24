import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReporteVentas } from '../api/reportes';
import { getClientes } from '../api/clientes';
import { getCategorias } from '../api/categorias';
import { getProductos } from '../api/productos';
import { getServicios } from '../api/servicios';
import { Typography, Card, DatePicker, Select, Button, Space, Statistic, Row, Col, Table, Alert, Tag, Tabs, Divider } from 'antd';
import { Download, TrendingUp, ShoppingCart, DollarSign, ArrowUp, ArrowDown, Package, Scissors, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
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
  const { data: categorias } = useQuery({ queryKey: ['categorias'], queryFn: getCategorias });
  const { data: productos } = useQuery({ queryKey: ['productos'], queryFn: getProductos });
  const { data: servicios } = useQuery({ queryKey: ['servicios'], queryFn: getServicios });

  // Colores para los gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

  // Procesar datos para gráficos
  const chartData = useMemo(() => {
    if (!reporte) return null;

    // Datos de ventas por día
    const ventasPorDiaArray = Object.values(reporte.ventasPorDia || {}).map(dia => ({
      fecha: dayjs(dia.fecha).format('DD/MM'),
      ventas: dia.cantidadVentas,
      ingresos: dia.totalIngresos,
    })).sort((a, b) => dayjs(a.fecha, 'DD/MM').unix() - dayjs(b.fecha, 'DD/MM').unix());

    // Datos de métodos de pago
    const metodosPagoData = Object.entries(reporte.ventasPorMetodoPago || {}).map(([metodo, cantidad]) => ({
      metodo,
      cantidad,
      monto: reporte.ingresosPorMetodoPago[metodo] || 0,
    }));

    // Calcular productos más vendidos
    const productosVendidos: Record<string, { nombre: string; cantidad: number; ingresos: number }> = {};
    reporte.detalles.forEach(venta => {
      venta.detalles?.forEach(detalle => {
        if (detalle.productoId && detalle.nombreProducto) {
          const key = detalle.productoId.toString();
          if (!productosVendidos[key]) {
            productosVendidos[key] = { nombre: detalle.nombreProducto, cantidad: 0, ingresos: 0 };
          }
          productosVendidos[key].cantidad += detalle.cantidad;
          productosVendidos[key].ingresos += detalle.subtotal;
        }
      });
    });

    const topProductos = Object.values(productosVendidos)
      .sort((a, b) => b.ingresos - a.ingresos)
      .slice(0, 10);

    // Calcular servicios más vendidos
    const serviciosVendidos: Record<string, { nombre: string; cantidad: number; ingresos: number }> = {};
    reporte.detalles.forEach(venta => {
      venta.detalles?.forEach(detalle => {
        if (detalle.servicioId && detalle.nombreServicio) {
          const key = detalle.servicioId.toString();
          if (!serviciosVendidos[key]) {
            serviciosVendidos[key] = { nombre: detalle.nombreServicio, cantidad: 0, ingresos: 0 };
          }
          serviciosVendidos[key].cantidad += detalle.cantidad;
          serviciosVendidos[key].ingresos += detalle.subtotal;
        }
      });
    });

    const topServicios = Object.values(serviciosVendidos)
      .sort((a, b) => b.ingresos - a.ingresos)
      .slice(0, 10);

    // Calcular distribución productos vs servicios
    const totalProductos = Object.values(productosVendidos).reduce((sum, p) => sum + p.ingresos, 0);
    const totalServicios = Object.values(serviciosVendidos).reduce((sum, s) => sum + s.ingresos, 0);
    
    const productoVsServicio = [
      { name: 'Productos', value: totalProductos, cantidad: Object.values(productosVendidos).reduce((sum, p) => sum + p.cantidad, 0) },
      { name: 'Servicios', value: totalServicios, cantidad: Object.values(serviciosVendidos).reduce((sum, s) => sum + s.cantidad, 0) },
    ];

    // Categorías de productos (si están disponibles)
    const categoriaMap: Record<number, string> = {};
    if (Array.isArray(categorias)) {
      categorias.forEach(cat => {
        categoriaMap[cat.id] = cat.nombre;
      });
    }

    return {
      ventasPorDiaArray,
      metodosPagoData,
      topProductos,
      topServicios,
      productoVsServicio,
      categoriaMap,
    };
  }, [reporte, categorias]);

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
        <Title level={2} style={{ margin: 0 }}>Reportes y Análisis</Title>
        <Text type="secondary">Estadísticas detalladas y visualización de ventas</Text>
      </div>

      {/* Filtros */}
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

      {/* Estadísticas principales */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm rounded-xl">
            <Statistic
              title="Total Transacciones"
              value={reporte?.totalTransacciones || 0}
              prefix={<ShoppingCart size={20} />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm rounded-xl">
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
          <Card bordered={false} className="shadow-sm rounded-xl">
            <Statistic
              title="Promedio por Venta"
              value={reporte?.promedioVenta ? reporte.promedioVenta.toFixed(2) : '0.00'}
              prefix="Bs."
              suffix={<TrendingUp size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm rounded-xl">
            <Statistic
              title="Venta Mayor"
              value={reporte?.ventaMayor ? reporte.ventaMayor.toFixed(2) : '0.00'}
              prefix="Bs."
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Gráficos de tendencias */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card bordered={false} className="shadow-md rounded-2xl" title="Tendencia de Ventas e Ingresos">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData?.ventasPorDiaArray || []}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1890ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#52c41a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="ingresos" stroke="#1890ff" fillOpacity={1} fill="url(#colorIngresos)" name="Ingresos (Bs.)" />
                <Area yAxisId="right" type="monotone" dataKey="ventas" stroke="#52c41a" fillOpacity={1} fill="url(#colorVentas)" name="Cant. Ventas" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card bordered={false} className="shadow-md rounded-2xl" title="Productos vs Servicios">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData?.productoVsServicio || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData?.productoVsServicio.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `Bs. ${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              {chartData?.productoVsServicio.map((item, index) => (
                <div key={item.name} style={{ display: 'inline-block', margin: '0 10px' }}>
                  <span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: COLORS[index], marginRight: 5 }}></span>
                  <Text type="secondary">{item.name}: {item.cantidad} items</Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Métodos de pago */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card bordered={false} className="shadow-md rounded-2xl" title="Ingresos por Método de Pago">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData?.metodosPagoData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metodo" />
                <YAxis />
                <Tooltip formatter={(value: number) => `Bs. ${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="monto" fill="#1890ff" name="Ingresos (Bs.)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card bordered={false} className="shadow-md rounded-2xl" title="Cantidad por Método de Pago">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData?.metodosPagoData || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.metodo}: ${entry.cantidad}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="cantidad"
                >
                  {chartData?.metodosPagoData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Top productos y servicios */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card bordered={false} className="shadow-md rounded-2xl" title="Top 10 Productos Más Vendidos">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData?.topProductos || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="nombre" type="category" width={150} />
                <Tooltip formatter={(value: number) => `Bs. ${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="ingresos" fill="#00C49F" name="Ingresos (Bs.)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card bordered={false} className="shadow-md rounded-2xl" title="Top 10 Servicios Más Solicitados">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData?.topServicios || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="nombre" type="category" width={150} />
                <Tooltip formatter={(value: number) => `Bs. ${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="ingresos" fill="#FF8042" name="Ingresos (Bs.)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Tablas detalladas */}
      <Tabs defaultActiveKey="ventas">
        <Tabs.TabPane tab="Detalle de Ventas" key="ventas">
          <Card bordered={false} className="shadow-md rounded-2xl">
            <Table
              dataSource={reporte?.detalles || []}
              columns={[
                { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
                { title: 'Cliente', dataIndex: 'nombreCliente', key: 'nombreCliente' },
                { title: 'Fecha', dataIndex: 'fecha', key: 'fecha', render: (fecha) => dayjs(fecha).format('DD/MM/YYYY HH:mm') },
                { title: 'Items', dataIndex: 'cantidadItems', key: 'cantidadItems' },
                { title: 'Total', dataIndex: 'total', key: 'total', render: (total) => <Text strong>Bs. {total.toFixed(2)}</Text> },
                { title: 'Método', dataIndex: 'metodoPago', key: 'metodoPago', render: (m) => <Tag color="blue">{m}</Tag> },
              ]}
              expandable={{
                expandedRowRender: (record) => (
                  <Table
                    dataSource={record.detalles || []}
                    columns={[
                      { title: 'Tipo', dataIndex: 'tipoItem', key: 'tipoItem', render: (tipo) => <Tag color={tipo === 'Producto' ? 'blue' : 'purple'}>{tipo}</Tag> },
                      { title: 'Nombre', key: 'nombre', render: (_, detalle) => detalle.nombreProducto || detalle.nombreServicio },
                      { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
                      { title: 'Precio Unit.', dataIndex: 'precioUnitario', key: 'precioUnitario', render: (p) => `Bs. ${p.toFixed(2)}` },
                      { title: 'Subtotal', dataIndex: 'subtotal', key: 'subtotal', render: (s) => <Text strong>Bs. {s.toFixed(2)}</Text> },
                    ]}
                    pagination={false}
                    size="small"
                  />
                ),
              }}
              rowKey="id"
              pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} ventas` }}
              loading={isLoading}
            />
          </Card>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Productos Vendidos" key="productos">
          <Card bordered={false} className="shadow-md rounded-2xl">
            <Table
              dataSource={chartData?.topProductos || []}
              columns={[
                { title: 'Producto', dataIndex: 'nombre', key: 'nombre' },
                { title: 'Cantidad Vendida', dataIndex: 'cantidad', key: 'cantidad', sorter: (a, b) => a.cantidad - b.cantidad },
                { title: 'Ingresos', dataIndex: 'ingresos', key: 'ingresos', render: (i) => <Text strong>Bs. {i.toFixed(2)}</Text>, sorter: (a, b) => a.ingresos - b.ingresos },
              ]}
              rowKey="nombre"
              pagination={false}
              loading={isLoading}
            />
          </Card>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Servicios Prestados" key="servicios">
          <Card bordered={false} className="shadow-md rounded-2xl">
            <Table
              dataSource={chartData?.topServicios || []}
              columns={[
                { title: 'Servicio', dataIndex: 'nombre', key: 'nombre' },
                { title: 'Cantidad Prestada', dataIndex: 'cantidad', key: 'cantidad', sorter: (a, b) => a.cantidad - b.cantidad },
                { title: 'Ingresos', dataIndex: 'ingresos', key: 'ingresos', render: (i) => <Text strong>Bs. {i.toFixed(2)}</Text>, sorter: (a, b) => a.ingresos - b.ingresos },
              ]}
              rowKey="nombre"
              pagination={false}
              loading={isLoading}
            />
          </Card>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};
