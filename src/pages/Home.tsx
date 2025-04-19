import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, Users, ShoppingCart } from 'lucide-react';
import { SidebarSimple } from '@phosphor-icons/react';
import Sidebar from '../components/Sidebar';
import NewProductModal from '../components/NewProductModal';
import NewSaleModal from '../components/NewSaleModal';
import ReportsModal from '../components/ReportsModal';
import { api } from '../contexts/AuthContext';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}

interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
  category: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<number | null>(null);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (isHovering) {
      setIsSidebarOpen(true);
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    } else {
      const timeout = window.setTimeout(() => {
        setIsSidebarOpen(false);
      }, 300); // Delay before closing
      setHoverTimeout(timeout);
    }

    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [isHovering]);

  const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    try {
      const response = await api.post('/products', newProduct);
      setProducts([...products, response.data]);
      setIsNewProductModalOpen(false);
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  const handleAddSale = async (sale: {
    customerName: string;
    productName: string;
    quantity: number;
    total: number;
  }) => {
    try {
      await api.post('/sales', sale);
      setIsNewSaleModalOpen(false);
    } catch (err) {
      console.error('Error adding sale:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onHover={setIsHovering}
      />

      <div className="flex-1 min-h-screen">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <button
                  id="menu-button"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  className="fixed left-0 top-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 z-50"
                  aria-label={isSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
                >
                  <SidebarSimple className="h-6 w-6 text-gray-600 dark:text-gray-300" weight="duotone" />
                </button>
                <h1 className="ml-3 text-2xl font-bold text-gray-900 dark:text-white">Visão Geral</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Visão Geral</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total de Produtos"
              value="248"
              icon={<Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
              description="12 produtos adicionados hoje"
            />
            <StatCard
              title="Vendas Mensais"
              value="R$ 45.680,00"
              icon={<TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />}
              description="15% acima do mês anterior"
            />
            <StatCard
              title="Clientes Ativos"
              value="1,345"
              icon={<Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
              description="48 novos clientes esta semana"
            />
            <StatCard
              title="Pedidos Pendentes"
              value="28"
              icon={<ShoppingCart className="h-6 w-6 text-orange-600 dark:text-orange-400" />}
              description="5 pedidos aguardando aprovação"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Atividades Recentes</h2>
              <div className="space-y-4">
                {[
                  { action: 'Venda realizada', details: 'Notebook Dell XPS', time: '5 minutos atrás' },
                  { action: 'Novo produto', details: 'Mouse Wireless', time: '1 hora atrás' },
                  { action: 'Estoque atualizado', details: 'Monitor LG 27"', time: '2 horas atrás' },
                  { action: 'Pedido aprovado', details: 'Teclado Mecânico', time: '3 horas atrás' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{activity.details}</p>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Ações Rápidas</h2>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setIsNewProductModalOpen(true)}
                  className="p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                >
                  <Package className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white block text-center">
                    Adicionar Produto
                  </span>
                </button>
                <button 
                  onClick={() => setIsNewSaleModalOpen(true)}
                  className="p-4 bg-green-50 dark:bg-green-900/50 rounded-lg hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
                >
                  <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white block text-center">
                    Nova Venda
                  </span>
                </button>
                <button className="p-4 bg-purple-50 dark:bg-purple-900/50 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white block text-center">
                    Gerenciar Clientes
                  </span>
                </button>
                <button 
                  onClick={() => setIsReportsModalOpen(true)}
                  className="p-4 bg-orange-50 dark:bg-orange-900/50 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors"
                >
                  <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white block text-center">
                    Ver Relatórios
                  </span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <NewProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
        onSave={handleAddProduct}
      />

      <NewSaleModal
        isOpen={isNewSaleModalOpen}
        onClose={() => setIsNewSaleModalOpen(false)}
        onSave={handleAddSale}
      />

      <ReportsModal
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
      />
    </div>
  );
}