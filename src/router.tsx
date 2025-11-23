import { createRouter, createRoute, createRootRoute, redirect } from '@tanstack/react-router';
import { Layout } from './components/Layout';
import { ClientesPage } from './pages/ClientesPage';
import { CategoriasPage } from './pages/CategoriasPage';
import { CitasPage } from './pages/CitasPage';
import { EmpleadasPage } from './pages/EmpleadasPage';
import { ProductosPage } from './pages/ProductosPage';
import { ServiciosPage } from './pages/ServiciosPage';
import { VentasPage } from './pages/VentasPage';
import { ReportesPage } from './pages/ReportesPage';

// Root route que envuelve toda la aplicación con el Layout
const rootRoute = createRootRoute({
  component: Layout,
});

// Ruta de inicio (Redirige a clientes)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({
      to: '/clientes',
    });
  },
});

// Ruta de Clientes
const clientesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/clientes',
  component: ClientesPage,
});

// Ruta de Categorías
const categoriasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/categorias',
  component: CategoriasPage,
});

// Ruta de Citas
const citasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/citas',
  component: CitasPage,
});

// Ruta de Empleadas
const empleadasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/empleadas',
  component: EmpleadasPage,
});

// Ruta de Productos
const productosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/productos',
  component: ProductosPage,
});

// Ruta de Servicios
const serviciosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/servicios',
  component: ServiciosPage,
});

// Ruta de Ventas
const ventasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ventas',
  component: VentasPage,
});

// Ruta de Reportes
const reportesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reportes',
  component: ReportesPage,
});

// Árbol de rutas
const routeTree = rootRoute.addChildren([
  indexRoute,
  clientesRoute,
  categoriasRoute,
  citasRoute,
  empleadasRoute,
  productosRoute,
  serviciosRoute,
  ventasRoute,
  reportesRoute,
]);

// Crear el router
export const router = createRouter({ routeTree });

// Registrar el router para tipado seguro
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
