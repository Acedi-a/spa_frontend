import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmpleadas, createEmpleada, updateEmpleada, deleteEmpleada } from '../api/empleadas';
import type { Empleada } from '../types/empleada';
import { 
  Table, Button, Input, Space, Typography, Card, Alert, Modal, Form, DatePicker, InputNumber, Dropdown, Tag, message
} from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Search, Plus, MoreVertical, Edit, Trash2, UserCheck, Mail, Download } from 'lucide-react';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const EmpleadasPage = () => {
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmpleada, setEditingEmpleada] = useState<Empleada | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  
  const { data: empleadas, isLoading, isError } = useQuery({
    queryKey: ['empleadas'],
    queryFn: getEmpleadas,
  });

  const createMutation = useMutation({
    mutationFn: createEmpleada,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empleadas'] });
      message.success('Empleada registrada exitosamente');
      handleCloseModal();
    },
    onError: () => message.error('Error al crear empleada'),
  });

  const updateMutation = useMutation({
    mutationFn: updateEmpleada,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empleadas'] });
      message.success('Empleada actualizada exitosamente');
      handleCloseModal();
    },
    onError: () => message.error('Error al actualizar empleada'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEmpleada,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empleadas'] });
      message.success('Empleada eliminada exitosamente');
    },
    onError: () => message.error('Error al eliminar empleada'),
  });

  const handleOpenModal = (empleada?: Empleada) => {
    if (empleada) {
      setEditingEmpleada(empleada);
      form.setFieldsValue({
        ...empleada,
        fechaContratacion: dayjs(empleada.fechaContratacion),
      });
    } else {
      setEditingEmpleada(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmpleada(null);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    const data = {
      ...values,
      fechaContratacion: values.fechaContratacion.format('YYYY-MM-DD'),
    };

    if (editingEmpleada) {
      updateMutation.mutate({ ...data, id: editingEmpleada.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '¿Eliminar empleada?',
      content: 'Esta acción no se puede deshacer.',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const empleadasArray = Array.isArray(empleadas) ? empleadas : [];
  const filteredEmpleadas = empleadasArray.filter(emp => 
    emp.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchText.toLowerCase()) ||
    emp.especialidad?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<Empleada> = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (text) => (
        <div className="flex items-center gap-2">
          <UserCheck size={18} className="text-blue-500" />
          <Text strong>{text}</Text>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-slate-400" />
          <span>{email}</span>
        </div>
      ),
    },
    {
      title: 'Especialidad',
      dataIndex: 'especialidad',
      key: 'especialidad',
      render: (esp) => esp ? <Tag color="purple">{esp}</Tag> : <Text type="secondary" italic>Sin especialidad</Text>,
    },
    {
      title: 'Comisión',
      dataIndex: 'porcentajeComision',
      key: 'porcentajeComision',
      render: (comision) => <Tag color="green">{comision}%</Tag>,
    },
    {
      title: 'Fecha Contratación',
      dataIndex: 'fechaContratacion',
      key: 'fechaContratacion',
      render: (fecha) => dayjs(fecha).format('DD/MM/YYYY'),
      sorter: (a, b) => dayjs(a.fechaContratacion).unix() - dayjs(b.fechaContratacion).unix(),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => {
        const items: MenuProps['items'] = [
          { key: 'edit', label: 'Editar', icon: <Edit size={16} />, onClick: () => handleOpenModal(record) },
          { key: 'delete', label: 'Eliminar', icon: <Trash2 size={16} />, danger: true, onClick: () => handleDelete(record.id) },
        ];
        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text" shape="circle" icon={<MoreVertical size={18} />} />
          </Dropdown>
        );
      },
    },
  ];

  if (isError) return <Alert message="Error" description="No se pudieron cargar las empleadas." type="error" showIcon />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Title level={2} style={{ margin: 0 }}>Empleadas</Title>
          <Text type="secondary">Gestión del personal y sus datos.</Text>
        </div>
        <Space>
          <Button icon={<Download size={18} />}>Exportar</Button>
          <Button type="primary" icon={<Plus size={18} />} onClick={() => handleOpenModal()}>Nueva Empleada</Button>
        </Space>
      </div>

      <Card bordered={false} className="shadow-sm rounded-2xl">
        <Input
          placeholder="Buscar por nombre, email o especialidad..."
          prefix={<Search size={18} className="text-slate-400" />}
          size="large"
          onChange={(e) => setSearchText(e.target.value)}
        />
      </Card>

      <Card bordered={false} className="shadow-md rounded-2xl" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredEmpleadas}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} empleadas` }}
        />
      </Card>

      <Modal
        title={editingEmpleada ? 'Editar Empleada' : 'Nueva Empleada'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-6">
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: 'Ingrese el nombre' }]}>
            <Input placeholder="Nombre completo" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Ingrese un email válido' }]}>
            <Input placeholder="correo@ejemplo.com" />
          </Form.Item>
          <Form.Item name="fechaContratacion" label="Fecha de Contratación" rules={[{ required: true }]}>
            <DatePicker format="DD/MM/YYYY" placeholder="Seleccione fecha" className="w-full" />
          </Form.Item>
          <Form.Item name="porcentajeComision" label="Porcentaje de Comisión (%)" rules={[{ required: true, type: 'number', min: 0, max: 100 }]}>
            <InputNumber min={0} max={100} placeholder="0-100" className="w-full" />
          </Form.Item>
          <Form.Item name="especialidad" label="Especialidad">
            <Input placeholder="Especialidad (opcional)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
