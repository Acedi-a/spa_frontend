import { createRouter, createRoute, createRootRoute, redirect } from '@tanstack/react-router';
import { Layout } from './components/Layout';
import { ClientesPage } from './pages/ClientesPage';

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

// Árbol de rutas
const routeTree = rootRoute.addChildren([indexRoute, clientesRoute]);

// Crear el router
export const router = createRouter({ routeTree });

// Registrar el router para tipado seguro
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
