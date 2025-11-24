# Implementación de Funcionalidades en Empleadas

## Resumen

Se han implementado dos funcionalidades principales en la página de Empleadas:

1. **Valoraciones** - Sistema de calificaciones y comentarios de clientes
2. **Comisiones** - Cálculo de comisiones por rango de fechas

---

## 1. FUNCIONALIDAD DE VALORACIONES

### Archivos Creados

#### `src/api/valoraciones.ts` (Actualizado)
Endpoints disponibles:
- `getValoraciones()` - GET todas las valoraciones
- `getValoracionById(id)` - GET una valoración específica
- `getValoracionesByCliente(clienteId)` - GET valoraciones de un cliente
- `getValoracionesByEmpleada(empleadaId)` - GET `/api/Valoraciones/reporte/empleada/{empleadaId}`
- `getValoracionesByEmpleadaFechas(empleadaId, fechaInicio, fechaFin)` - GET reporte filtrado por fechas
- `getPromedioEmpleada(empleadaId)` - GET `/api/Valoraciones/promedio/empleada/{empleadaId}`
- `createValoracion(valoracion)` - POST nueva valoración

#### `src/components/ValoracionesModal.tsx`
Componente Modal que permite:
- Ver el promedio de calificación de una empleada
- Ver todas las valoraciones recibidas
- Crear nuevas valoraciones (con rating 1-5 y comentario opcional)
- Filtros de servicios, clientes y ventas

#### `src/types/valoracion.ts` (Ya existía)
```typescript
interface Valoracion {
  id: number;
  clienteId: string;
  empleadaId: number;
  servicioId: number;
  ventaId: number;
  calificacion: number; // 1-5
  comentario: string | null;
  fecha?: string;
}
```

### Características

✅ Mostrar promedio de valoraciones con estrellas
✅ Crear valoraciones con cliente, servicio y venta
✅ Comentarios opcionales (máx 1000 caracteres)
✅ Historial de todas las valoraciones
✅ Componente flotante (Drawer) para mejor UX
✅ Mostrar fecha de cada valoración

---

## 2. FUNCIONALIDAD DE COMISIONES

### Archivos Creados

#### `src/api/comisiones.ts` (Nuevo)
```typescript
export const calcularComisiones = async (
  empleadaId: number,
  fechaInicio: string,
  fechaFin: string
): Promise<number>
```

**Endpoint Backend**: GET `/api/Comisiones/calcular`

**Parámetros Query**:
- `empleadaId`: ID de la empleada
- `fechaInicio`: ISO 8601 format (YYYY-MM-DDTHH:mm:ss)
- `fechaFin`: ISO 8601 format (YYYY-MM-DDTHH:mm:ss)

**Respuesta**: Número decimal con el monto total de comisión

#### `src/components/ComisionesDrawer.tsx` (Nuevo)
Componente Drawer interactivo que permite:
- Seleccionar rango de fechas con DatePicker
- Calcular comisiones automáticamente
- Mostrar resultado con formato de moneda (Bs.)
- Mostrar detalles del período y empleada
- Opción para calcular otro período

### Características

✅ Interfaz de usuario intuitiva con Drawer flotante
✅ Selector de rango de fechas (fecha inicio y fin)
✅ Impide seleccionar fechas futuras
✅ Conversión automática a ISO 8601
✅ Manejo de errores con mensajes amigables
✅ Estadísticas visuales (Statistic component)
✅ Formato de moneda Bolivianos (Bs.)

### Integración en EmpleadasPage

Se agregaron:
1. Estado para manejar drawer abierto
2. Función `handleViewComisiones()`
3. Opción "Ver Comisiones" en menú dropdown
4. Componente `<ComisionesDrawer>` al final de la página

---

## 3. CAMBIOS EN EmpleadasPage

### Imports Añadidos
```typescript
import { ComisionesDrawer } from '../components/ComisionesDrawer';
import { getPromedioEmpleada } from '../api/valoraciones';
import { TrendingUp } from 'lucide-react'; // Icono para comisiones
```

### Estados Añadidos
```typescript
const [selectedEmpleadaForComisiones, setSelectedEmpleadaForComisiones] = useState<Empleada | null>(null);
const [comisionesOpen, setComisionesOpen] = useState(false);
```

### Métodos Añadidos
```typescript
const handleViewComisiones = (empleada: Empleada) => {
  setSelectedEmpleadaForComisiones(empleada);
  setComisionesOpen(true);
};
```

### Opciones de Menú (Dropdown)
Ahora incluye:
- ✨ Ver Valoraciones
- 💰 Ver Comisiones (NUEVO)
- ✏️ Editar
- 🗑️ Eliminar

---

## Flujo de Uso

### Para Ver Valoraciones
1. En la tabla de empleadas, hacer clic en los "3 puntos" (Dropdown)
2. Seleccionar "Ver Valoraciones"
3. Se abre un modal flotante con:
   - Promedio de estrellas
   - Botón para crear nueva valoración
   - Historial de valoraciones recibidas

### Para Ver Comisiones
1. En la tabla de empleadas, hacer clic en los "3 puntos" (Dropdown)
2. Seleccionar "Ver Comisiones"
3. Se abre un Drawer flotante con:
   - Información de la empleada
   - Selector de rango de fechas
   - Botón "Calcular Comisiones"
4. El sistema calcula y muestra el monto total en Bs.
5. Opción para calcular otro período

---

## Stack Tecnológico

- **React Query**: Manejo de state de datos y mutations
- **Ant Design**: Componentes UI (Drawer, Form, DatePicker, etc.)
- **Lucide React**: Iconos
- **Day.js**: Manipulación de fechas
- **TypeScript**: Tipado estático

---

## Notas Técnicas

### Conversión de Fechas
```typescript
// De Day.js a ISO 8601
const fechaISO = dayjs().toISOString(); // "2025-11-23T21:30:00.000Z"

// El backend espera este formato exacto
const params = {
  empleadaId: 1,
  fechaInicio: "2025-11-01T00:00:00.000Z",
  fechaFin: "2025-11-30T23:59:59.000Z"
};
```

### Manejo de Errores
Ambos componentes manejan:
- Errores de red
- Mensajes del backend
- Estados de carga con Spin
- Feedback visual con message.success/error

### Performance
- Query keys por empleada para cacheo eficiente
- DatePicker deshabilitado para fechas futuras
- Spinner durante cálculos
- Lazy loading de datos

---

## Pruebas Recomendadas

- [ ] Crear una valoración para una empleada
- [ ] Ver el promedio actualizado
- [ ] Calcular comisiones para diferentes períodos
- [ ] Verificar formato ISO de fechas en network tab
- [ ] Probar error handling cuando el backend falla
- [ ] Verificar rango de fechas del DatePicker
- [ ] Comprobar que las comisiones se muestran en Bs.

---

## Mejoras Futuras

- Exportar comisiones a PDF o Excel
- Gráficos de tendencia de comisiones
- Filtro de valoraciones por calificación
- Historial de comisiones mensuales
- Notificaciones en tiempo real
- Comparativa con otros períodos
