import { useEffect, useState } from 'react';
import { Menu, X, Home, Package, DollarSign, Settings, BarChart2, LogOut, ShoppingCart, FileText, Users } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onHover: (isHovering: boolean) => void;
}

export default function Sidebar({ isOpen, onClose, onHover }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const menuItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/dashboard', icon: BarChart2, label: 'Dashboard' },
    { path: '/sales', icon: ShoppingCart, label: 'Vendas' },
    { path: '/reports', icon: FileText, label: 'Relatórios' },
    { path: '/settings', icon: Settings, label: 'Configurações' },
    { path: '/customers', icon: Users, label: 'Clientes' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-50 z-20' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out z-30 flex flex-col`}
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
      >
        <div className="p-4 flex justify-between items-center border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                location.pathname === item.path
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/70 hover:text-blue-700 dark:hover:text-blue-400 hover:scale-[1.02]'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/70 hover:scale-[1.02]"
          >
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Sistema de Gestão v1.0
          </p>
        </div>
      </div>
    </>
  );
}