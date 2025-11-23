import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProductos, createProducto, updateProducto, deleteProducto } from '../api/productos';
import { getCategorias } from '../api/categorias';
import type { Producto } from '../types/producto';
import { 
  Table, Button, Input, Space, Typography, Card, Alert, Modal, Form, Select, InputNumber, DatePicker, Dropdown, Tag, message
} from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Search, Plus, MoreVertical, Edit, Trash2, Package, AlertTriangle, Download } from 'lucide-react';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const ProductosPage = () => {
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  
  const { data: productos, isLoading, isError } = useQuery({ queryKey: ['productos'], queryFn: getProductos });
  const { data: categorias } = useQuery({ queryKey: ['categorias'], queryFn: getCategorias });

  const createMutation = useMutation({
    mutationFn: createProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      message.success('Producto creado');
      handleCloseModal();
    },
    onError: () => message.error('Error al crear producto'),
  });

  const updateMutation = useMutation({
    mutationFn: updateProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      message.success('Producto actualizado');
      handleCloseModal();
    },
    onError: () => message.error('Error al actualizar producto'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      message.success('Producto eliminado');
    },
    onError: () => message.error('Error al eliminar producto'),
  });

  const handleOpenModal = (producto?: Producto) => {
    if (producto) {
      setEditingProducto(producto);
      form.setFieldsValue({ ...producto, fechaVencimiento: dayjs(producto.fechaVencimiento) });
    } else {
      setEditingProducto(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProducto(null);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    const data = { ...values, fechaVencimiento: values.fechaVencimiento.format('YYYY-MM-DD') };
    if (editingProducto) {
      updateMutation.mutate({ ...data, id: editingProducto.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '¿Eliminar producto?',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const productosArray = Array.isArray(productos) ? productos : [];
  const filteredProductos = productosArray.filter(p => 
    p.nombre.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<Producto> = [
    {
      title: 'Producto',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (text) => (
        <div className="flex items-center gap-2">
          <Package size={18} className="text-blue-500" />
          <Text strong>{text}</Text>
        </div>
      ),
    },
    {
      title: 'Categoría',
      key: 'categoria',
      render: (_, record) => <Tag color="blue">{record.categoria?.nombre || 'N/A'}</Tag>,
    },
    {
      title: 'Precio',
      dataIndex: 'precio',
      key: 'precio',
      render: (precio) => `Bs. ${precio.toFixed(2)}`,
      sorter: (a, b) => a.precio - b.precio,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock, record) => (
        <Space>
          <span>{stock}</span>
          {stock <= record.stockMinimo && <AlertTriangle size={16} className="text-red-500" />}
        </Space>
      ),
    },
    {
      title: 'Stock Mínimo',
      dataIndex: 'stockMinimo',
      key: 'stockMinimo',
    },
    {
      title: 'Vencimiento',
      dataIndex: 'fechaVencimiento',
      key: 'fechaVencimiento',
      render: (fecha) => dayjs(fecha).format('DD/MM/YYYY'),
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

  if (isError) return <Alert message="Error" type="error" showIcon />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Title level={2} style={{ margin: 0 }}>Productos</Title>
          <Text type="secondary">Gestión de inventario y productos.</Text>
        </div>
        <Space>
          <Button icon={<Download size={18} />}>Exportar</Button>
          <Button type="primary" icon={<Plus size={18} />} onClick={() => handleOpenModal()}>Nuevo Producto</Button>
        </Space>
      </div>

      <Card bordered={false} className="shadow-sm rounded-2xl">
        <Input
          placeholder="Buscar productos..."
          prefix={<Search size={18} className="text-slate-400" />}
          size="large"
          onChange={(e) => setSearchText(e.target.value)}
        />
      </Card>

      <Card bordered={false} className="shadow-md rounded-2xl" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredProductos}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} productos` }}
        />
      </Card>

      <Modal
        title={editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-6">
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input placeholder="Nombre del producto" />
          </Form.Item>
          <Form.Item name="categoriaId" label="Categoría" rules={[{ required: true }]}>
            <Select placeholder="Seleccione categoría">
              {Array.isArray(categorias) && categorias.map(c => <Select.Option key={c.id} value={c.id}>{c.nombre}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="precio" label="Precio (Bs.)" rules={[{ required: true, type: 'number', min: 0.01 }]}>
            <InputNumber min={0.01} step={0.01} placeholder="0.00" className="w-full" />
          </Form.Item>
          <Form.Item name="stock" label="Stock" rules={[{ required: true, type: 'number', min: 0 }]}>
            <InputNumber min={0} placeholder="Cantidad" className="w-full" />
          </Form.Item>
          <Form.Item name="stockMinimo" label="Stock Mínimo" rules={[{ required: true, type: 'number', min: 0 }]}>
            <InputNumber min={0} placeholder="Cantidad mínima" className="w-full" />
          </Form.Item>
          <Form.Item name="fechaVencimiento" label="Fecha de Vencimiento" rules={[{ required: true }]}>
            <DatePicker format="DD/MM/YYYY" placeholder="Seleccione fecha" className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
