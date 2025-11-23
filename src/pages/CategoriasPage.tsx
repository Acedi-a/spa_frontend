import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '../api/categorias';
import type { Categoria } from '../types/categoria';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Typography, 
  Card,
  Alert,
  Modal,
  Form,
  Dropdown,
  message
} from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Filter,
  Download,
  Edit,
  Trash2,
  FolderOpen
} from 'lucide-react';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const CategoriasPage = () => {
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  
  const { data: categorias, isLoading, isError } = useQuery({
    queryKey: ['categorias'],
    queryFn: getCategorias,
  });

  // Mutación para crear categoría
  const createMutation = useMutation({
    mutationFn: createCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      message.success('Categoría creada exitosamente');
      handleCloseModal();
    },
    onError: () => {
      message.error('Error al crear la categoría');
    },
  });

  // Mutación para actualizar categoría
  const updateMutation = useMutation({
    mutationFn: updateCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      message.success('Categoría actualizada exitosamente');
      handleCloseModal();
    },
    onError: () => {
      message.error('Error al actualizar la categoría');
    },
  });

  // Mutación para eliminar categoría
  const deleteMutation = useMutation({
    mutationFn: deleteCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      message.success('Categoría eliminada exitosamente');
    },
    onError: () => {
      message.error('Error al eliminar la categoría');
    },
  });

  const handleOpenModal = (categoria?: Categoria) => {
    if (categoria) {
      setEditingCategoria(categoria);
      form.setFieldsValue(categoria);
    } else {
      setEditingCategoria(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategoria(null);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    if (editingCategoria) {
      updateMutation.mutate({ ...values, id: editingCategoria.id });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar esta categoría?',
      content: 'Esta acción no se puede deshacer.',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: () => deleteMutation.mutate(id),
    });
  };

  // Filtrado simple en el cliente
  const categoriasArray = Array.isArray(categorias) ? categorias : [];
  const filteredCategorias = categoriasArray.filter(categoria => 
    categoria.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
    categoria.descripcion?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<Categoria> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Categoría',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (text) => (
        <div className="flex items-center gap-2">
          <FolderOpen size={18} className="text-blue-500" />
          <Text strong>{text}</Text>
        </div>
      ),
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      render: (descripcion) => (
        descripcion ? (
          <Text type="secondary">{descripcion}</Text>
        ) : (
          <Text type="secondary" italic>Sin descripción</Text>
        )
      ),
    },
    {
      title: 'Estado',
      key: 'estado',
      width: 100,
      render: () => (
        <Tag color="green">Activa</Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 80,
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
          description="Hubo un problema al cargar la lista de categorías. Por favor intente nuevamente."
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
          <Title level={2} style={{ margin: 0 }}>Categorías</Title>
          <Text type="secondary">Gestiona las categorías de productos y servicios.</Text>
        </div>
        <Space>
          <Button icon={<Download size={18} />}>
            Exportar
          </Button>
          <Button type="primary" icon={<Plus size={18} />} onClick={() => handleOpenModal()}>
            Nueva Categoría
          </Button>
        </Space>
      </div>

      {/* Filters & Search Bar */}
      <Card bordered={false} className="shadow-sm rounded-2xl">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Input
            placeholder="Buscar por nombre o descripción..."
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
          dataSource={filteredCategorias}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} categorías`,
            showSizeChanger: true,
          }}
          scroll={{ x: true }}
        />
      </Card>

      {/* Modal para crear/editar categoría */}
      <Modal
        title={editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
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
            rules={[
              { required: true, message: 'Por favor ingrese el nombre' },
              { min: 3, message: 'El nombre debe tener al menos 3 caracteres' },
              { max: 100, message: 'El nombre no puede exceder 100 caracteres' }
            ]}
          >
            <Input placeholder="Nombre de la categoría" />
          </Form.Item>

          <Form.Item
            label="Descripción"
            name="descripcion"
            rules={[
              { max: 500, message: 'La descripción no puede exceder 500 caracteres' }
            ]}
          >
            <TextArea 
              placeholder="Descripción de la categoría..."
              rows={4}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
