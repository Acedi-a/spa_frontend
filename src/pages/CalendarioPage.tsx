import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCitas } from '../api/citas';
import { getVentas } from '../api/ventas';
import { getClientes, getClienteById } from '../api/clientes';
import { getEmpleadas } from '../api/empleadas';
import { getServicios } from '../api/servicios';
import type { Cita } from '../types/cita';
import type { Venta } from '../types/venta';
import { 
  Calendar, Card, Typography, Space, Tag, Modal, Descriptions, 
  Segmented, Spin, Empty, Divider, Button
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { 
  CalendarDays, Clock, User, Scissors, DollarSign, 
  TrendingUp, Phone, Mail, CreditCard
} from 'lucide-react';

dayjs.locale('es');

const { Title, Text } = Typography;

export const CalendarioPage = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [viewMode, setViewMode] = useState<'citas' | 'ventas' | 'ambos'>('citas');
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);

  // Queries
  const { data: citas, isLoading: loadingCitas } = useQuery({ 
    queryKey: ['citas'], 
    queryFn: getCitas 
  });
  const { data: ventas, isLoading: loadingVentas } = useQuery({ 
    queryKey: ['ventas'], 
    queryFn: getVentas 
  });
  const { data: clientes } = useQuery({ queryKey: ['clientes'], queryFn: getClientes });
  const { data: empleadas } = useQuery({ queryKey: ['empleadas'], queryFn: getEmpleadas });
  const { data: servicios } = useQuery({ queryKey: ['servicios'], queryFn: getServicios });

  // Query para cliente de cita seleccionada
  const { data: clienteCita, isLoading: loadingClienteCita } = useQuery({
    queryKey: ['cliente', selectedCita?.clienteId],
    queryFn: () => selectedCita ? getClienteById(selectedCita.clienteId) : null,
    enabled: !!selectedCita,
  });

  // Query para cliente de venta seleccionada
  const { data: clienteVenta, isLoading: loadingClienteVenta } = useQuery({
    queryKey: ['cliente', selectedVenta?.clienteId],
    queryFn: () => selectedVenta ? getClienteById(selectedVenta.clienteId) : null,
    enabled: !!selectedVenta,
  });

  // Helpers
  const citasArray = Array.isArray(citas) ? citas : [];
  const ventasArray = Array.isArray(ventas) ? ventas : [];

  const getClienteNombre = (clienteId: string) => {
    const cliente = Array.isArray(clientes) ? clientes.find(c => c.id === clienteId) : null;
    return cliente?.nombre || 'N/A';
  };

  const getEmpleadaNombre = (empleadaId: number) => {
    const empleada = Array.isArray(empleadas) ? empleadas.find(e => e.id === empleadaId) : null;
    return empleada?.nombre || 'N/A';
  };

  const getServicioInfo = (servicioId: number) => {
    const servicio = Array.isArray(servicios) ? servicios.find(s => s.id === servicioId) : null;
    return servicio || null;
  };

  // Obtener eventos del día
  const getCitasDelDia = (date: Dayjs) => {
    return citasArray.filter(cita => 
      dayjs(cita.fecha).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
    );
  };

  const getVentasDelDia = (date: Dayjs) => {
    return ventasArray.filter(venta => 
      dayjs(venta.fecha).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
    );
  };

  // Renderizar contenido de celdas del calendario
  const dateCellRender = (value: Dayjs) => {
    const citasDelDia = getCitasDelDia(value);
    const ventasDelDia = getVentasDelDia(value);
    const showCitas = viewMode === 'citas' || viewMode === 'ambos';
    const showVentas = viewMode === 'ventas' || viewMode === 'ambos';

    return (
      <div className="h-full flex flex-col gap-1.5 items-center justify-center">
        {showCitas && citasDelDia.length > 0 && (
          <div className="calendar-badge calendar-badge-citas">
            <Clock size={12} />
            <span>{citasDelDia.length}</span>
          </div>
        )}
        {showVentas && ventasDelDia.length > 0 && (
          <div className="calendar-badge calendar-badge-ventas">
            <DollarSign size={12} />
            <span>{ventasDelDia.length}</span>
          </div>
        )}
      </div>
    );
  };

  // Seleccionar fecha
  const onSelect = (date: Dayjs) => {
    setSelectedDate(date);
  };

  // Citas y ventas del día seleccionado
  const citasSeleccionadas = getCitasDelDia(selectedDate);
  const ventasSeleccionadas = getVentasDelDia(selectedDate);

  const isLoading = loadingCitas || loadingVentas;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <CalendarDays className="inline mr-2" size={28} />
            Calendario
          </Title>
          <Text type="secondary">Gestiona tus citas y ventas en un solo lugar</Text>
        </div>
        <Segmented
          options={[
            { label: 'Citas', value: 'citas', icon: <Clock size={16} /> },
            { label: 'Ventas', value: 'ventas', icon: <DollarSign size={16} /> },
            { label: 'Ambos', value: 'ambos', icon: <TrendingUp size={16} /> },
          ]}
          value={viewMode}
          onChange={(value) => setViewMode(value as any)}
          size="large"
        />
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <Text type="secondary">Total Citas</Text>
              <Title level={3} style={{ margin: 0 }}>{citasArray.length}</Title>
            </div>
            <Clock size={40} className="text-green-500" />
          </div>
        </Card>
        <Card className="shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <Text type="secondary">Total Ventas</Text>
              <Title level={3} style={{ margin: 0 }}>{ventasArray.length}</Title>
            </div>
            <DollarSign size={40} className="text-blue-500" />
          </div>
        </Card>
        <Card className="shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <Text type="secondary">Hoy</Text>
              <Title level={3} style={{ margin: 0 }}>
                {getCitasDelDia(dayjs()).length} / {getVentasDelDia(dayjs()).length}
              </Title>
            </div>
            <CalendarDays size={40} className="text-purple-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-2">
          <Card className="shadow-md">
            <Calendar
              fullscreen={false}
              onSelect={onSelect}
              dateCellRender={dateCellRender}
              className="custom-calendar"
            />
          </Card>
        </div>

        {/* Panel lateral - Detalles del día */}
        <div className="space-y-4">
          <Card 
            className="shadow-md"
            title={
              <div className="flex items-center gap-2">
                <CalendarDays size={20} />
                <span>{selectedDate.format('DD [de] MMMM, YYYY')}</span>
              </div>
            }
          >
            {/* Citas del día */}
            {(viewMode === 'citas' || viewMode === 'ambos') && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <Text strong className="flex items-center gap-2">
                    <Clock size={16} className="text-green-500" />
                    Citas ({citasSeleccionadas.length})
                  </Text>
                </div>
                {citasSeleccionadas.length > 0 ? (
                  <Space direction="vertical" className="w-full" size="small">
                    {citasSeleccionadas.map(cita => {
                      const servicio = getServicioInfo(cita.servicioId);
                      return (
                        <Card
                          key={cita.id}
                          size="small"
                          hoverable
                          onClick={() => setSelectedCita(cita)}
                          className="border-l-4 border-l-green-500"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Text strong>{cita.hora.slice(0, 5)}</Text>
                              <Tag color="green">{servicio?.nombre || 'N/A'}</Tag>
                            </div>
                            <Text className="text-xs text-gray-600">
                              <User size={12} className="inline mr-1" />
                              {getClienteNombre(cita.clienteId)}
                            </Text>
                            <Text className="text-xs text-gray-600">
                              Empleada: {getEmpleadaNombre(cita.empleadaId)}
                            </Text>
                          </div>
                        </Card>
                      );
                    })}
                  </Space>
                ) : (
                  <Empty description="No hay citas este día" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </div>
            )}

            {/* Ventas del día */}
            {(viewMode === 'ventas' || viewMode === 'ambos') && (
              <div>
                {viewMode === 'ambos' && citasSeleccionadas.length > 0 && <Divider />}
                <div className="flex items-center justify-between mb-3">
                  <Text strong className="flex items-center gap-2">
                    <DollarSign size={16} className="text-blue-500" />
                    Ventas ({ventasSeleccionadas.length})
                  </Text>
                </div>
                {ventasSeleccionadas.length > 0 ? (
                  <Space direction="vertical" className="w-full" size="small">
                    {ventasSeleccionadas.map(venta => (
                      <Card
                        key={venta.id}
                        size="small"
                        hoverable
                        onClick={() => setSelectedVenta(venta)}
                        className="border-l-4 border-l-blue-500"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <Text strong>Bs. {venta.total.toFixed(2)}</Text>
                            <Tag color="blue">{venta.metodoPago}</Tag>
                          </div>
                          <Text className="text-xs text-gray-600">
                            <User size={12} className="inline mr-1" />
                            {getClienteNombre(venta.clienteId)}
                          </Text>
                        </div>
                      </Card>
                    ))}
                  </Space>
                ) : (
                  <Empty description="No hay ventas este día" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modal detalle de Cita */}
      <Modal
        title={<div className="flex items-center gap-2"><Clock size={20} /> Detalle de Cita</div>}
        open={!!selectedCita}
        onCancel={() => setSelectedCita(null)}
        footer={[<Button key="close" type="primary" onClick={() => setSelectedCita(null)}>Cerrar</Button>]}
        width={700}
      >
        {selectedCita && (
          <div className="space-y-6">
            {loadingClienteCita ? (
              <div className="flex justify-center py-8"><Spin size="large" /></div>
            ) : (
              <>
                {/* Info del Cliente */}
                <Card title={<div className="flex items-center gap-2"><User size={18} /> Cliente</div>} size="small">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Nombre">
                      <Text strong>{clienteCita?.nombre || 'N/A'}</Text>
                    </Descriptions.Item>
                    {clienteCita?.email && (
                      <Descriptions.Item label={<span className="flex items-center gap-2"><Mail size={14} /> Email</span>}>
                        {clienteCita.email}
                      </Descriptions.Item>
                    )}
                    {clienteCita?.telefono && (
                      <Descriptions.Item label={<span className="flex items-center gap-2"><Phone size={14} /> Teléfono</span>}>
                        {clienteCita.telefono}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>

                {/* Info de la Cita */}
                <Card title={<div className="flex items-center gap-2"><Scissors size={18} /> Detalles de la Cita</div>} size="small">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Fecha">
                      {dayjs(selectedCita.fecha).format('DD/MM/YYYY')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Hora">
                      <Tag color="green">{selectedCita.hora.slice(0, 5)}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Empleada">
                      {getEmpleadaNombre(selectedCita.empleadaId)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Servicio">
                      <Text strong>{getServicioInfo(selectedCita.servicioId)?.nombre || 'N/A'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Duración">
                      {getServicioInfo(selectedCita.servicioId)?.duracion || 0} minutos
                    </Descriptions.Item>
                    <Descriptions.Item label="Precio">
                      <Text strong className="text-lg">
                        Bs. {getServicioInfo(selectedCita.servicioId)?.precio.toFixed(2) || '0.00'}
                      </Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Modal detalle de Venta */}
      <Modal
        title={<div className="flex items-center gap-2"><DollarSign size={20} /> Detalle de Venta</div>}
        open={!!selectedVenta}
        onCancel={() => setSelectedVenta(null)}
        footer={[<Button key="close" type="primary" onClick={() => setSelectedVenta(null)}>Cerrar</Button>]}
        width={700}
      >
        {selectedVenta && (
          <div className="space-y-6">
            {loadingClienteVenta ? (
              <div className="flex justify-center py-8"><Spin size="large" /></div>
            ) : (
              <>
                {/* Info del Cliente */}
                <Card title={<div className="flex items-center gap-2"><User size={18} /> Cliente</div>} size="small">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Nombre">
                      <Text strong>{clienteVenta?.nombre || 'N/A'}</Text>
                    </Descriptions.Item>
                    {clienteVenta?.email && (
                      <Descriptions.Item label={<span className="flex items-center gap-2"><Mail size={14} /> Email</span>}>
                        {clienteVenta.email}
                      </Descriptions.Item>
                    )}
                    {clienteVenta?.telefono && (
                      <Descriptions.Item label={<span className="flex items-center gap-2"><Phone size={14} /> Teléfono</span>}>
                        {clienteVenta.telefono}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>

                {/* Info de la Venta */}
                <Card title={<div className="flex items-center gap-2"><CreditCard size={18} /> Detalles de la Venta</div>} size="small">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="ID">
                      <Tag color="blue">#{selectedVenta.id}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Fecha">
                      {dayjs(selectedVenta.fecha).format('DD/MM/YYYY HH:mm')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Método de Pago">
                      <Tag color="green">{selectedVenta.metodoPago}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Total">
                      <Text strong className="text-lg">Bs. {selectedVenta.total.toFixed(2)}</Text>
                    </Descriptions.Item>
                    {selectedVenta.qrCode && (
                      <Descriptions.Item label="Código QR">
                        <code className="bg-gray-100 px-2 py-1 rounded">{selectedVenta.qrCode}</code>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
