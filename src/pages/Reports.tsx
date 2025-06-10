import React, { useState, useEffect } from 'react';
import { BarChart, LineChart, PieChart, Download, Package, Users, ShoppingCart, ArrowUpDown, FileText, TrendingUp, BarChart2 } from 'lucide-react';
import { SidebarSimple } from '@phosphor-icons/react';
import Sidebar from '../components/Sidebar';
import ReportsModal from '../components/ReportsModal';
import { api, useAuth } from '../contexts/AuthContext';
import FloatActionButton from '../components/FloatActionButton';
import { salesService, Sale } from '../services/salesService';
import { toast } from 'react-hot-toast';

interface ReportCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

function ReportCard({ title, value, icon, trend }: ReportCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value} em relação ao mês anterior
            </p>
          )}
        </div>
        <div className="text-blue-600 dark:text-blue-400">{icon}</div>
      </div>
    </div>
  );
}

const Reports: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<number | null>(null);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Sale>('saleDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTopProductsPage, setCurrentTopProductsPage] = useState(1);
  const itemsPerPage = 10;
  const topProductsPerPage = 5;

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const salesData = await salesService.getAllSales();
      setSales(salesData);
    } catch (err) {
      console.error('Erro ao buscar vendas:', err);
      setError('Erro ao carregar vendas. Por favor, tente novamente.');
      toast.error('Erro ao carregar vendas. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleGenerateReport = async (type: string) => {
    try {
      // TODO: Implement report generation logic
      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório. Por favor, tente novamente.');
    }
  };

  const handleSort = (field: keyof Sale) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedSales = [...sales].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc'
      ? Number(aValue) - Number(bValue)
      : Number(bValue) - Number(aValue);
  });

  // Calculate summary statistics
  const totalSales = sales.reduce((sum, sale) => sum + sale.totalValue, 0);
  const totalItems = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const averageTicket = sales.length > 0 ? totalSales / sales.length : 0;

  // Calculate total sales change for current and previous month
  const calculateTotalSalesChange = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get sales for current month
    const currentMonthSales = sales.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });
    
    // Get sales for previous month
    const previousMonthSales = sales.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return saleDate.getMonth() === prevMonth && saleDate.getFullYear() === prevYear;
    });

    // Calculate totals
    const currentMonthTotal = currentMonthSales.reduce((sum, sale) => sum + sale.totalValue, 0);
    const previousMonthTotal = previousMonthSales.reduce((sum, sale) => sum + sale.totalValue, 0);

    // Calculate percentage change
    if (previousMonthTotal === 0) return { value: '0%', isPositive: true };
    
    const percentageChange = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
    const roundedPercentage = Math.abs(Math.round(percentageChange * 10) / 10);
    
    return {
      value: `${roundedPercentage}%`,
      isPositive: percentageChange >= 0
    };
  };

  const totalSalesChange = calculateTotalSalesChange();

  // Calculate average ticket for current and previous month
  const calculateAverageTicketChange = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get sales for current month
    const currentMonthSales = sales.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });
    
    // Get sales for previous month
    const previousMonthSales = sales.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return saleDate.getMonth() === prevMonth && saleDate.getFullYear() === prevYear;
    });

    // Calculate averages
    const currentMonthTotal = currentMonthSales.reduce((sum, sale) => sum + sale.totalValue, 0);
    const previousMonthTotal = previousMonthSales.reduce((sum, sale) => sum + sale.totalValue, 0);
    
    const currentMonthAverage = currentMonthSales.length > 0 ? currentMonthTotal / currentMonthSales.length : 0;
    const previousMonthAverage = previousMonthSales.length > 0 ? previousMonthTotal / previousMonthSales.length : 0;

    // Calculate percentage change
    if (previousMonthAverage === 0) return { value: '0%', isPositive: true };
    
    const percentageChange = ((currentMonthAverage - previousMonthAverage) / previousMonthAverage) * 100;
    const roundedPercentage = Math.abs(Math.round(percentageChange * 10) / 10);
    
    return {
      value: `${roundedPercentage}%`,
      isPositive: percentageChange >= 0
    };
  };

  const averageTicketChange = calculateAverageTicketChange();

  // Calcular índices para paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedSales.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedSales.length / itemsPerPage);

  // Calcular índices para paginação dos produtos mais vendidos
  const indexOfLastTopProduct = currentTopProductsPage * topProductsPerPage;
  const indexOfFirstTopProduct = indexOfLastTopProduct - topProductsPerPage;
  const currentTopProducts = sales.slice(indexOfFirstTopProduct, indexOfLastTopProduct);
  const totalTopProductsPages = Math.ceil(sales.length / topProductsPerPage);

  // Função para mudar de página
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Função para mudar página dos produtos mais vendidos
  const handleTopProductsPageChange = (pageNumber: number) => {
    setCurrentTopProductsPage(pageNumber);
  };

  const handleDownloadProducts = async () => {
    try {
      const response = await api.get('/reports/products', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'products.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Arquivo de produtos baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar produtos:', error);
      toast.error('Erro ao baixar produtos. Por favor, tente novamente.');
    }
  };

  const handleDownloadSales = async () => {
    try {
      const response = await api.get('/reports/sales', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sales.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Arquivo de vendas baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar vendas:', error);
      toast.error('Erro ao baixar vendas. Por favor, tente novamente.');
    }
  };

  if (!isAuthenticated) {
    return null;
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
                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-500 ml-2" />
                <h1 className="ml-3 text-2xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando dados...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={fetchSales}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Tentar Novamente
              </button>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <ReportCard
                  title="Total de Vendas"
                  value={totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  icon={<BarChart className="h-6 w-6 sm:h-8 sm:w-8" />}
                  trend={totalSalesChange}
                />
                <ReportCard
                  title="Itens Vendidos"
                  value={totalItems.toString()}
                  icon={<LineChart className="h-6 w-6 sm:h-8 sm:w-8" />}
                  trend={{ value: '5%', isPositive: true }}
                />
                <ReportCard
                  title="Ticket Médio"
                  value={averageTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  icon={<PieChart className="h-6 w-6 sm:h-8 sm:w-8" />}
                  trend={averageTicketChange}
                />
              </div>

              {/* Sales by Period */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vendas por Período</h2>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                          <tr>
                            <th 
                              className="px-3 sm:px-6 text-left text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 pb-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                              onClick={() => handleSort('saleDate')}
                            >
                              <div className="flex items-center">
                                Data
                                <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                                {sortField === 'saleDate' && (
                                  <span className="ml-1 text-xs">
                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                  </span>
                                )}
                              </div>
                            </th>
                            <th 
                              className="px-3 sm:px-6 text-left text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 pb-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                              onClick={() => handleSort('productName')}
                            >
                              <div className="flex items-center">
                                Produto
                                <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                                {sortField === 'productName' && (
                                  <span className="ml-1 text-xs">
                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                  </span>
                                )}
                              </div>
                            </th>
                            <th 
                              className="hidden sm:table-cell px-3 sm:px-6 text-left text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 pb-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                              onClick={() => handleSort('sellerName')}
                            >
                              <div className="flex items-center">
                                Vendedor
                                <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                                {sortField === 'sellerName' && (
                                  <span className="ml-1 text-xs">
                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                  </span>
                                )}
                              </div>
                            </th>
                            <th 
                              className="hidden md:table-cell px-3 sm:px-6 text-left text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 pb-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                              onClick={() => handleSort('customerName')}
                            >
                              <div className="flex items-center">
                                Cliente
                                <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                                {sortField === 'customerName' && (
                                  <span className="ml-1 text-xs">
                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                  </span>
                                )}
                              </div>
                            </th>
                            <th 
                              className="px-3 sm:px-6 text-right text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 pb-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                              onClick={() => handleSort('totalValue')}
                            >
                              <div className="flex items-center justify-end">
                                Total
                                <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                                {sortField === 'totalValue' && (
                                  <span className="ml-1 text-xs">
                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                  </span>
                                )}
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {currentItems.map((sale) => (
                            <tr key={sale.id}>
                              <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-900 dark:text-gray-300 whitespace-nowrap">
                                {new Date(sale.saleDate).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-900 dark:text-gray-300">
                                {sale.productName}
                              </td>
                              <td className="hidden sm:table-cell px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-900 dark:text-gray-300">
                                {sale.sellerName}
                              </td>
                              <td className="hidden md:table-cell px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-900 dark:text-gray-300">
                                {sale.customerName}
                              </td>
                              <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-right text-gray-900 dark:text-gray-300 whitespace-nowrap">
                                {sale.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, sortedSales.length)} de {sortedSales.length} vendas
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-2 sm:px-3 py-1 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-2 sm:px-3 py-1 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Próxima
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Top Products */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Produtos Mais Vendidos</h2>
                <div className="space-y-4">
                  {currentTopProducts.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{sale.productName}</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{sale.quantity} unidades vendidas</p>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                        {sale.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Paginação dos Produtos Mais Vendidos */}
                {totalTopProductsPages > 1 && (
                  <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Mostrando {indexOfFirstTopProduct + 1} a {Math.min(indexOfLastTopProduct, sales.length)} de {sales.length} produtos
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      <button
                        onClick={() => handleTopProductsPageChange(currentTopProductsPage - 1)}
                        disabled={currentTopProductsPage === 1}
                        className="px-2 sm:px-3 py-1 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      {Array.from({ length: totalTopProductsPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handleTopProductsPageChange(page)}
                          className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium ${
                            currentTopProductsPage === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => handleTopProductsPageChange(currentTopProductsPage + 1)}
                        disabled={currentTopProductsPage === totalTopProductsPages}
                        className="px-2 sm:px-3 py-1 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Próxima
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <button
              onClick={handleDownloadProducts}
              className="group flex items-center justify-center gap-3 px-6 py-3 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Download className="w-5 h-5 group-hover:animate-bounce" />
              <span className="font-medium">Baixar Produtos</span>
            </button>
            
            <button
              onClick={handleDownloadSales}
              className="group flex items-center justify-center gap-3 px-6 py-3 text-sm sm:text-base bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Download className="w-5 h-5 group-hover:animate-bounce" />
              <span className="font-medium">Baixar Vendas</span>
            </button>
          </div>
        </main>
      </div>

      <ReportsModal
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
      />
    </div>
  );
};

export default Reports;