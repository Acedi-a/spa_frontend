import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getReporteEmpleada,
  getPromedioEmpleada,
  createValoracion,
} from '../api/valoraciones';
import { getClientes } from '../api/clientes';
import { getServicios } from '../api/servicios';
import { getVentas } from '../api/ventas';
import type { Empleada } from '../types/empleada';
import type { CreateValoracionDto } from '../types/valoracion';
import {
  Form,
  Button,
  Input,
  Rate,
  Typography,
  Spin,
  Empty,
  Card,
  Space,
  Select,
  message,
  Drawer,
} from 'antd';
import { Star, MessageSquare, Calendar, User } from 'lucide-react';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

interface ValoracionesModalProps {
  empleada: Empleada;
  visible: boolean;
  onClose: () => void;
}

export const ValoracionesModal = ({ empleada, visible, onClose }: ValoracionesModalProps) => {
  const [form] = Form.useForm();
  const [rating, setRating] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  // Queries
  const { data: reporte, isLoading: reporteLoading } = useQuery({
    queryKey: ['reporte-empleada', empleada.id],
    queryFn: () => getReporteEmpleada(empleada.id),
    enabled: visible,
  });

  const { data: promedio, isLoading: promedioLoading } = useQuery({
    queryKey: ['promedio', empleada.id],
    queryFn: () => getPromedioEmpleada(empleada.id),
    enabled: visible,
    staleTime: Infinity,
  });

  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: getClientes,
    enabled: isCreating && visible,
  });

  const { data: servicios } = useQuery({
    queryKey: ['servicios'],
    queryFn: getServicios,
    enabled: isCreating && visible,
  });

  const { data: ventas } = useQuery({
    queryKey: ['ventas'],
    queryFn: getVentas,
    enabled: isCreating && visible,
  });

  const createMutation = useMutation({
    mutationFn: createValoracion,
    onSuccess: () => {
      message.success('Valoración creada exitosamente');
      form.resetFields();
      setRating(0);
      setIsCreating(false);
      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['reporte-empleada', empleada.id] });
      queryClient.invalidateQueries({ queryKey: ['promedio', empleada.id] });
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.mensaje || 'Error al crear la valoración';
      message.error(errorMsg);
    },
  });

  const handleSubmit = (values: any) => {
    if (rating === 0) {
      message.error('Por favor selecciona una calificación');
      return;
    }

    const valoracionData: CreateValoracionDto = {
      clienteId: values.clienteId,
      empleadaId: empleada.id,
      servicioId: values.servicioId,
      ventaId: values.ventaId,
      calificacion: rating,
      comentario: values.comentario || null,
    };

    createMutation.mutate(valoracionData);
  };

  const valoracionesArray = reporte?.valoraciones || [];

  return (
    <Drawer
      title={`Valoraciones - ${empleada.nombre}`}
      placement="right"
      onClose={onClose}
      open={visible}
      width={500}
    >
      <Spin spinning={reporteLoading || promedioLoading}>
        <div className="space-y-6">
          {/* Resumen de Rating */}
          {promedio && (
            <Card className="border-0 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center justify-between">
                <div>
                  <Text type="secondary" className="text-sm">Calificación Promedio</Text>
                  <div className="flex items-center gap-2 mt-1">
                    <Title level={3} style={{ margin: 0 }}>
                      {promedio.promedioCalificacion ? promedio.promedioCalificacion.toFixed(1) : '0.0'}
                    </Title>
                    <Rate value={promedio.promedioCalificacion ? Math.round(promedio.promedioCalificacion) : 0} disabled style={{ color: '#faad14' }} />
                  </div>
                  <Text type="secondary" className="text-xs">
                    Basado en {reporte?.totalValoraciones || 0} valoracion{(reporte?.totalValoraciones || 0) !== 1 ? 'es' : ''}
                  </Text>
                </div>
                <Star size={48} className="text-amber-400" fill="currentColor" />
              </div>
            </Card>
          )}

          {/* Botón para crear valoración */}
          {!isCreating && (
            <Button
              type="primary"
              block
              onClick={() => setIsCreating(true)}
              icon={<MessageSquare size={16} />}
            >
              Crear Nueva Valoración
            </Button>
          )}

          {/* Formulario para crear valoración */}
          {isCreating && (
            <Card className="border border-blue-200 bg-blue-50">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <Text strong>Calificación</Text>
                  <Rate
                    value={rating}
                    onChange={setRating}
                    style={{ marginTop: 8, fontSize: 28, color: '#faad14' }}
                  />
                </div>

                <Form.Item
                  name="clienteId"
                  label="Cliente"
                  rules={[{ required: true, message: 'Selecciona un cliente' }]}
                >
                  <Select placeholder="Selecciona cliente" showSearch optionFilterProp="children">
                    {Array.isArray(clientes) &&
                      clientes.map((c) => (
                        <Select.Option key={c.id} value={c.id}>
                          {c.nombre}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="servicioId"
                  label="Servicio"
                  rules={[{ required: true, message: 'Selecciona un servicio' }]}
                >
                  <Select placeholder="Selecciona servicio">
                    {Array.isArray(servicios) &&
                      servicios.map((s) => (
                        <Select.Option key={s.id} value={s.id}>
                          {s.nombre}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="ventaId"
                  label="Venta (Factura)"
                  rules={[{ required: true, message: 'Selecciona una venta' }]}
                >
                  <Select placeholder="Selecciona venta" showSearch optionFilterProp="children">
                    {Array.isArray(ventas) &&
                      ventas.map((v) => (
                        <Select.Option key={v.id} value={v.id}>
                          #{v.id} - {dayjs(v.fecha).format('DD/MM/YYYY')}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="comentario"
                  label="Comentario (opcional, máx 1000 caracteres)"
                >
                  <Input.TextArea
                    placeholder="Comparte tu experiencia..."
                    maxLength={1000}
                    rows={3}
                    showCount
                  />
                </Form.Item>

                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={createMutation.isPending}
                  >
                    Enviar Valoración
                  </Button>
                  <Button onClick={() => setIsCreating(false)}>Cancelar</Button>
                </Space>
              </Form>
            </Card>
          )}

          {/* Lista de valoraciones */}
          <div>
            <Title level={4}>Últimas Valoraciones ({valoracionesArray.length})</Title>

            {valoracionesArray.length === 0 ? (
              <Empty description="Sin valoraciones aún" />
            ) : (
              <div className="space-y-3">
                {valoracionesArray.map((val: any) => (
                  <Card key={val.id} size="small" className="border border-slate-200">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-slate-400" />
                          <Text strong className="text-sm">{val.nombreCliente}</Text>
                        </div>
                        <Rate
                          value={val.calificacion}
                          disabled
                          style={{ fontSize: 14, color: '#faad14' }}
                        />
                      </div>

                      {val.comentario && (
                        <Paragraph ellipsis={{ rows: 2 }} className="text-sm text-slate-600 mb-0">
                          {val.comentario}
                        </Paragraph>
                      )}

                      {val.fecha && (
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Calendar size={12} />
                          <span>{dayjs(val.fecha).format('DD/MM/YYYY')}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </Spin>
    </Drawer>
  );
};
