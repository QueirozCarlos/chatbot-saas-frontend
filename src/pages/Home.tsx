import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, Users, ShoppingCart } from 'lucide-react';
import { SidebarSimple } from '@phosphor-icons/react';
import Sidebar from '../components/Sidebar';
import NewProductModal from '../components/NewProductModal';
import NewSaleModal from '../components/NewSaleModal';
import ReportsModal from '../components/ReportsModal';
import CustomerManagementModal from '../components/CustomerManagementModal';
import QuickActions from '../components/QuickActions';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
}

interface Sale {
  id: number;
  totalValue: number;
  saleDate: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      </div>
      {icon}
    </div>
  </div>
);

const Home: React.FC = () => {
  const { api, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<number | null>(null);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSalesPage, setCurrentSalesPage] = useState(1);
  const salesPerPage = 5;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchProducts();
    fetchSales();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        if (response.data && Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          console.error('Dados de categorias inválidos:', response.data);
          setCategories([]);
        }
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/products');
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Dados inválidos recebidos do servidor');
      }
      setProducts(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      setError('Erro ao carregar produtos. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await api.get('/sales');
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Dados de vendas inválidos recebidos do servidor');
      }
      setSales(response.data);
    } catch (err) {
      console.error('Erro ao buscar vendas:', err);
      setError('Erro ao carregar vendas. Por favor, tente novamente.');
    }
  };

  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const response = await api.post('/api/products', productData);
      setProducts([...products, response.data]);
      setIsNewProductModalOpen(false);
      setError(null);
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      setError('Erro ao adicionar produto. Por favor, tente novamente.');
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

  const getProductsAddedToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return products.filter(product => {
      const productDate = new Date(product.createdAt);
      return productDate >= today;
    }).length;
  };

  const calculateMonthlySales = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filtra vendas do mês atual
    const currentMonthSales = sales.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });

    // Filtra vendas do mês anterior
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastMonthSales = sales.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      return saleDate.getMonth() === lastMonth && saleDate.getFullYear() === lastMonthYear;
    });

    // Calcula total do mês atual
    const currentMonthTotal = currentMonthSales.reduce((sum, sale) => sum + sale.totalValue, 0);

    // Calcula total do mês anterior
    const lastMonthTotal = lastMonthSales.reduce((sum, sale) => sum + sale.totalValue, 0);

    // Calcula a porcentagem de crescimento
    let growthPercentage = 0;
    if (lastMonthTotal > 0) {
      growthPercentage = ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
    } else if (currentMonthTotal > 0) {
      growthPercentage = 100; // Se não havia vendas no mês anterior, mas há neste mês
    }

    return {
      currentMonthTotal,
      growthPercentage
    };
  };

  // Calcular índices para paginação das vendas
  const indexOfLastSale = currentSalesPage * salesPerPage;
  const indexOfFirstSale = indexOfLastSale - salesPerPage;
  const currentSales = sales.slice(indexOfFirstSale, indexOfLastSale);
  const totalSalesPages = Math.ceil(sales.length / salesPerPage);

  // Função para mudar página das vendas
  const handleSalesPageChange = (pageNumber: number) => {
    setCurrentSalesPage(pageNumber);
  };

  if (!isAuthenticated) {
    return null; // O redirecionamento será tratado pelo useEffect
  }

  if (isLoading) {
    return <div>Carregando...</div>;
  }

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

              {/* <button
                  id="menu-button"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  className="fixed left-0 top-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 z-50"
                  aria-label={isSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
                >
                  <SidebarSimple className="h-6 w-6 text-gray-600 dark:text-gray-300" weight="duotone" />
                </button> */}
                <button
                  id="menu-button"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
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
          {error && (
            <div className="mb-8 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total de Produtos"
              value={products.length}
              icon={<Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
              description={`${getProductsAddedToday()} produtos adicionados hoje`}
            />
            <StatCard
              title="Vendas Mensais"
              value={calculateMonthlySales().currentMonthTotal.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
              icon={<TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />}
              description={`${calculateMonthlySales().growthPercentage.toFixed(1)}% ${calculateMonthlySales().growthPercentage >= 0 ? 'acima' : 'abaixo'} do mês anterior`}
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
            {/* Products List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Produtos</h2>
              {isLoading ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400">Carregando produtos...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400">Nenhum produto cadastrado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{product.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">R$ {product.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Categoria: {product.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
                <button 
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="p-4 bg-purple-50 dark:bg-purple-900/50 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
                >
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

            {/* Vendas Recentes */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Vendas Recentes</h2>
                <button
                  onClick={() => navigate('/reports')}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Ver todas
                </button>
              </div>
              <div className="space-y-4">
                {currentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{sale.productName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(sale.saleDate).toLocaleDateString('pt-BR')} • {sale.quantity} unidades
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {sale.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                ))}
              </div>

              {/* Paginação das Vendas */}
              {totalSalesPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Mostrando {indexOfFirstSale + 1} a {Math.min(indexOfLastSale, sales.length)} de {sales.length} vendas
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSalesPageChange(currentSalesPage - 1)}
                      disabled={currentSalesPage === 1}
                      className="px-3 py-1 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    {Array.from({ length: totalSalesPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handleSalesPageChange(page)}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          currentSalesPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handleSalesPageChange(currentSalesPage + 1)}
                      disabled={currentSalesPage === totalSalesPages}
                      className="px-3 py-1 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <NewProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
        onAddProduct={handleAddProduct}
        categories={categories}
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

      <CustomerManagementModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
      />

      <QuickActions />
    </div>
  );
};

export default Home;