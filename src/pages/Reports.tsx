import React, { useState, useEffect } from 'react';
import { BarChart, LineChart, PieChart, Download, Package, Users, ShoppingCart, ArrowUpDown } from 'lucide-react';
import { SidebarSimple } from '@phosphor-icons/react';
import Sidebar from '../components/Sidebar';
import { api } from '../contexts/AuthContext';
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

export default function Reports() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<number | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Sale>('saleDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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
      }, 300); // Delay before closing
      setHoverTimeout(timeout);
    }

    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [isHovering]);

  const handleGenerateReport = async (type: string) => {
    try {
      setIsGeneratingReport(true);
      // TODO: Implement report generation logic
      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório. Por favor, tente novamente.');
    } finally {
      setIsGeneratingReport(false);
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
                <h1 className="ml-3 text-2xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Relatórios</h1>

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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <ReportCard
                  title="Total de Vendas"
                  value={totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  icon={<BarChart className="h-8 w-8" />}
                  trend={totalSalesChange}
                />
                <ReportCard
                  title="Itens Vendidos"
                  value={totalItems.toString()}
                  icon={<LineChart className="h-8 w-8" />}
                  trend={{ value: '5%', isPositive: true }}
                />
                <ReportCard
                  title="Ticket Médio"
                  value={averageTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  icon={<PieChart className="h-8 w-8" />}
                  trend={averageTicketChange}
                />
              </div>

              {/* Sales by Period */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vendas por Período</h2>
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th 
                        className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 pb-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() => handleSort('saleDate')}
                      >
                        <div className="flex items-center">
                          Data
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                          {sortField === 'saleDate' && (
                            <span className="ml-1 text-xs">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 pb-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() => handleSort('productName')}
                      >
                        <div className="flex items-center">
                          Produto
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                          {sortField === 'productName' && (
                            <span className="ml-1 text-xs">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 pb-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() => handleSort('sellerName')}
                      >
                        <div className="flex items-center">
                          Vendedor
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                          {sortField === 'sellerName' && (
                            <span className="ml-1 text-xs">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 pb-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() => handleSort('customerName')}
                      >
                        <div className="flex items-center">
                          Cliente
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                          {sortField === 'customerName' && (
                            <span className="ml-1 text-xs">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="text-right text-sm font-medium text-gray-500 dark:text-gray-400 pb-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() => handleSort('totalValue')}
                      >
                        <div className="flex items-center justify-end">
                          Total
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                          {sortField === 'totalValue' && (
                            <span className="ml-1 text-xs">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSales.map((sale) => (
                      <tr key={sale.id} className="border-t border-gray-200 dark:border-gray-700">
                        <td className="py-3 text-sm text-gray-900 dark:text-gray-300">
                          {new Date(sale.saleDate).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 text-sm text-gray-900 dark:text-gray-300">{sale.productName}</td>
                        <td className="py-3 text-sm text-gray-900 dark:text-gray-300">{sale.sellerName}</td>
                        <td className="py-3 text-sm text-gray-900 dark:text-gray-300">{sale.customerName}</td>
                        <td className="py-3 text-sm text-right text-gray-900 dark:text-gray-300">
                          {sale.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Top Products */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Produtos Mais Vendidos</h2>
                <div className="space-y-4">
                  {sales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{sale.productName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{sale.quantity} unidades vendidas</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {sale.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <FloatActionButton
            icon={<Download className="h-6 w-6" />}
            items={[
              {
                label: 'Relatório de Vendas',
                onClick: () => handleGenerateReport('vendas'),
                icon: <ShoppingCart className="h-4 w-4" />
              },
              {
                label: 'Relatório de Produtos',
                onClick: () => handleGenerateReport('produtos'),
                icon: <Package className="h-4 w-4" />
              },
              {
                label: 'Relatório de Clientes',
                onClick: () => handleGenerateReport('clientes'),
                icon: <Users className="h-4 w-4" />
              }
            ]}
            isLoading={isGeneratingReport}
            position="bottom-right"
          />
        </main>
      </div>
    </div>
  );
}