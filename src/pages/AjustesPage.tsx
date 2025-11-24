import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { descargarBackup, restaurarBackup } from '../api/backup';
import {
  Card,
  Button,
  Typography,
  Alert,
  Modal,
  message,
  Divider,
  Upload,
  Progress,
} from 'antd';
import type { UploadProps } from 'antd';
import {
  Download,
  Upload as UploadIcon,
  AlertTriangle,
  Settings,
  Database,
  Clock,
  FileDown,
} from 'lucide-react';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

export const AjustesPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(
    localStorage.getItem('lastBackupDate')
  );
  const [uploadProgress, setUploadProgress] = useState(0);

  // Mutation para descargar backup
  const descargarMutation = useMutation({
    mutationFn: descargarBackup,
    onSuccess: (blob) => {
      // Crear URL y descargar el archivo
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.sql`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Actualizar fecha del último backup
      const ahora = dayjs().format('DD/MM/YYYY HH:mm:ss');
      setLastBackupDate(ahora);
      localStorage.setItem('lastBackupDate', ahora);

      message.success('Backup descargado exitosamente');
    },
    onError: (error: { response?: { data?: { mensaje?: string } } } | Error) => {
      const errorMessage =
        ('response' in error && error.response?.data?.mensaje) ||
        ('message' in error && error.message) ||
        'Error al descargar el backup';
      message.error(errorMessage);
    },
  });

  // Mutation para restaurar backup
  const restaurarMutation = useMutation({
    mutationFn: (archivo: File) => restaurarBackup(archivo),
    onSuccess: () => {
      message.success('Backup restaurado exitosamente');
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error: { response?: { data?: { mensaje?: string } } } | Error) => {
      const errorMessage =
        ('response' in error && error.response?.data?.mensaje) ||
        ('message' in error && error.message) ||
        'Error al restaurar el backup';
      message.error(errorMessage);
    },
  });

  const handleDescargarBackup = () => {
    Modal.confirm({
      title: 'Descargar Backup',
      icon: <Download size={24} className="text-blue-500" />,
      content: (
        <div className="space-y-4">
          <Paragraph>¿Deseas descargar un backup de la base de datos?</Paragraph>
          <Alert
            message="Información"
            description="Se creará un archivo .sql con todos los datos del sistema. Asegúrate de guardarlo en un lugar seguro."
            type="info"
            showIcon
          />
        </div>
      ),
      okText: 'Descargar',
      cancelText: 'Cancelar',
      okButtonProps: { loading: descargarMutation.isPending },
      onOk: () => {
        descargarMutation.mutate();
      },
    });
  };

  const handleRestaurarBackup = (archivo: File) => {
    Modal.confirm({
      title: 'Restaurar Backup',
      icon: <AlertTriangle size={24} className="text-orange-500" />,
      content: (
        <div className="space-y-4">
          <Alert
            message="Advertencia"
            description="Esta acción sobrescribirá todos los datos actuales de la base de datos. Asegúrate de tener un backup del estado actual antes de proceder."
            type="warning"
            showIcon
          />
          <Paragraph>
            <strong>Archivo seleccionado:</strong> {archivo.name}
          </Paragraph>
        </div>
      ),
      okText: 'Restaurar',
      cancelText: 'Cancelar',
      okButtonProps: {
        loading: restaurarMutation.isPending,
        danger: true,
      },
      onOk: async () => {
        // Simular progreso
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress > 90) progress = 90;
          setUploadProgress(progress);
        }, 200);

        try {
          await restaurarMutation.mutateAsync(archivo);
          clearInterval(interval);
          setUploadProgress(100);
          setTimeout(() => {
            setUploadProgress(0);
          }, 1000);
        } catch (error) {
          clearInterval(interval);
          setUploadProgress(0);
        }
      },
      onCancel: () => {
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
    });
  };

  const uploadProps: UploadProps = {
    maxCount: 1,
    accept: '.sql',
    beforeUpload: (file) => {
      // Validar que sea un archivo .sql
      if (!file.name.endsWith('.sql')) {
        message.error('Por favor selecciona un archivo .sql válido');
        return false;
      }

      // Validar tamaño (máximo 1GB)
      const isLessThan1GB = file.size / 1024 / 1024 < 1024;
      if (!isLessThan1GB) {
        message.error('El archivo debe ser menor a 1GB');
        return false;
      }

      handleRestaurarBackup(file);
      return false; // Prevenir carga automática
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Title level={2} style={{ margin: 0 }} className="flex items-center gap-2">
            <Settings size={32} className="text-slate-700" />
            Ajustes
          </Title>
          <Text type="secondary">Gestión de backups y configuración del sistema</Text>
        </div>
      </div>

      {/* Sección de Backup */}
      <Card
        bordered={false}
        className="shadow-sm rounded-2xl"
        title={
          <div className="flex items-center gap-2">
            <Database size={20} className="text-blue-500" />
            <span>Gestión de Backups</span>
          </div>
        }
      >
        <Paragraph>
          Los backups son copias de seguridad de toda la información de tu base de datos. Puedes descargar un backup en cualquier momento y restaurarlo si es necesario.
        </Paragraph>

        <Divider />

        {/* Información del último backup */}
        {lastBackupDate && (
          <Alert
            message="Último backup realizado"
            description={
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{lastBackupDate}</span>
              </div>
            }
            type="success"
            icon={<FileDown size={16} />}
            showIcon
            className="mb-6"
          />
        )}

        {/* Acciones de Backup */}
        <div className="space-y-6">
          {/* Descargar Backup */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Download size={18} className="text-blue-600" />
                  Descargar Backup
                </h4>
                <p className="text-sm text-slate-600 mt-1">
                  Descarga una copia de seguridad completa de la base de datos en formato .sql
                </p>
              </div>
            </div>
            <Button
              type="primary"
              icon={<Download size={16} />}
              onClick={handleDescargarBackup}
              loading={descargarMutation.isPending}
              size="large"
              className="w-full"
            >
              {descargarMutation.isPending ? 'Descargando...' : 'Descargar Backup'}
            </Button>
          </div>

          {/* Restaurar Backup */}
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                  <UploadIcon size={18} className="text-orange-600" />
                  Restaurar Backup
                </h4>
                <p className="text-sm text-slate-600 mt-1">
                  Carga un archivo .sql anteriormente descargado para restaurar la base de datos
                </p>
              </div>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mb-4">
                <Progress percent={Math.round(uploadProgress)} status="active" />
              </div>
            )}

            <Upload {...uploadProps} className="mb-3">
              <Button
                icon={<UploadIcon size={16} />}
                size="large"
                className="w-full"
                disabled={restaurarMutation.isPending}
              >
                {restaurarMutation.isPending ? 'Restaurando...' : 'Seleccionar archivo .sql'}
              </Button>
            </Upload>
          </div>
        </div>
      </Card>

      {/* Información adicional */}
      <Card bordered={false} className="shadow-sm rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900">Recomendaciones de seguridad</h4>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Realiza backups regularmente, al menos una vez a la semana</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Guarda tus backups en un lugar seguro, preferiblemente en la nube</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Prueba periódicamente que tus backups se puedan restaurar correctamente</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Mantén múltiples copias de backups en diferentes ubicaciones</span>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
};
