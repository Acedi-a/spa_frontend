import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClientes, createCliente, updateCliente, deleteCliente } from '../api/clientes';
import type { Cliente, CreateClienteDto } from '../types/cliente';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Avatar, 
  Tag, 
  Typography, 
  Card,
  Alert,
  Modal,
  Form,
  DatePicker,
  Dropdown,
  message
} from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Mail, 
  Phone, 
  Calendar,
  Filter,
  Download,
  Edit,
  Trash2
} from 'lucide-react';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const ClientesPage = () => {
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  
  const { data: clientes, isLoading, isError } = useQuery({
    queryKey: ['clientes'],
    queryFn: getClientes,
  });

  // Mutación para crear cliente
  const createMutation = useMutation({
    mutationFn: createCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      message.success('Cliente creado exitosamente');
      handleCloseModal();
    },
    onError: () => {
      message.error('Error al crear el cliente');
    },
  });

  // Mutación para actualizar cliente
  const updateMutation = useMutation({
    mutationFn: updateCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      message.success('Cliente actualizado exitosamente');
      handleCloseModal();
    },
    onError: () => {
      message.error('Error al actualizar el cliente');
    },
  });

  // Mutación para eliminar cliente
  const deleteMutation = useMutation({
    mutationFn: deleteCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      message.success('Cliente eliminado exitosamente');
    },
    onError: () => {
      message.error('Error al eliminar el cliente');
    },
  });

  const handleOpenModal = (cliente?: Cliente) => {
    if (cliente) {
      setEditingCliente(cliente);
      form.setFieldsValue({
        ...cliente,
        fechaNacimiento: dayjs(cliente.fechaNacimiento),
      });
    } else {
      setEditingCliente(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCliente(null);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    const clienteData = {
      ...values,
      fechaNacimiento: values.fechaNacimiento.format('YYYY-MM-DD'),
    };

    if (editingCliente) {
      updateMutation.mutate({ ...clienteData, id: editingCliente.id });
    } else {
      createMutation.mutate(clienteData);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar este cliente?',
      content: 'Esta acción no se puede deshacer.',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: () => deleteMutation.mutate(id),
    });
  };

  // Filtrado simple en el cliente (idealmente sería en backend)
  const clientesArray = Array.isArray(clientes) ? clientes : [];
  const filteredClientes = clientesArray.filter(cliente => 
    cliente.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(searchText.toLowerCase()) ||
    cliente.telefono?.includes(searchText)
  );

  const columns: ColumnsType<Cliente> = [
    {
      title: 'Cliente',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar 
            size={40} 
            style={{ backgroundColor: '#e6f7ff', color: '#1890ff', border: '1px solid #91d5ff' }}
          >
            {record.nombre.charAt(0).toUpperCase()}
          </Avatar>
          <div className="flex flex-col">
            <Text strong>{text}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>ID: {record.id.slice(0, 8)}...</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Contacto',
      key: 'contacto',
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          {record.email && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail size={14} className="text-slate-400" />
              <span>{record.email}</span>
            </div>
          )}
          {record.telefono && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone size={14} className="text-slate-400" />
              <span>{record.telefono}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Fecha Registro',
      dataIndex: 'fechaRegistro',
      key: 'fechaRegistro',
      render: (date) => (
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar size={14} className="text-slate-400" />
          <span>{dayjs(date).format('DD MMM, YYYY')}</span>
        </div>
      ),
      sorter: (a, b) => dayjs(a.fechaRegistro).unix() - dayjs(b.fechaRegistro).unix(),
    },
    {
      title: 'Preferencias',
      dataIndex: 'preferencias',
      key: 'preferencias',
      render: (pref) => (
        pref ? (
          <Tag color="blue">{pref}</Tag>
        ) : (
          <Text type="secondary" italic>Sin preferencias</Text>
        )
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'edit',
            label: 'Editar',
            icon: <Edit size={16} />,
            onClick: () => handleOpenModal(record),
          },
          {
            key: 'delete',
            label: 'Eliminar',
            icon: <Trash2 size={16} />,
            danger: true,
            onClick: () => handleDelete(record.id),
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" shape="circle" icon={<MoreVertical size={18} />} />
          </Dropdown>
        );
      },
    },
  ];

  if (isError) {
    return (
      <div className="p-6">
        <Alert
          message="Error"
          description="Hubo un problema al cargar la lista de clientes. Por favor intente nuevamente."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Title level={2} style={{ margin: 0 }}>Clientes</Title>
          <Text type="secondary">Gestiona tu base de datos de clientes y contactos.</Text>
        </div>
        <Space>
          <Button icon={<Download size={18} />}>
            Exportar
          </Button>
          <Button type="primary" icon={<Plus size={18} />} onClick={() => handleOpenModal()}>
            Nuevo Cliente
          </Button>
        </Space>
      </div>

      {/* Filters & Search Bar */}
      <Card bordered={false} className="shadow-sm rounded-2xl">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Input
            placeholder="Buscar por nombre, email o teléfono..."
            prefix={<Search size={18} className="text-slate-400" />}
            className="w-full sm:w-96 rounded-lg"
            size="large"
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button icon={<Filter size={18} />} size="large">
            Filtros
          </Button>
        </div>
      </Card>

      {/* Table Section */}
      <Card bordered={false} className="shadow-md rounded-2xl overflow-hidden" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredClientes}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} clientes`,
            showSizeChanger: true,
          }}
          scroll={{ x: true }}
        />
      </Card>

      {/* Modal para crear/editar cliente */}
      <Modal
        title={editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-6"
        >
          <Form.Item
            label="Nombre"
            name="nombre"
            rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
          >
            <Input placeholder="Nombre completo" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ type: 'email', message: 'Ingrese un email válido' }]}
          >
            <Input placeholder="correo@ejemplo.com" />
          </Form.Item>

          <Form.Item
            label="Teléfono"
            name="telefono"
          >
            <Input placeholder="+591 12345678" />
          </Form.Item>

          <Form.Item
            label="Fecha de Nacimiento"
            name="fechaNacimiento"
            rules={[{ required: true, message: 'Por favor seleccione la fecha de nacimiento' }]}
          >
            <DatePicker 
              format="DD/MM/YYYY" 
              placeholder="Seleccione fecha"
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            label="Preferencias"
            name="preferencias"
          >
            <Input.TextArea 
              placeholder="Preferencias del cliente..."
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
