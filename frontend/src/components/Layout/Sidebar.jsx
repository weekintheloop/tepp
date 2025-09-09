import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  Bus,
  MapPin,
  AlertTriangle,
  BarChart3,
  Settings,
  LogOut,
  X,
  Sun,
  Moon
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, hasPermission } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      permission: 'view_dashboard'
    },
    {
      name: 'Alunos',
      href: '/alunos',
      icon: GraduationCap,
      permission: 'view_alunos'
    },
    {
      name: 'Rotas',
      href: '/rotas',
      icon: MapPin,
      permission: 'view_rotas'
    },
    {
      name: 'Escolas',
      href: '/escolas',
      icon: School,
      permission: 'view_escolas'
    },
    {
      name: 'Veículos',
      href: '/veiculos',
      icon: Bus,
      permission: 'view_veiculos'
    },
    {
      name: 'Frequência',
      href: '/frequencia',
      icon: Users,
      permission: 'view_frequencia'
    },
    {
      name: 'Ocorrências',
      href: '/ocorrencias',
      icon: AlertTriangle,
      permission: 'view_ocorrencias'
    },
    {
      name: 'Relatórios',
      href: '/relatorios',
      icon: BarChart3,
      permission: 'view_relatorios'
    },
    {
      name: 'Configurações',
      href: '/configuracoes',
      icon: Settings,
      permission: 'manage_configuracoes'
    }
  ];

  const filteredNavigation = navigationItems.filter(item => 
    hasPermission(item.permission)
  );

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Bus className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold sigte-logo">SIG-TE</h1>
                <p className="text-xs text-muted-foreground">Transport System</p>
              </div>
            </div>
            
            {/* Close button (mobile only) */}
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-muted lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className={cn(
                    'w-5 h-5 mr-3 transition-colors',
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  )} />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 mr-3" />
              ) : (
                <Moon className="w-5 h-5 mr-3" />
              )}
              {theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}
            </button>

            {/* User Info */}
            <div className="flex items-center px-3 py-2 rounded-lg bg-muted/50">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm font-semibold text-primary-foreground">
                {user?.nome?.charAt(0)?.toUpperCase()}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.nome}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;