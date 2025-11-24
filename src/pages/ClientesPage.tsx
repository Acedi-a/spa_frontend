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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  Trash2,
  QrCode
} from 'lucide-react';
import dayjs from 'dayjs';
import { QRCardModal } from '../components/QRCardModal';

const { Title, Text } = Typography;

export const ClientesPage = () => {
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [qrCardOpen, setQrCardOpen] = useState(false);
  const [selectedClienteForQR, setSelectedClienteForQR] = useState<Cliente | null>(null);
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

  const handleExportPDF = () => {
    if (!clientes || clientes.length === 0) {
      message.warning('No hay clientes para exportar');
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      // Encabezado
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('LISTADO DE CLIENTES', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generado el ${dayjs().format('DD/MM/YYYY HH:mm')}`, pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 5;
      doc.text(`Total de clientes: ${clientesArray.length}`, pageWidth / 2, yPos, { align: 'center' });

      yPos += 15;

      // Tabla de clientes
      const tableData = clientesArray.map((cliente, index) => [
        (index + 1).toString(),
        cliente.nombre,
        cliente.email || 'N/A',
        cliente.telefono || 'N/A',
        cliente.fechaNacimiento ? dayjs(cliente.fechaNacimiento).format('DD/MM/YYYY') : 'N/A',
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Nombre', 'Email', 'Teléfono', 'Fecha Nacimiento']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [24, 144, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 50 },
          2: { cellWidth: 50 },
          3: { cellWidth: 35 },
          4: { cellWidth: 35 }
        },
        margin: { left: 14, right: 14 },
      });

      // Estadísticas adicionales
      const finalY = (doc as any).lastAutoTable.finalY;
      if (finalY < doc.internal.pageSize.getHeight() - 60) {
        yPos = finalY + 15;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Estadísticas', 14, yPos);
        yPos += 7;

        const clientesConEmail = clientesArray.filter(c => c.email).length;
        const clientesConTelefono = clientesArray.filter(c => c.telefono).length;
        const clientesConFecha = clientesArray.filter(c => c.fechaNacimiento).length;

        const estadisticas = [
          ['Clientes con email', clientesConEmail.toString(), `${((clientesConEmail / clientesArray.length) * 100).toFixed(1)}%`],
          ['Clientes con teléfono', clientesConTelefono.toString(), `${((clientesConTelefono / clientesArray.length) * 100).toFixed(1)}%`],
          ['Clientes con fecha de nacimiento', clientesConFecha.toString(), `${((clientesConFecha / clientesArray.length) * 100).toFixed(1)}%`],
        ];

        autoTable(doc, {
          startY: yPos,
          head: [['Métrica', 'Cantidad', 'Porcentaje']],
          body: estadisticas,
          theme: 'striped',
          headStyles: { fillColor: [52, 168, 83] },
          margin: { left: 14, right: 14 },
        });
      }

      // Pie de página en todas las páginas
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
      const fileName = `Clientes_${dayjs().format('DDMMYYYY_HHmm')}.pdf`;
      doc.save(fileName);
      
      message.success('Listado de clientes exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      message.error('Error al generar el PDF');
    }
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
            key: 'qr',
            label: 'Generar Tarjeta QR',
            icon: <QrCode size={16} />,
            onClick: () => {
              setSelectedClienteForQR(record);
              setQrCardOpen(true);
            },
          },
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
          <Button 
            icon={<Download size={18} />}
            onClick={handleExportPDF}
            loading={isLoading}
          >
            Exportar PDF
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

      {/* Modal de Tarjeta QR */}
      {selectedClienteForQR && (
        <QRCardModal
          open={qrCardOpen}
          onClose={() => {
            setQrCardOpen(false);
            setSelectedClienteForQR(null);
          }}
          cliente={selectedClienteForQR}
        />
      )}
    </div>
  );
};
