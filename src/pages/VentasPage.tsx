import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVentas, createVenta, getVentasByCliente } from '../api/ventas';
import { getClientes, getClienteById } from '../api/clientes';
import { getProductos, getProductoById } from '../api/productos';
import { getServicios, getServicioById } from '../api/servicios';
import type { Venta } from '../types/venta';
import type { Cliente } from '../types/cliente';
import type { Producto } from '../types/producto';
import type { Servicio } from '../types/servicio';
import { Table, Button, Input, Space, Typography, Card, Alert, Modal, Form, Select, InputNumber, DatePicker, Tag, message, Descriptions, Spin, Row, Col, Divider, List, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Search, Plus, ShoppingCart, Eye, Download, User, Phone, Mail, Calendar, CreditCard, Trash2, Package, Scissors } from 'lucide-react';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface CartItem {
  type: 'producto' | 'servicio';
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

export const VentasPage = () => {
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
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

  // Funciones del carrito
  const addToCart = (type: 'producto' | 'servicio', item: any) => {
    const existingItem = cart.find(
      (cartItem) => cartItem.type === type && cartItem.id === item.id
    );

    if (existingItem) {
      setCart(cart.map((cartItem) =>
        cartItem.type === type && cartItem.id === item.id
          ? { ...cartItem, cantidad: cartItem.cantidad + 1, subtotal: (cartItem.cantidad + 1) * cartItem.precio }
          : cartItem
      ));
    } else {
      setCart([...cart, {
        type,
        id: item.id,
        nombre: item.nombre,
        precio: item.precio,
        cantidad: 1,
        subtotal: item.precio,
      }]);
    }
  };

  const updateCartItemQuantity = (index: number, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(index);
      return;
    }
    setCart(cart.map((item, i) =>
      i === index
        ? { ...item, cantidad, subtotal: cantidad * item.precio }
        : item
    ));
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };

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
    form.setFieldsValue({
      fecha: dayjs(),
    });
    clearCart();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    clearCart();
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    if (cart.length === 0) {
      message.error('Debe agregar al menos un producto o servicio al carrito');
      return;
    }

    const detalleVentas = cart.map(item => ({
      productoId: item.type === 'producto' ? item.id : null,
      servicioId: item.type === 'servicio' ? item.id : null,
      cantidad: item.cantidad,
      precioUnitario: item.precio,
    }));

    const ventaData = {
      ...values,
      fecha: values.fecha.format('YYYY-MM-DD'),
      total: calculateTotal(),
      detalleVentas,
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

  // Helper para obtener nombre del producto
  const getProductoNombre = (productoId: number) => {
    const producto = Array.isArray(productos) ? productos.find(p => p.id === productoId) : null;
    return producto?.nombre || 'N/A';
  };

  // Helper para obtener nombre del servicio
  const getServicioNombre = (servicioId: number) => {
    const servicio = Array.isArray(servicios) ? servicios.find(s => s.id === servicioId) : null;
    return servicio?.nombre || 'N/A';
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

      <Modal 
        title="Nueva Venta" 
        open={isModalOpen} 
        onCancel={handleCloseModal} 
        onOk={() => form.submit()} 
        confirmLoading={createMutation.isPending} 
        width={1200}
        okText="Completar Venta"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-6">
          <Row gutter={24}>
            {/* Columna izquierda: Información de la venta */}
            <Col xs={24} lg={8}>
              <Card title="Información de Venta" size="small" className="mb-4">
                <Form.Item name="clienteId" label="Cliente" rules={[{ required: true, message: 'Seleccione un cliente' }]}>
                  <Select placeholder="Seleccione cliente" showSearch optionFilterProp="children">
                    {Array.isArray(clientes) && clientes.map(c => <Select.Option key={c.id} value={c.id}>{c.nombre}</Select.Option>)}
                  </Select>
                </Form.Item>
                <Form.Item name="fecha" label="Fecha" rules={[{ required: true, message: 'Seleccione una fecha' }]}>
                  <DatePicker format="DD/MM/YYYY" placeholder="Seleccione fecha" className="w-full" />
                </Form.Item>
                <Form.Item name="metodoPago" label="Método de Pago" rules={[{ required: true, message: 'Seleccione método de pago' }]}>
                  <Select placeholder="Seleccione método">
                    <Select.Option value="Efectivo">Efectivo</Select.Option>
                    <Select.Option value="Tarjeta">Tarjeta</Select.Option>
                    <Select.Option value="QR">QR</Select.Option>
                    <Select.Option value="Transferencia">Transferencia</Select.Option>
                  </Select>
                </Form.Item>
              </Card>

              {/* Carrito de Compras */}
              <Card 
                title={<div className="flex items-center gap-2"><ShoppingCart size={18} /> Carrito ({cart.length})</div>}
                size="small"
              >
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <ShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
                    <Text type="secondary">Carrito vacío</Text>
                  </div>
                ) : (
                  <>
                    <List
                      dataSource={cart}
                      renderItem={(item, index) => (
                        <List.Item
                          actions={[
                            <Button 
                              type="text" 
                              danger 
                              icon={<Trash2 size={16} />} 
                              onClick={() => removeFromCart(index)}
                            />
                          ]}
                        >
                          <List.Item.Meta
                            avatar={item.type === 'producto' ? <Package size={20} /> : <Scissors size={20} />}
                            title={item.nombre}
                            description={
                              <div className="flex items-center gap-2">
                                <InputNumber 
                                  size="small" 
                                  min={1} 
                                  value={item.cantidad}
                                  onChange={(val) => updateCartItemQuantity(index, val || 1)}
                                  style={{ width: 60 }}
                                />
                                <Text type="secondary">× Bs. {item.precio.toFixed(2)}</Text>
                              </div>
                            }
                          />
                          <Text strong>Bs. {item.subtotal.toFixed(2)}</Text>
                        </List.Item>
                      )}
                    />
                    <Divider />
                    <div className="flex justify-between items-center">
                      <Text strong style={{ fontSize: 16 }}>Total:</Text>
                      <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                        Bs. {calculateTotal().toFixed(2)}
                      </Text>
                    </div>
                  </>
                )}
              </Card>
            </Col>

            {/* Columna derecha: Productos y Servicios */}
            <Col xs={24} lg={16}>
              <Tabs defaultActiveKey="productos">
                <Tabs.TabPane tab={<span><Package size={16} className="inline mr-2" />Productos</span>} key="productos">
                  <Input
                    placeholder="Buscar productos..."
                    prefix={<Search size={16} />}
                    className="mb-4"
                  />
                  <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                    <List
                      grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 3 }}
                      dataSource={Array.isArray(productos) ? productos : []}
                      renderItem={(producto: Producto) => (
                        <List.Item>
                          <Card 
                            size="small" 
                            hoverable
                            onClick={() => addToCart('producto', producto)}
                            className="cursor-pointer"
                          >
                            <Card.Meta
                              title={producto.nombre}
                              description={
                                <>
                                  <Text type="secondary" className="block mb-2">Stock: {producto.stock}</Text>
                                  <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                                    Bs. {producto.precio.toFixed(2)}
                                  </Text>
                                </>
                              }
                            />
                          </Card>
                        </List.Item>
                      )}
                    />
                  </div>
                </Tabs.TabPane>

                <Tabs.TabPane tab={<span><Scissors size={16} className="inline mr-2" />Servicios</span>} key="servicios">
                  <Input
                    placeholder="Buscar servicios..."
                    prefix={<Search size={16} />}
                    className="mb-4"
                  />
                  <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                    <List
                      grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 3 }}
                      dataSource={Array.isArray(servicios) ? servicios : []}
                      renderItem={(servicio: Servicio) => (
                        <List.Item>
                          <Card 
                            size="small" 
                            hoverable
                            onClick={() => addToCart('servicio', servicio)}
                            className="cursor-pointer"
                          >
                            <Card.Meta
                              title={servicio.nombre}
                              description={
                                <>
                                  <Text type="secondary" className="block mb-2">Duración: {servicio.duracion} min</Text>
                                  <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                                    Bs. {servicio.precio.toFixed(2)}
                                  </Text>
                                </>
                              }
                            />
                          </Card>
                        </List.Item>
                      )}
                    />
                  </div>
                </Tabs.TabPane>
              </Tabs>
            </Col>
          </Row>
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

                {/* Productos y Servicios */}
                {selectedVenta.detalleVentas && selectedVenta.detalleVentas.length > 0 && (
                  <Card 
                    title={<div className="flex items-center gap-2"><ShoppingCart size={18} /> Productos y Servicios</div>}
                    size="small"
                    className="shadow-sm"
                  >
                    <List
                      dataSource={selectedVenta.detalleVentas}
                      renderItem={(detalle) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              detalle.productoId ? 
                                <Package size={20} className="text-blue-500" /> : 
                                <Scissors size={20} className="text-purple-500" />
                            }
                            title={
                              <div className="flex items-center gap-2">
                                <Text strong>
                                  {detalle.productoId 
                                    ? getProductoNombre(detalle.productoId)
                                    : detalle.servicioId 
                                    ? getServicioNombre(detalle.servicioId)
                                    : 'N/A'}
                                </Text>
                                <Tag color={detalle.productoId ? 'blue' : 'purple'}>
                                  {detalle.productoId ? 'Producto' : 'Servicio'}
                                </Tag>
                              </div>
                            }
                            description={
                              <div className="flex items-center gap-4">
                                <Text type="secondary">Cantidad: {detalle.cantidad}</Text>
                                <Text type="secondary">Precio Unit.: Bs. {detalle.precioUnitario.toFixed(2)}</Text>
                              </div>
                            }
                          />
                          <Text strong style={{ fontSize: 16 }}>
                            Bs. {((detalle.subtotal || (detalle.cantidad * detalle.precioUnitario))).toFixed(2)}
                          </Text>
                        </List.Item>
                      )}
                    />
                    <Divider />
                    <div className="flex justify-between items-center">
                      <Text strong style={{ fontSize: 16 }}>Total:</Text>
                      <Text strong style={{ fontSize: 20, color: '#1890ff' }}>
                        Bs. {selectedVenta.total.toFixed(2)}
                      </Text>
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
