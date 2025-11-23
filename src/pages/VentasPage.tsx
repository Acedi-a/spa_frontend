import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVentas, createVenta, getVentasByCliente } from '../api/ventas';
import { getClientes, getClienteById } from '../api/clientes';
import { getProductos } from '../api/productos';
import { getServicios } from '../api/servicios';
import type { Venta } from '../types/venta';
import type { Cliente } from '../types/cliente';
import { Table, Button, Input, Space, Typography, Card, Alert, Modal, Form, Select, InputNumber, DatePicker, Tag, message, Descriptions, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Search, Plus, ShoppingCart, Eye, Download, User, Phone, Mail, Calendar, CreditCard } from 'lucide-react';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const VentasPage = () => {
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  
  const { data: ventas, isLoading, isError } = useQuery({ queryKey: ['ventas'], queryFn: getVentas });
  const { data: clientes } = useQuery({ queryKey: ['clientes'], queryFn: getClientes });
  const { data: productos } = useQuery({ queryKey: ['productos'], queryFn: getProductos });
  const { data: servicios } = useQuery({ queryKey: ['servicios'], queryFn: getServicios });
  
  // Query para obtener datos del cliente cuando se abre el detalle
  const { data: clienteDetalle, isLoading: loadingCliente } = useQuery({
    queryKey: ['cliente', selectedVenta?.clienteId],
    queryFn: () => selectedVenta ? getClienteById(selectedVenta.clienteId) : null,
    enabled: !!selectedVenta,
  });

  const createMutation = useMutation({
    mutationFn: createVenta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      message.success('Venta registrada');
      handleCloseModal();
    },
    onError: () => message.error('Error al registrar venta'),
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
    const ventaData = {
      ...values,
      fecha: values.fecha.format('YYYY-MM-DD'),
    };
    createMutation.mutate(ventaData);
  };

  const handleViewDetalle = (venta: Venta) => {
    setSelectedVenta(venta);
  };

  // Helper para obtener nombre del cliente
  const getClienteNombre = (clienteId: string) => {
    const cliente = Array.isArray(clientes) ? clientes.find(c => c.id === clienteId) : null;
    return cliente?.nombre || 'N/A';
  };

  const ventasArray = Array.isArray(ventas) ? ventas : [];
  const filteredVentas = ventasArray.filter(v => {
    const clienteNombre = getClienteNombre(v.clienteId);
    return clienteNombre.toLowerCase().includes(searchText.toLowerCase()) ||
           v.metodoPago.toLowerCase().includes(searchText.toLowerCase());
  });

  const columns: ColumnsType<Venta> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: 'Fecha', dataIndex: 'fecha', key: 'fecha', render: (fecha) => dayjs(fecha).format('DD/MM/YYYY'), sorter: (a, b) => dayjs(a.fecha).unix() - dayjs(b.fecha).unix() },
    { title: 'Cliente', key: 'cliente', render: (_, record) => getClienteNombre(record.clienteId) },
    { title: 'Método de Pago', dataIndex: 'metodoPago', key: 'metodoPago', render: (metodo) => <Tag color="blue">{metodo}</Tag> },
    { title: 'Total', dataIndex: 'total', key: 'total', render: (total) => <Text strong>Bs. {total.toFixed(2)}</Text>, sorter: (a, b) => a.total - b.total },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Button type="link" icon={<Eye size={16} />} onClick={() => handleViewDetalle(record)}>Ver Detalle</Button>
      ),
    },
  ];

  if (isError) return <Alert message="Error" type="error" showIcon />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Title level={2} style={{ margin: 0 }}>Ventas</Title>
          <Text type="secondary">Registro y gestión de ventas.</Text>
        </div>
        <Space>
          <Button icon={<Download size={18} />}>Exportar</Button>
          <Button type="primary" icon={<Plus size={18} />} onClick={handleOpenModal}>Nueva Venta</Button>
        </Space>
      </div>

      <Card bordered={false} className="shadow-sm rounded-2xl">
        <Input
          placeholder="Buscar por cliente o método de pago..."
          prefix={<Search size={18} className="text-slate-400" />}
          size="large"
          onChange={(e) => setSearchText(e.target.value)}
        />
      </Card>

      <Card bordered={false} className="shadow-md rounded-2xl" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredVentas}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} ventas` }}
        />
      </Card>

      <Modal title="Nueva Venta" open={isModalOpen} onCancel={handleCloseModal} onOk={() => form.submit()} confirmLoading={createMutation.isPending} width={600}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-6">
          <Form.Item name="clienteId" label="Cliente" rules={[{ required: true }]}>
            <Select placeholder="Seleccione cliente" showSearch optionFilterProp="children">
              {Array.isArray(clientes) && clientes.map(c => <Select.Option key={c.id} value={c.id}>{c.nombre}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="fecha" label="Fecha" rules={[{ required: true }]}>
            <DatePicker format="DD/MM/YYYY" placeholder="Seleccione fecha" className="w-full" />
          </Form.Item>
          <Form.Item name="metodoPago" label="Método de Pago" rules={[{ required: true }]}>
            <Select placeholder="Seleccione método">
              <Select.Option value="Efectivo">Efectivo</Select.Option>
              <Select.Option value="Tarjeta">Tarjeta</Select.Option>
              <Select.Option value="QR">QR</Select.Option>
              <Select.Option value="Transferencia">Transferencia</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="total" label="Total (Bs.)" rules={[{ required: true, type: 'number', min: 0.01 }]}>
            <InputNumber min={0.01} step={0.01} placeholder="0.00" className="w-full" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal 
        title={<div className="flex items-center gap-2"><ShoppingCart size={20} /> Detalle de Venta</div>}
        open={!!selectedVenta} 
        onCancel={() => setSelectedVenta(null)} 
        footer={[<Button key="close" type="primary" onClick={() => setSelectedVenta(null)}>Cerrar</Button>]}
        width={700}
      >
        {selectedVenta && (
          <div className="space-y-6">
            {loadingCliente ? (
              <div className="flex justify-center py-8">
                <Spin size="large" />
              </div>
            ) : (
              <>
                {/* Información del Cliente */}
                <Card 
                  title={<div className="flex items-center gap-2"><User size={18} /> Información del Cliente</div>}
                  size="small"
                  className="shadow-sm"
                >
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label={<span className="flex items-center gap-2"><User size={14} /> Nombre</span>}>
                      <Text strong>{clienteDetalle?.nombre || 'N/A'}</Text>
                    </Descriptions.Item>
                    {clienteDetalle?.email && (
                      <Descriptions.Item label={<span className="flex items-center gap-2"><Mail size={14} /> Email</span>}>
                        {clienteDetalle.email}
                      </Descriptions.Item>
                    )}
                    {clienteDetalle?.telefono && (
                      <Descriptions.Item label={<span className="flex items-center gap-2"><Phone size={14} /> Teléfono</span>}>
                        {clienteDetalle.telefono}
                      </Descriptions.Item>
                    )}
                    {clienteDetalle?.fechaNacimiento && (
                      <Descriptions.Item label={<span className="flex items-center gap-2"><Calendar size={14} /> Fecha de Nacimiento</span>}>
                        {dayjs(clienteDetalle.fechaNacimiento).format('DD/MM/YYYY')}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>

                {/* Información de la Venta */}
                <Card 
                  title={<div className="flex items-center gap-2"><CreditCard size={18} /> Detalles de la Transacción</div>}
                  size="small"
                  className="shadow-sm"
                >
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="ID de Venta">
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
