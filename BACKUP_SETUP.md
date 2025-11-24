# Apartado de Ajustes - Documentación de Implementación

## Resumen

Se ha creado un nuevo apartado de **Ajustes** en el sistema SPA Frontend que proporciona funcionalidad completa para gestionar backups de la base de datos. Este módulo incluye:

- ✅ **Descargar Backup**: Permite generar un archivo .sql con todos los datos
- ✅ **Restaurar Backup**: Permite cargar y restaurar un backup previamente descargado
- ✅ **Historial**: Muestra la fecha del último backup realizado
- ✅ **Validación**: Validación de archivos y manejo de errores
- ✅ **UI Responsive**: Interfaz moderna y amigable

---

## Archivos Creados

### 1. **API de Backup** (`src/api/backup.ts`)
```typescript
- descargarBackup(): Promise<Blob>
  └─ Realiza POST a /api/Backup/descargar
  └─ Retorna Blob con el archivo .sql

- restaurarBackup(archivo: File): Promise<{ mensaje: string }>
  └─ Realiza POST a /api/Backup/restaurar
  └─ Usa multipart/form-data
  └─ Parámetro: archivoBackup (archivo binario)
```

### 2. **Tipos TypeScript** (`src/types/backup.ts`)
```typescript
export interface BackupResponse {
  mensaje: string;
  fecha?: string;
  tamano?: number;
}
```

### 3. **Página de Ajustes** (`src/pages/AjustesPage.tsx`)
Componente React que incluye:

#### Características:
- **Descargar Backup**:
  - Modal de confirmación
  - Descarga automática del archivo .sql
  - Actualiza el historial de último backup
  - Guarda fecha en localStorage

- **Restaurar Backup**:
  - Selector de archivo con validación
  - Validación de extensión (.sql)
  - Validación de tamaño (máximo 1GB)
  - Modal de confirmación con advertencias
  - Indicador de progreso de carga
  - Manejo de errores

- **Información de Seguridad**:
  - Recomendaciones de buenas prácticas
  - Información sobre backups regulares
  - Consejos sobre almacenamiento seguro

#### Componentes Ant Design utilizados:
- Card, Button, Typography (Title, Text, Paragraph)
- Alert, Modal, Upload, Progress, Divider

#### Iconos Lucide utilizados:
- Download, Upload, Database, Settings, AlertTriangle, Clock, FileDown

---

## Archivos Modificados

### 1. **Router** (`src/router.tsx`)
Se agregó:
```typescript
import { AjustesPage } from './pages/AjustesPage';

const ajustesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ajustes',
  component: AjustesPage,
});

// Agregado a routeTree.addChildren()
ajustesRoute,
```

### 2. **Layout** (`src/components/Layout.tsx`)
Se agregó:
```typescript
import { Settings as SettingsIcon } from 'lucide-react';

// Nueva sección en la navegación (en el sidebar)
<div className="px-6 mt-8 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
  Sistema
</div>
<SidebarItem to="/ajustes" icon={SettingsIcon} label="Ajustes" />
```

---

## Estructura de Peticiones HTTP

### Descargar Backup
```
POST /api/Backup/descargar
Content-Type: application/json

Response:
Status: 200 OK
Body: (Blob - archivo .sql)
```

### Restaurar Backup
```
POST /api/Backup/restaurar
Content-Type: multipart/form-data

Body:
archivoBackup: <archivo .sql>

Response:
Status: 200 OK
Body: {
  "mensaje": "string"
}
```

---

## Características de UX

1. **Validación de Archivos**:
   - Solo acepta archivos .sql
   - Máximo 1GB de tamaño
   - Mensajes de error claros

2. **Confirmaciones de Seguridad**:
   - Modal de confirmación antes de descargar
   - Modal de advertencia antes de restaurar
   - Información de seguridad visible

3. **Progreso Visual**:
   - Indicador de progreso durante la restauración
   - Estados de carga en botones
   - Mensajes de éxito/error con Ant Design

4. **Persistencia**:
   - Guarda la fecha del último backup en localStorage
   - Recupera la información al cargar la página

---

## Navegación

El nuevo apartado está disponible en:
- **URL**: `/ajustes`
- **Ubicación**: Menú lateral, sección "SISTEMA"
- **Icono**: ⚙️ Settings

---

## Stack Tecnológico Utilizado

- **React 19**: Componentes funcionales con hooks
- **TypeScript**: Tipado estático
- **TanStack React Query**: Manejo de estado y mutaciones
- **Ant Design**: Componentes UI
- **Lucide React**: Iconos
- **Tailwind CSS**: Estilos personalizados
- **Day.js**: Formateo de fechas

---

## Notas de Implementación

1. Los archivos descargados se nombran automáticamente con timestamp: `backup_YYYY-MM-DD_HH-mm-ss.sql`

2. El estado de "Último Backup" se persiste en localStorage bajo la clave `lastBackupDate`

3. La descarga utiliza Blob API para generar archivos en el navegador

4. Las mutaciones de TanStack Query manejan automáticamente los estados de carga (isPending)

5. Los errores del backend se capturan y muestran en mensajes amigables

6. El progreso de restauración es simulado (visual) y se basa en el tiempo para mejor UX

---

## Pruebas Recomendadas

- [ ] Descargar un backup y verificar que se genera el archivo .sql
- [ ] Restaurar un backup previamente descargado
- [ ] Intentar cargar un archivo que no sea .sql (debe rechazarse)
- [ ] Intentar cargar un archivo mayor a 1GB (debe rechazarse)
- [ ] Verificar que el historial persiste al refrescar la página
- [ ] Verificar mensajes de error cuando el backend falla

---

## Mejoras Futuras Posibles

- Visualización de lista de backups disponibles en el servidor
- Programación automática de backups
- Compresión de backups (gzip)
- Verificación de integridad de backups
- Restauración selectiva de tablas
- Descarga de múltiples backups
