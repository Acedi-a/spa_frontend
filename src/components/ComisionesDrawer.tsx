import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { calcularComisiones } from '../api/comisiones';
import type { Empleada } from '../types/empleada';
import type { ComisionData } from '../types/comision';
import {
  Drawer,
  Form,
  Button,
  DatePicker,
  Card,
  Statistic,
  Spin,
  message,
  Typography,
  Alert,
  Table,
  Divider,
  Row,
  Col,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DollarSign, Calendar, ShoppingCart } from 'lucide-react';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface ComisionesDrawerProps {
  empleada: Empleada;
  visible: boolean;
  onClose: () => void;
}

export const ComisionesDrawer = ({ empleada, visible, onClose }: ComisionesDrawerProps) => {
  const [form] = Form.useForm();
  const [comisionData, setComisionData] = useState<ComisionData | null>(null);
  const [fechasSeleccionadas, setFechasSeleccionadas] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const mutation = useMutation({
    mutationFn: (params: { fechaInicio: string; fechaFin: string }) =>
      calcularComisiones(empleada.id, params.fechaInicio, params.fechaFin),
    onSuccess: (data) => {
      setComisionData(data);
      message.success('Comisiones calculadas exitosamente');
    },
    onError: (error: { response?: { data?: { mensaje?: string } } } | Error) => {
      const errorMsg =
        ('response' in error && (error.response?.data as { mensaje?: string })?.mensaje) ||
        ('message' in error && error.message) ||
        'Error al calcular comisiones';
      message.error(errorMsg);
      setComisionData(null);
    },
  });

  const handleSubmit = (values: { rango?: [dayjs.Dayjs, dayjs.Dayjs] }) => {
    if (!values.rango || values.rango.length !== 2) {
      message.error('Por favor selecciona un rango de fechas válido');
      return;
    }

    const [fechaInicio, fechaFin] = values.rango;
    setFechasSeleccionadas([fechaInicio, fechaFin]);

    // Convertir a formato ISO 8601 que espera el backend
    const fechaInicioISO = fechaInicio.format('YYYY-MM-DDTHH:mm:ss');  // Genera: 2025-11-23T04:00:00
const fechaFinISO = fechaFin.format('YYYY-MM-DDTHH:mm:ss');

    mutation.mutate({
      fechaInicio: fechaInicioISO,
      fechaFin: fechaFinISO,
    });
  };

  const handleClose = () => {
    form.resetFields();
    setComisionData(null);
    setFechasSeleccionadas(null);
    onClose();
  };

  // Columnas para la tabla de detalles
  const detalleColumns: ColumnsType<any> = [
    {
      title: 'Fecha',
      dataIndex: 'fechaVenta',
      key: 'fechaVenta',
      render: (fecha) => dayjs(fecha).format('DD/MM/YYYY HH:mm'),
      width: 140,
    },
    {
      title: 'Servicio',
      dataIndex: 'nombreServicio',
      key: 'nombreServicio',
      width: 150,
    },
    {
      title: 'Precio',
      dataIndex: 'precioServicio',
      key: 'precioServicio',
      render: (precio) => `Bs. ${precio.toFixed(2)}`,
      align: 'right' as const,
      width: 100,
    },
    {
      title: 'Qty',
      dataIndex: 'cantidad',
      key: 'cantidad',
      align: 'center' as const,
      width: 60,
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotalServicio',
      key: 'subtotalServicio',
      render: (subtotal) => `Bs. ${subtotal.toFixed(2)}`,
      align: 'right' as const,
      width: 100,
    },
    {
      title: 'Comisión',
      dataIndex: 'comisionServicio',
      key: 'comisionServicio',
      render: (comision) => <span className="text-emerald-600 font-bold">Bs. {comision.toFixed(2)}</span>,
      align: 'right' as const,
      width: 120,
    },
  ];

  return (
    <Drawer
      title={`Comisiones - ${empleada.nombre}`}
      placement="right"
      onClose={handleClose}
      open={visible}
      width={500}
    >
      <Spin spinning={mutation.isPending}>
        <div className="space-y-6">
        {/* Información de la empleada */}
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="space-y-2">
            <Text type="secondary" className="text-sm">Información de la Empleada</Text>
            <Title level={4} style={{ margin: 0 }}>
              {empleada.nombre}
            </Title>
            <div className="text-sm">
              <p className="text-slate-600">Email: {empleada.email}</p>
              {empleada.especialidad && (
                <p className="text-slate-600">Especialidad: {empleada.especialidad}</p>
              )}
              <p className="text-slate-600">Comisión: {empleada.porcentajeComision}%</p>
            </div>
          </div>
        </Card>

        {/* Formulario para seleccionar fechas */}
        <Card>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="rango"
              label="Rango de Fechas"
              rules={[{ required: true, message: 'Por favor selecciona un rango de fechas' }]}
            >
              <DatePicker.RangePicker
                format="DD/MM/YYYY"
                placeholder={['Fecha Inicio', 'Fecha Fin']}
                style={{ width: '100%' }}
                disabledDate={(current) => {
                  // No permitir fechas futuras
                  return current && current.isAfter(dayjs().endOf('day'));
                }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={mutation.isPending}
                icon={<DollarSign size={16} />}
              >
                {mutation.isPending ? 'Calculando...' : 'Calcular Comisiones'}
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Resultado */}
        {comisionData && !mutation.isPending && (
          <div className="space-y-4">
            {fechasSeleccionadas && (
              <Alert
                message="Período de Cálculo"
                description={
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>
                      {fechasSeleccionadas[0].format('DD/MM/YYYY')} -{' '}
                      {fechasSeleccionadas[1].format('DD/MM/YYYY')}
                    </span>
                  </div>
                }
                type="info"
                showIcon
              />
            )}

            {/* Resumen de Comisiones */}
            <Card className="border-2 border-emerald-200 bg-emerald-50">
              <Row gutter={24}>
                <Col xs={24} sm={12}>
                  <Statistic
                    title="Comisión Total"
                    value={comisionData.comisionTotal}
                    prefix="Bs. "
                    precision={2}
                    valueStyle={{ color: '#10b981', fontSize: '24px' }}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Statistic
                    title="Total Ventas"
                    value={comisionData.totalVentas}
                    prefix="Bs. "
                    precision={2}
                    valueStyle={{ color: '#3b82f6' }}
                  />
                </Col>
              </Row>
              <Divider style={{ margin: '12px 0' }} />
              <Row gutter={24}>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Cantidad de Ventas"
                    value={comisionData.cantidadVentas}
                    suffix="venta(s)"
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="% Comisión"
                    value={comisionData.porcentajeComision}
                    suffix="%"
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Promedio/Venta"
                    value={comisionData.cantidadVentas > 0 ? comisionData.comisionTotal / comisionData.cantidadVentas : 0}
                    prefix="Bs. "
                    precision={2}
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
              </Row>
            </Card>

            {/* Detalle de Servicios */}
            {comisionData.detalleServicios && comisionData.detalleServicios.length > 0 && (
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingCart size={18} className="text-blue-500" />
                  <Title level={5} style={{ margin: 0 }}>
                    Detalle de Servicios ({comisionData.detalleServicios.length})
                  </Title>
                </div>
                <Table
                  columns={detalleColumns}
                  dataSource={comisionData.detalleServicios}
                  rowKey="ventaId"
                  pagination={false}
                  size="small"
                  scroll={{ x: 800 }}
                />
              </Card>
            )}

            <Button
              type="default"
              block
              onClick={() => {
                form.resetFields();
                setComisionData(null);
                setFechasSeleccionadas(null);
              }}
            >
              Calcular Otra Fecha
            </Button>
          </div>
        )}

        {!mutation.isPending && !comisionData && (
          <Alert
            message="Instrucciones"
            description="Selecciona un rango de fechas y haz clic en 'Calcular Comisiones' para ver el total de comisiones ganadas por esta empleada en ese período."
            type="info"
            showIcon
          />
        )}
        </div>
      </Spin>
    </Drawer>
  );
};
