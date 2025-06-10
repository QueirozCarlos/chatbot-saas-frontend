import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, Users, ShoppingCart, FileText, BarChart2 } from 'lucide-react';
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
  productName: string;
  quantity: number;
}

interface Report {
  id: number;
  title: string;
  type: string;
  createdAt: string;
  status: string;
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
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSalesPage, setCurrentSalesPage] = useState(1);
  const [currentProductsPage, setCurrentProductsPage] = useState(1);
  const [currentReportsPage, setCurrentReportsPage] = useState(1);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const salesPerPage = 5;
  const productsPerPage = 5;
  const reportsPerPage = 5;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchProducts();
    fetchSales();
    fetchReports();
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

  useEffect(() => {
    if (isHovering) {
      setIsSidebarOpen(true);
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    } else {
      const timeout = window.setTimeout(() => {
        setIsSidebarOpen(false);
      }, 300);
      setHoverTimeout(timeout);
    }

    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [isHovering]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports');
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Dados de relatórios inválidos recebidos do servidor');
      }
      setReports(response.data);
    } catch (err) {
      console.error('Erro ao buscar relatórios:', err);
      setError('Erro ao carregar relatórios. Por favor, tente novamente.');
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

  // Calcular índices para paginação dos relatórios
  const indexOfLastReport = currentReportsPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = reports.slice(indexOfFirstReport, indexOfLastReport);
  const totalReportsPages = Math.ceil(reports.length / reportsPerPage);

  // Função para mudar página dos relatórios
  const handleReportsPageChange = (pageNumber: number) => {
    setCurrentReportsPage(pageNumber);
  };

  const handleDownloadReport = async (type: 'sales' | 'products') => {
    try {
      setIsGeneratingReport(true);
      setError(null);

      const response = await api.get(`/reports/${type}`, {
        responseType: 'blob'
      });

      // Criar um link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio-${type === 'sales' ? 'vendas' : 'produtos'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Erro ao baixar relatório:', err);
      setError('Erro ao baixar relatório. Por favor, tente novamente.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Calcular índices para paginação dos produtos
  const indexOfLastProduct = currentProductsPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalProductsPages = Math.ceil(products.length / productsPerPage);

  // Função para mudar página dos produtos
  const handleProductsPageChange = (pageNumber: number) => {
    setCurrentProductsPage(pageNumber);
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Produtos</h2>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Ver todos
                </button>
              </div>
              {isLoading ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400">Carregando produtos...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400">Nenhum produto cadastrado</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {currentProducts.map((product) => (
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

                  {/* Paginação dos Produtos */}
                  {totalProductsPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Mostrando {indexOfFirstProduct + 1} a {Math.min(indexOfLastProduct, products.length)} de {products.length} produtos
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleProductsPageChange(currentProductsPage - 1)}
                          disabled={currentProductsPage === 1}
                          className="px-3 py-1 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Anterior
                        </button>
                        {Array.from({ length: totalProductsPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => handleProductsPageChange(page)}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                              currentProductsPage === page
                                ? 'bg-blue-600 text-white'
                                : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => handleProductsPageChange(currentProductsPage + 1)}
                          disabled={currentProductsPage === totalProductsPages}
                          className="px-3 py-1 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Próxima
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Atividades Recentes</h2>
              <div className="space-y-4">
                {[
                  { 
                    action: 'Venda realizada', 
                    details: 'Notebook Dell XPS 15" - R$ 8.999,00', 
                    time: '5 minutos atrás',
                    type: 'sale'
                  },
                  { 
                    action: 'Novo produto cadastrado', 
                    details: 'Mouse Wireless Logitech MX Master 3S', 
                    time: '1 hora atrás',
                    type: 'product'
                  },
                  { 
                    action: 'Estoque atualizado', 
                    details: 'Monitor LG 27" UltraGear - +15 unidades', 
                    time: '2 horas atrás',
                    type: 'stock'
                  },
                  { 
                    action: 'Pedido aprovado', 
                    details: 'Teclado Mecânico Keychron K8 Pro', 
                    time: '3 horas atrás',
                    type: 'order'
                  },
                  { 
                    action: 'Novo cliente cadastrado', 
                    details: 'João Silva - Empresa XYZ', 
                    time: '4 horas atrás',
                    type: 'customer'
                  },
                  { 
                    action: 'Relatório gerado', 
                    details: 'Relatório de Vendas - Março 2024', 
                    time: '5 horas atrás',
                    type: 'report'
                  }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'sale' ? 'bg-green-100 dark:bg-green-900/50' :
                        activity.type === 'product' ? 'bg-blue-100 dark:bg-blue-900/50' :
                        activity.type === 'stock' ? 'bg-yellow-100 dark:bg-yellow-900/50' :
                        activity.type === 'order' ? 'bg-purple-100 dark:bg-purple-900/50' :
                        activity.type === 'customer' ? 'bg-pink-100 dark:bg-pink-900/50' :
                        'bg-orange-100 dark:bg-orange-900/50'
                      }`}>
                        {activity.type === 'sale' ? <ShoppingCart className="h-4 w-4 text-green-600 dark:text-green-400" /> :
                         activity.type === 'product' ? <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" /> :
                         activity.type === 'stock' ? <TrendingUp className="h-4 w-4 text-yellow-600 dark:text-yellow-400" /> :
                         activity.type === 'order' ? <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" /> :
                         activity.type === 'customer' ? <Users className="h-4 w-4 text-pink-600 dark:text-pink-400" /> :
                         <BarChart2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{activity.details}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Ações Rápidas</h2>
              <div className="grid grid-cols-2 gap-4 h-[400px]">
                <button 
                  onClick={() => setIsNewProductModalOpen(true)}
                  className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors h-full"
                >
                  <Package className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
                  <span className="text-base font-medium text-gray-900 dark:text-white text-center">
                    Adicionar Produto
                  </span>
                </button>
                <button 
                  onClick={() => setIsNewSaleModalOpen(true)}
                  className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/50 rounded-lg hover:bg-green-100 dark:hover:bg-green-900 transition-colors h-full"
                >
                  <ShoppingCart className="h-12 w-12 text-green-600 dark:text-green-400 mb-4" />
                  <span className="text-base font-medium text-gray-900 dark:text-white text-center">
                    Nova Venda
                  </span>
                </button>
                <button 
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/50 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors h-full"
                >
                  <Users className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-4" />
                  <span className="text-base font-medium text-gray-900 dark:text-white text-center">
                    Gerenciar Clientes
                  </span>
                </button>
                <button 
                  onClick={() => setIsReportsModalOpen(true)}
                  className="flex flex-col items-center justify-center p-4 bg-orange-50 dark:bg-orange-900/50 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors h-full"
                >
                  <TrendingUp className="h-12 w-12 text-orange-600 dark:text-orange-400 mb-4" />
                  <span className="text-base font-medium text-gray-900 dark:text-white text-center">
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

            {/* Relatórios Recentes */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Relatórios Recentes</h2>
                <button
                  onClick={() => navigate('/reports')}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Ver todos
                </button>
              </div>
              <div className="space-y-4">
                {currentReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{report.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(report.createdAt).toLocaleDateString('pt-BR')} • {report.type}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {report.status}
                    </p>
                  </div>
                ))}
              </div>

              {/* Paginação dos Relatórios */}
              {totalReportsPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Mostrando {indexOfFirstReport + 1} a {Math.min(indexOfLastReport, reports.length)} de {reports.length} relatórios
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleReportsPageChange(currentReportsPage - 1)}
                      disabled={currentReportsPage === 1}
                      className="px-3 py-1 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    {Array.from({ length: totalReportsPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handleReportsPageChange(page)}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          currentReportsPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handleReportsPageChange(currentReportsPage + 1)}
                      disabled={currentReportsPage === totalReportsPages}
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