import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCitas, createCita, getCitasByEmpleada } from '../api/citas';
import { getClientes } from '../api/clientes';
import { getEmpleadas } from '../api/empleadas';
import { getServicios } from '../api/servicios';
import { createVenta } from '../api/ventas';
import type { Cita } from '../types/cita';
import { 
  Table, Button, Input, Space, Typography, Card, Alert, Modal, Form, Select, DatePicker, TimePicker, Tag, message, Dropdown
} from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  Search, Plus, Calendar as CalendarIcon, Clock, User, Download, CheckCircle, MoreVertical
} from 'lucide-react';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const CitasPage = () => {
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpleada, setSelectedEmpleada] = useState<number | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  
  const { data: citas, isLoading, isError } = useQuery({
    queryKey: ['citas', selectedEmpleada],
    queryFn: () => selectedEmpleada ? getCitasByEmpleada(selectedEmpleada) : getCitas(),
  });

  const { data: clientes } = useQuery({ queryKey: ['clientes'], queryFn: getClientes });
  const { data: empleadas } = useQuery({ queryKey: ['empleadas'], queryFn: getEmpleadas });
  const { data: servicios } = useQuery({ queryKey: ['servicios'], queryFn: getServicios });

  const createMutation = useMutation({
    mutationFn: createCita,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citas'] });
      message.success('Cita creada exitosamente');
      handleCloseModal();
    },
    onError: () => {
      message.error('Error al crear la cita');
    },
  });

  const completarCitaMutation = useMutation({
    mutationFn: createVenta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citas'] });
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      message.success('Cita completada y venta registrada exitosamente');
    },
    onError: () => {
      message.error('Error al completar la cita');
    },
  });

  const handleOpenModal = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    const horaFormateada = values.hora.format('HH:mm:ss');
    const citaData = {
      clienteId: values.clienteId,
      empleadaId: values.empleadaId,
      servicioId: values.servicioId,
      fecha: values.fecha.format('YYYY-MM-DD'),
      hora: horaFormateada,
      horaInicio: horaFormateada,
      horaFin: horaFormateada,
    };
    console.log('Enviando cita:', citaData); // Para debug
    createMutation.mutate(citaData);
  };

  const handleCompletarCita = (cita: Cita) => {
    const servicio = getServicioInfo(cita.servicioId);
    if (!servicio) {
      message.error('No se pudo obtener información del servicio');
      return;
    }

    Modal.confirm({
      title: '¿Completar cita y registrar venta?',
      content: `Se creará una venta por el servicio "${servicio.nombre}" con un monto de Bs. ${servicio.precio.toFixed(2)}`,
      okText: 'Completar',
      cancelText: 'Cancelar',
      onOk: () => {
        const ventaData = {
          clienteId: cita.clienteId,
          fecha: dayjs().format('YYYY-MM-DD'),
          metodoPago: 'Efectivo',
          total: servicio.precio,
          detalleVentas: [{
            servicioId: cita.servicioId,
            cantidad: 1,
            precioUnitario: servicio.precio,
          }],
        };
        completarCitaMutation.mutate(ventaData);
      },
    });
  };

  const citasArray = Array.isArray(citas) ? citas : [];
  
  // Función helper para buscar datos relacionados
  const getClienteNombre = (clienteId: string) => {
    const cliente = clientes?.find(c => c.id === clienteId);
    return cliente?.nombre || 'N/A';
  };
  
  const getEmpleadaNombre = (empleadaId: number) => {
    const empleada = empleadas?.find(e => e.id === empleadaId);
    return empleada?.nombre || 'N/A';
  };
  
  const getServicioInfo = (servicioId: number) => {
    const servicio = servicios?.find(s => s.id === servicioId);
    return servicio || null;
  };
  
  const filteredCitas = citasArray.filter(cita => {
    const clienteNombre = getClienteNombre(cita.clienteId);
    const empleadaNombre = getEmpleadaNombre(cita.empleadaId);
    const servicioInfo = getServicioInfo(cita.servicioId);
    const searchLower = searchText.toLowerCase();
    
    return clienteNombre.toLowerCase().includes(searchLower) ||
           empleadaNombre.toLowerCase().includes(searchLower) ||
           servicioInfo?.nombre.toLowerCase().includes(searchLower) ||
           false;
  });

  const columns: ColumnsType<Cita> = [
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      render: (fecha) => (
        <div className="flex items-center gap-2">
          <CalendarIcon size={16} className="text-blue-500" />
          <span>{dayjs(fecha).format('DD/MM/YYYY')}</span>
        </div>
      ),
      sorter: (a, b) => dayjs(a.fecha).unix() - dayjs(b.fecha).unix(),
    },
    {
      title: 'Hora',
      dataIndex: 'hora',
      key: 'hora',
      render: (hora) => (
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-slate-400" />
          <span>{hora.slice(0, 5)}</span>
        </div>
      ),
    },
    {
      title: 'Cliente',
      key: 'cliente',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <User size={16} className="text-slate-400" />
          <span>{getClienteNombre(record.clienteId)}</span>
        </div>
      ),
    },
    {
      title: 'Empleada',
      key: 'empleada',
      render: (_, record) => getEmpleadaNombre(record.empleadaId),
    },
    {
      title: 'Servicio',
      key: 'servicio',
      render: (_, record) => getServicioInfo(record.servicioId)?.nombre || 'N/A',
    },
    {
      title: 'Duración',
      key: 'duracion',
      render: (_, record) => {
        const servicio = getServicioInfo(record.servicioId);
        return servicio ? `${servicio.duracion} min` : 'N/A';
      },
    },
    {
      title: 'Estado',
      key: 'estado',
      render: (_, record) => {
        const fechaCita = dayjs(`${record.fecha} ${record.hora}`);
        const ahora = dayjs();
        
        if (fechaCita.isBefore(ahora)) {
          return <Tag color="default">Completada</Tag>;
        } else if (fechaCita.diff(ahora, 'hours') < 2) {
          return <Tag color="orange">Próxima</Tag>;
        }
        return <Tag color="green">Programada</Tag>;
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => {
        const items: MenuProps['items'] = [
          {
            key: 'completar',
            label: 'Completar Cita',
            icon: <CheckCircle size={16} />,
            onClick: () => handleCompletarCita(record),
          },
        ];
        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button icon={<MoreVertical size={16} />} />
          </Dropdown>
        );
      },
    },
  ];

  if (isError) {
    return (
      <Alert message="Error" description="No se pudieron cargar las citas." type="error" showIcon />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Title level={2} style={{ margin: 0 }}>Citas</Title>
          <Text type="secondary">Gestión de citas y agenda de servicios.</Text>
        </div>
        <Space>
          <Button icon={<Download size={18} />}>Exportar</Button>
          <Button type="primary" icon={<Plus size={18} />} onClick={handleOpenModal}>
            Nueva Cita
          </Button>
        </Space>
      </div>

      <Card bordered={false} className="shadow-sm rounded-2xl">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Input
            placeholder="Buscar por cliente, empleada o servicio..."
            prefix={<Search size={18} className="text-slate-400" />}
            className="w-full sm:w-96"
            size="large"
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="Filtrar por empleada"
            className="w-full sm:w-64"
            size="large"
            allowClear
            onChange={(value) => setSelectedEmpleada(value)}
          >
            {Array.isArray(empleadas) && empleadas.map(emp => (
              <Select.Option key={emp.id} value={emp.id}>{emp.nombre}</Select.Option>
            ))}
          </Select>
        </div>
      </Card>

      <Card bordered={false} className="shadow-md rounded-2xl" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredCitas}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} citas` }}
        />
      </Card>

      <Modal
        title="Nueva Cita"
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-6">
          <Form.Item name="clienteId" label="Cliente" rules={[{ required: true, message: 'Seleccione un cliente' }]}>
            <Select placeholder="Seleccione cliente" showSearch optionFilterProp="children">
              {Array.isArray(clientes) && clientes.map(c => (
                <Select.Option key={c.id} value={c.id}>{c.nombre}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="empleadaId" label="Empleada" rules={[{ required: true }]}>
            <Select placeholder="Seleccione empleada">
              {Array.isArray(empleadas) && empleadas.map(e => (
                <Select.Option key={e.id} value={e.id}>{e.nombre}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="servicioId" label="Servicio" rules={[{ required: true }]}>
            <Select placeholder="Seleccione servicio">
              {Array.isArray(servicios) && servicios.map(s => (
                <Select.Option key={s.id} value={s.id}>{s.nombre} - {s.duracion} min</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Space.Compact style={{ width: '100%' }}>
            <Form.Item name="fecha" label="Fecha" rules={[{ required: true }]} style={{ flex: 1, marginRight: 8 }}>
              <DatePicker format="DD/MM/YYYY" placeholder="Fecha" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="hora" label="Hora" rules={[{ required: true }]} style={{ flex: 1 }}>
              <TimePicker format="HH:mm" placeholder="Hora" style={{ width: '100%' }} />
            </Form.Item>
          </Space.Compact>
        </Form>
      </Modal>
    </div>
  );
};
