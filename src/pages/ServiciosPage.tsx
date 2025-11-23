import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getServicios, createServicio, updateServicio, deleteServicio } from '../api/servicios';
import { getCategorias } from '../api/categorias';
import { getEmpleadas } from '../api/empleadas';
import type { Servicio } from '../types/servicio';
import { Table, Button, Input, Space, Typography, Card, Alert, Modal, Form, Select, InputNumber, Dropdown, Tag, message } from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Search, Plus, MoreVertical, Edit, Trash2, Scissors, Download } from 'lucide-react';

const { Title, Text } = Typography;

export const ServiciosPage = () => {
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  
  const { data: servicios, isLoading, isError } = useQuery({ queryKey: ['servicios'], queryFn: getServicios });
  const { data: categorias } = useQuery({ queryKey: ['categorias'], queryFn: getCategorias });
  const { data: empleadas } = useQuery({ queryKey: ['empleadas'], queryFn: getEmpleadas });

  const createMutation = useMutation({
    mutationFn: createServicio,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['servicios'] }); message.success('Servicio creado'); handleCloseModal(); },
    onError: () => message.error('Error'),
  });

  const updateMutation = useMutation({
    mutationFn: updateServicio,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['servicios'] }); message.success('Servicio actualizado'); handleCloseModal(); },
    onError: () => message.error('Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteServicio,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['servicios'] }); message.success('Servicio eliminado'); },
    onError: () => message.error('Error'),
  });

  const handleOpenModal = (servicio?: Servicio) => {
    if (servicio) {
      setEditingServicio(servicio);
      form.setFieldsValue(servicio);
    } else {
      setEditingServicio(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingServicio(null); form.resetFields(); };

  const handleSubmit = async (values: any) => {
    if (editingServicio) {
      updateMutation.mutate({ ...values, id: editingServicio.id });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({ title: '¿Eliminar servicio?', okText: 'Eliminar', okType: 'danger', cancelText: 'Cancelar', onOk: () => deleteMutation.mutate(id) });
  };

  const serviciosArray = Array.isArray(servicios) ? servicios : [];
  const filteredServicios = serviciosArray.filter(s => s.nombre.toLowerCase().includes(searchText.toLowerCase()));

  const columns: ColumnsType<Servicio> = [
    { title: 'Servicio', dataIndex: 'nombre', key: 'nombre', render: (text) => (<div className="flex items-center gap-2"><Scissors size={18} className="text-purple-500" /><Text strong>{text}</Text></div>) },
    { title: 'Categoría', key: 'categoria', render: (_, record) => <Tag color="blue">{record.categoria?.nombre || 'N/A'}</Tag> },
    { title: 'Precio', dataIndex: 'precio', key: 'precio', render: (precio) => `Bs. ${precio.toFixed(2)}`, sorter: (a, b) => a.precio - b.precio },
    { title: 'Duración', dataIndex: 'duracion', key: 'duracion', render: (d) => `${d} min` },
    { title: 'Empleada', key: 'empleada', render: (_, record) => record.empleada?.nombre || 'N/A' },
    {
      title: 'Acciones', key: 'acciones', render: (_, record) => {
        const items: MenuProps['items'] = [
          { key: 'edit', label: 'Editar', icon: <Edit size={16} />, onClick: () => handleOpenModal(record) },
          { key: 'delete', label: 'Eliminar', icon: <Trash2 size={16} />, danger: true, onClick: () => handleDelete(record.id) },
        ];
        return <Dropdown menu={{ items }} trigger={['click']}><Button type="text" shape="circle" icon={<MoreVertical size={18} />} /></Dropdown>;
      },
    },
  ];

  if (isError) return <Alert message="Error" type="error" showIcon />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><Title level={2} style={{ margin: 0 }}>Servicios</Title><Text type="secondary">Gestión de servicios ofrecidos.</Text></div>
        <Space><Button icon={<Download size={18} />}>Exportar</Button><Button type="primary" icon={<Plus size={18} />} onClick={() => handleOpenModal()}>Nuevo Servicio</Button></Space>
      </div>
      <Card bordered={false} className="shadow-sm rounded-2xl"><Input placeholder="Buscar servicios..." prefix={<Search size={18} className="text-slate-400" />} size="large" onChange={(e) => setSearchText(e.target.value)} /></Card>
      <Card bordered={false} className="shadow-md rounded-2xl" bodyStyle={{ padding: 0 }}><Table columns={columns} dataSource={filteredServicios} rowKey="id" loading={isLoading} pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} servicios` }} /></Card>
      <Modal title={editingServicio ? 'Editar Servicio' : 'Nuevo Servicio'} open={isModalOpen} onCancel={handleCloseModal} onOk={() => form.submit()} confirmLoading={createMutation.isPending || updateMutation.isPending} width={600}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-6">
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}><Input placeholder="Nombre del servicio" /></Form.Item>
          <Form.Item name="categoriaId" label="Categoría" rules={[{ required: true }]}><Select placeholder="Seleccione categoría">{Array.isArray(categorias) && categorias.map(c => <Select.Option key={c.id} value={c.id}>{c.nombre}</Select.Option>)}</Select></Form.Item>
          <Form.Item name="empleadaId" label="Empleada" rules={[{ required: true }]}><Select placeholder="Seleccione empleada">{Array.isArray(empleadas) && empleadas.map(e => <Select.Option key={e.id} value={e.id}>{e.nombre}</Select.Option>)}</Select></Form.Item>
          <Form.Item name="precio" label="Precio (Bs.)" rules={[{ required: true, type: 'number', min: 0.01 }]}><InputNumber min={0.01} step={0.01} placeholder="0.00" className="w-full" /></Form.Item>
          <Form.Item name="duracion" label="Duración (minutos)" rules={[{ required: true, type: 'number', min: 1 }]}><InputNumber min={1} placeholder="Duración" className="w-full" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
