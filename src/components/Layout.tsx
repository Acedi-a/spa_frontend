import React from 'react';
import { Link, Outlet } from '@tanstack/react-router';
import { 
  Users, 
  LogOut, 
  Menu,
  Bell,
  FolderOpen,
  Calendar,
  CalendarDays,
  UserCheck,
  Package,
  Scissors,
  ShoppingCart,
  BarChart3,
  Settings as SettingsIcon,
} from 'lucide-react';

const SidebarItem = ({ 
  to, 
  icon: Icon, 
  label, 
}: { 
  to: string; 
  icon: React.ElementType; 
  label: string; 
}) => {
  return (
    <Link
      to={to}
      activeProps={{
        className: 'bg-white/10 text-white shadow-lg backdrop-blur-sm',
      }}
      inactiveProps={{
        className: 'text-slate-400 hover:bg-white/5 hover:text-white',
      }}
      className="flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 group"
    >
      {({ isActive }) => (
        <>
          <Icon size={20} className={`transition-transform group-hover:scale-110 ${isActive ? 'text-blue-400' : ''}`} />
          <span className="font-medium tracking-wide">{label}</span>
          {isActive && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
          )}
        </>
      )}
    </Link>
  );
};

export const Layout = () => {
  // En una app real, usaríamos useLocation del router para determinar activo
  // Por ahora simulamos o dejamos que el Link de TanStack Router maneje la clase activeProps si se configura
  
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
        {/* Logo Area */}
        <div className="p-8 flex items-center gap-3 border-b border-slate-800/50">
          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-xl font-bold text-white">S</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">SPA System</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Enterprise</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8 space-y-1 overflow-y-auto">
          <div className="px-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Gestión
          </div>
          <SidebarItem to="/clientes" icon={Users} label="Clientes" />
          <SidebarItem to="/citas" icon={Calendar} label="Citas" />
          <SidebarItem to="/calendario" icon={CalendarDays} label="Calendario" />
          <SidebarItem to="/ventas" icon={ShoppingCart} label="Ventas" />
          
          <div className="px-6 mt-8 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Catálogo
          </div>
          <SidebarItem to="/productos" icon={Package} label="Productos" />
          <SidebarItem to="/servicios" icon={Scissors} label="Servicios" />
          <SidebarItem to="/categorias" icon={FolderOpen} label="Categorías" />
          
          <div className="px-6 mt-8 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Personal
          </div>
          <SidebarItem to="/empleadas" icon={UserCheck} label="Empleadas" />
          
          <div className="px-6 mt-8 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Análisis
          </div>
          <SidebarItem to="/reportes" icon={BarChart3} label="Reportes" />
          
          <div className="px-6 mt-8 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Sistema
          </div>
          <SidebarItem to="/ajustes" icon={SettingsIcon} label="Ajustes" />
        </nav>

        {/* User Profile / Footer */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
          <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/5 transition-colors text-left group">
            <img 
              src="https://ui-avatars.com/api/?name=Admin+User&background=3b82f6&color=fff" 
              alt="User" 
              className="w-10 h-10 rounded-full border-2 border-slate-700 group-hover:border-blue-500 transition-colors"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Administrador</p>
              <p className="text-xs text-slate-500 truncate">admin@sistema.com</p>
            </div>
            <LogOut size={18} className="text-slate-500 group-hover:text-red-400 transition-colors" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50 relative">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors lg:hidden">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-semibold text-slate-800">
              Bienvenido de nuevo
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
