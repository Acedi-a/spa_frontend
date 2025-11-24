import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProductos, createProducto, updateProducto, deleteProducto } from '../api/productos';
import { getCategorias } from '../api/categorias';
import type { Producto } from '../types/producto';
import { 
  Table, Button, Input, Space, Typography, Card, Alert, Modal, Form, Select, InputNumber, DatePicker, Dropdown, Tag, message
} from 'antd';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

  // Helper para obtener nombre de categoría
  const getCategoriaNombre = (categoriaId: number) => {
    const categoria = categorias?.find(c => c.id === categoriaId);
    return categoria?.nombre || 'N/A';
  };

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

  const handleExportPDF = () => {
    if (!productos || productosArray.length === 0) {
      message.warning('No hay productos para exportar');
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      // Encabezado
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('INVENTARIO DE PRODUCTOS', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generado el ${dayjs().format('DD/MM/YYYY HH:mm')}`, pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 5;
      doc.text(`Total de productos: ${productosArray.length}`, pageWidth / 2, yPos, { align: 'center' });

      yPos += 15;

      // Tabla de productos
      const tableData = productosArray.map((producto, index) => [
        (index + 1).toString(),
        producto.nombre,
        getCategoriaNombre(producto.categoriaId),
        `Bs. ${producto.precio.toFixed(2)}`,
        producto.stock.toString(),
        producto.fechaVencimiento ? dayjs(producto.fechaVencimiento).format('DD/MM/YYYY') : 'N/A',
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Producto', 'Categoría', 'Precio', 'Stock', 'Vencimiento']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [24, 144, 255],
          fontSize: 9,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 8,
          cellPadding: 2.5
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 60 },
          2: { cellWidth: 35 },
          3: { cellWidth: 25 },
          4: { cellWidth: 20 },
          5: { cellWidth: 30 }
        },
        margin: { left: 10, right: 10 },
      });

      // Estadísticas (calcular antes del bloque condicional)
      const stockTotal = productosArray.reduce((sum, p) => sum + p.stock, 0);
      const valorInventario = productosArray.reduce((sum, p) => sum + (p.precio * p.stock), 0);
      const stockBajo = productosArray.filter(p => p.stock < 10).length;
      const productosVencer = productosArray.filter(p => {
        if (!p.fechaVencimiento) return false;
        const dias = dayjs(p.fechaVencimiento).diff(dayjs(), 'day');
        return dias <= 30 && dias >= 0;
      }).length;

      const finalY = (doc as any).lastAutoTable.finalY;
      if (finalY < doc.internal.pageSize.getHeight() - 80) {
        yPos = finalY + 15;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Estadísticas de Inventario', 14, yPos);
        yPos += 7;

        // Productos por categoría
        const porCategoria: Record<string, { cantidad: number; valor: number }> = {};
        productosArray.forEach(p => {
          const cat = getCategoriaNombre(p.categoriaId);
          if (!porCategoria[cat]) {
            porCategoria[cat] = { cantidad: 0, valor: 0 };
          }
          porCategoria[cat].cantidad += 1;
          porCategoria[cat].valor += p.precio * p.stock;
        });

        const estadisticas = [
          ['Stock Total', stockTotal.toString()],
          ['Valor Total del Inventario', `Bs. ${valorInventario.toFixed(2)}`],
          ['Productos con Stock Bajo (<10)', stockBajo.toString()],
          ['Productos por Vencer (30 días)', productosVencer.toString()],
          ['Precio Promedio', `Bs. ${(productosArray.reduce((sum, p) => sum + p.precio, 0) / productosArray.length).toFixed(2)}`],
        ];

        autoTable(doc, {
          startY: yPos,
          body: estadisticas,
          theme: 'striped',
          styles: { fontSize: 9 },
          margin: { left: 14, right: 14 },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 100 },
            1: { halign: 'right', cellWidth: 'auto' }
          }
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;

        // Tabla de categorías
        if (yPos < doc.internal.pageSize.getHeight() - 60) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('Inventario por Categoría', 14, yPos);
          yPos += 5;

          const categoriaData = Object.entries(porCategoria).map(([cat, data]) => [
            cat,
            data.cantidad.toString(),
            `Bs. ${data.valor.toFixed(2)}`
          ]);

          autoTable(doc, {
            startY: yPos,
            head: [['Categoría', 'Cantidad', 'Valor Total']],
            body: categoriaData,
            theme: 'grid',
            headStyles: { fillColor: [52, 168, 83] },
            styles: { fontSize: 8 },
            margin: { left: 14, right: 14 },
          });
        }
      }

      // Productos con stock bajo (nueva página si es necesario)
      if (stockBajo > 0) {
        doc.addPage();
        yPos = 20;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('⚠️ Productos con Stock Bajo', 14, yPos);
        yPos += 7;

        const productosBajoStock = productosArray
          .filter(p => p.stock < 10)
          .map(p => [
            p.nombre,
            getCategoriaNombre(p.categoriaId),
            p.stock.toString(),
            `Bs. ${p.precio.toFixed(2)}`
          ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Producto', 'Categoría', 'Stock', 'Precio']],
          body: productosBajoStock,
          theme: 'grid',
          headStyles: { fillColor: [255, 77, 79] },
          margin: { left: 14, right: 14 },
        });
      }

      // Pie de página
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128);
        doc.text(
          `Página ${i} de ${totalPages}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Guardar PDF
      const fileName = `Inventario_Productos_${dayjs().format('DDMMYYYY_HHmm')}.pdf`;
      doc.save(fileName);
      
      message.success('Inventario exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      message.error('Error al generar el PDF');
    }
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
      render: (_, record) => <Tag color="blue">{getCategoriaNombre(record.categoriaId)}</Tag>,
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
          <Button 
            icon={<Download size={18} />}
            onClick={handleExportPDF}
            loading={isLoading}
          >
            Exportar PDF
          </Button>
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
