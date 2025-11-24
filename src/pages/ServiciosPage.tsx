import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getServicios, createServicio, updateServicio, deleteServicio } from '../api/servicios';
import { getCategorias } from '../api/categorias';
import { getEmpleadas } from '../api/empleadas';
import type { Servicio } from '../types/servicio';
import { Table, Button, Input, Space, Typography, Card, Alert, Modal, Form, Select, InputNumber, Dropdown, Tag, message } from 'antd';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';
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

  // Helper para obtener nombre de categoría
  const getCategoriaNombre = (categoriaId: number) => {
    const categoria = categorias?.find(c => c.id === categoriaId);
    return categoria?.nombre || 'N/A';
  };

  // Helper para obtener nombre de empleada
  const getEmpleadaNombre = (empleadaId: number) => {
    const empleada = empleadas?.find(e => e.id === empleadaId);
    return empleada?.nombre || 'N/A';
  };

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

  const handleExportPDF = () => {
    if (!servicios || serviciosArray.length === 0) {
      message.warning('No hay servicios para exportar');
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      // Encabezado
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('CATÁLOGO DE SERVICIOS', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generado el ${dayjs().format('DD/MM/YYYY HH:mm')}`, pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 5;
      doc.text(`Total de servicios: ${serviciosArray.length}`, pageWidth / 2, yPos, { align: 'center' });

      yPos += 15;

      // Tabla de servicios
      const tableData = serviciosArray.map((servicio, index) => [
        (index + 1).toString(),
        servicio.nombre,
        getCategoriaNombre(servicio.categoriaId),
        `Bs. ${servicio.precio.toFixed(2)}`,
        `${servicio.duracion} min`,
        getEmpleadaNombre(servicio.empleadaId),
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Servicio', 'Categoría', 'Precio', 'Duración', 'Empleada']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [147, 51, 234],
          fontSize: 9,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 8,
          cellPadding: 2.5
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 50 },
          2: { cellWidth: 35 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 40 }
        },
        margin: { left: 10, right: 10 },
      });

      // Estadísticas (calcular antes del bloque condicional)
      const precioPromedio = serviciosArray.reduce((sum, s) => sum + s.precio, 0) / serviciosArray.length;
      const duracionPromedio = serviciosArray.reduce((sum, s) => sum + s.duracion, 0) / serviciosArray.length;
      const servicioMasCaro = serviciosArray.reduce((max, s) => s.precio > max.precio ? s : max, serviciosArray[0]);
      const servicioMasBarato = serviciosArray.reduce((min, s) => s.precio < min.precio ? s : min, serviciosArray[0]);

      // Servicios por categoría
      const porCategoria: Record<string, { cantidad: number; precioTotal: number }> = {};
      serviciosArray.forEach(s => {
        const cat = getCategoriaNombre(s.categoriaId);
        if (!porCategoria[cat]) {
          porCategoria[cat] = { cantidad: 0, precioTotal: 0 };
        }
        porCategoria[cat].cantidad += 1;
        porCategoria[cat].precioTotal += s.precio;
      });

      // Servicios por empleada
      const porEmpleada: Record<string, number> = {};
      serviciosArray.forEach(s => {
        const emp = getEmpleadaNombre(s.empleadaId);
        porEmpleada[emp] = (porEmpleada[emp] || 0) + 1;
      });

      const finalY = (doc as any).lastAutoTable.finalY;
      if (finalY < doc.internal.pageSize.getHeight() - 80) {
        yPos = finalY + 15;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Estadísticas de Servicios', 14, yPos);
        yPos += 7;

        const estadisticas = [
          ['Precio Promedio', `Bs. ${precioPromedio.toFixed(2)}`],
          ['Duración Promedio', `${duracionPromedio.toFixed(0)} minutos`],
          ['Servicio Más Caro', `${servicioMasCaro.nombre} - Bs. ${servicioMasCaro.precio.toFixed(2)}`],
          ['Servicio Más Económico', `${servicioMasBarato.nombre} - Bs. ${servicioMasBarato.precio.toFixed(2)}`],
        ];

        autoTable(doc, {
          startY: yPos,
          body: estadisticas,
          theme: 'striped',
          styles: { fontSize: 9 },
          margin: { left: 14, right: 14 },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 90 },
            1: { halign: 'right', cellWidth: 'auto' }
          }
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;

        // Tabla de servicios por categoría
        if (yPos < doc.internal.pageSize.getHeight() - 60) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('Servicios por Categoría', 14, yPos);
          yPos += 5;

          const categoriaData = Object.entries(porCategoria).map(([cat, data]) => [
            cat,
            data.cantidad.toString(),
            `Bs. ${(data.precioTotal / data.cantidad).toFixed(2)}`
          ]);

          autoTable(doc, {
            startY: yPos,
            head: [['Categoría', 'Cantidad', 'Precio Promedio']],
            body: categoriaData,
            theme: 'grid',
            headStyles: { fillColor: [52, 168, 83] },
            styles: { fontSize: 8 },
            margin: { left: 14, right: 14 },
          });
        }
      }

      // Servicios por empleada (nueva página si es necesario)
      if (Object.keys(porEmpleada).length > 0) {
        const needsNewPage = (doc as any).lastAutoTable.finalY > doc.internal.pageSize.getHeight() - 80;
        if (needsNewPage) {
          doc.addPage();
          yPos = 20;
        } else {
          yPos = (doc as any).lastAutoTable.finalY + 15;
        }

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Servicios por Empleada', 14, yPos);
        yPos += 5;

        const empleadaData = Object.entries(porEmpleada)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .map(([emp, count]) => [emp, (count as number).toString()]);

        autoTable(doc, {
          startY: yPos,
          head: [['Empleada', 'Cantidad de Servicios']],
          body: empleadaData,
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246] },
          styles: { fontSize: 8 },
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
      const fileName = `Catalogo_Servicios_${dayjs().format('DDMMYYYY_HHmm')}.pdf`;
      doc.save(fileName);
      
      message.success('Catálogo de servicios exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      message.error('Error al generar el PDF');
    }
  };

  const serviciosArray = Array.isArray(servicios) ? servicios : [];
  const filteredServicios = serviciosArray.filter(s => s.nombre.toLowerCase().includes(searchText.toLowerCase()));

  const columns: ColumnsType<Servicio> = [
    { title: 'Servicio', dataIndex: 'nombre', key: 'nombre', render: (text) => (<div className="flex items-center gap-2"><Scissors size={18} className="text-purple-500" /><Text strong>{text}</Text></div>) },
    { title: 'Categoría', key: 'categoria', render: (_, record) => <Tag color="blue">{getCategoriaNombre(record.categoriaId)}</Tag> },
    { title: 'Precio', dataIndex: 'precio', key: 'precio', render: (precio) => `Bs. ${precio.toFixed(2)}`, sorter: (a, b) => a.precio - b.precio },
    { title: 'Duración', dataIndex: 'duracion', key: 'duracion', render: (d) => `${d} min` },
    { title: 'Empleada', key: 'empleada', render: (_, record) => getEmpleadaNombre(record.empleadaId) },
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
        <Space>
          <Button 
            icon={<Download size={18} />}
            onClick={handleExportPDF}
            loading={isLoading}
          >
            Exportar PDF
          </Button>
          <Button type="primary" icon={<Plus size={18} />} onClick={() => handleOpenModal()}>Nuevo Servicio</Button>
        </Space>
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
