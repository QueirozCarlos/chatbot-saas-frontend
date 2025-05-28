import React, { useState, useEffect } from 'react';
import { DollarSign, Search, Plus, Filter, ArrowUpDown } from 'lucide-react';
import { SidebarSimple } from '@phosphor-icons/react';
import NewSaleModal from '../components/NewSaleModal';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { salesService } from '../services/salesService';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

interface Sale {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  totalValue: number;
  saleDate: string;
  customerName: string;
  sellerName: string;
  status?: string;
}

interface NewSale {
  productId: number;
  quantity: number;
  totalValue: number;
  saleDate: string;
  customerName: string;
  sellerName: string;
}

export default function Sales() {
  const { api } = useAuth();
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Sale>('saleDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [dateFilter, setDateFilter] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<number | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isCancelling, setIsCancelling] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Alterado para 20 itens por página

  useEffect(() => {
    fetchSales();
  }, [retryCount]);

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Iniciando busca de vendas...');
      const response = await api.get('/sales');
      console.log('Resposta da API:', response.data);
      
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Dados inválidos recebidos da API:', response.data);
        setError('Dados inválidos recebidos do servidor');
        return;
      }

      const mappedSales = response.data.map((sale: any) => ({
        id: sale.id,
        productId: sale.productId,
        quantity: parseInt(sale.quantity) || 0,
        totalValue: parseFloat(sale.totalValue) || 0,
        saleDate: sale.saleDate,
        customerName: sale.customerName || 'Cliente não informado',
        sellerName: sale.sellerName || 'Vendedor não informado',
        productName: sale.productName || 'Produto não informado',
        status: sale.status
      }));

      console.log('Vendas mapeadas:', mappedSales);
      setSales(mappedSales);
    } catch (err) {
      console.error('Erro ao buscar vendas:', err);
      setError('Erro ao carregar vendas. Por favor, tente novamente.');
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

  const handleAddSale = async (newSale: NewSale) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Nova venda recebida do modal:', newSale);
      
      const response = await api.post('/sales', newSale);
      console.log('Resposta da API ao adicionar venda:', response.data);
      
      const saleWithDefaults = {
        ...response.data,
        customerName: response.data.customerName || 'Cliente não informado',
        sellerName: response.data.sellerName || 'Vendedor não informado',
        productName: response.data.productName || 'Produto não informado'
      };
      
      setSales([...sales, saleWithDefaults]);
      setIsNewSaleModalOpen(false);
    } catch (err) {
      console.error('Erro ao adicionar venda:', err);
      setError('Erro ao criar venda. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleCancelSale = async (saleId: number) => {
    try {
      setIsCancelling(saleId);
      const updatedSale = await salesService.cancelSale(saleId);
      // Atualizar a venda na lista com o novo status
      const updatedSales = sales.map(sale => 
        sale.id === saleId ? { ...sale, status: 'CANCELED' } : sale
      );
      setSales(updatedSales);
      toast.success('Venda cancelada com sucesso!');
    } catch (error: any) {
      console.error('Erro detalhado no cancelamento:', {
        saleId,
        error: error.message,
        stack: error.stack
      });
      toast.error(error.message || 'Erro ao cancelar venda. Por favor, tente novamente.');
    } finally {
      setIsCancelling(null);
    }
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.sellerName.toLowerCase().includes(searchTerm.toLowerCase());

    if (dateFilter === 'all') return matchesSearch;
    
    const saleDate = new Date(sale.saleDate);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    switch (dateFilter) {
      case 'today':
        return matchesSearch && saleDate.toDateString() === today.toDateString();
      case 'yesterday':
        return matchesSearch && saleDate.toDateString() === yesterday.toDateString();
      case 'week':
        return matchesSearch && saleDate >= lastWeek;
      case 'month':
        return matchesSearch && saleDate >= lastMonth;
      default:
        return matchesSearch;
    }
  }).sort((a, b) => {
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

  const totalAmount = filteredSales.reduce((sum, sale) => sum + sale.totalValue, 0);
  const totalItems = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);

  const handleSort = (field: keyof Sale) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Calcular índices para paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSales.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Toaster position="top-right" />
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
                  className="fixed left-0 top-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 z-50"
                  aria-label={isSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
                >
                  <SidebarSimple className="h-6 w-6 text-gray-600 dark:text-gray-300" weight="duotone" />
                </button>
                <h1 className="ml-3 text-2xl font-bold text-gray-900 dark:text-white">Vendas</h1>
              </div>
              <button
                onClick={() => setIsNewSaleModalOpen(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nova Venda
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total de Vendas</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600 dark:text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Itens Vendidos</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalItems}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Média por Venda</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {(totalAmount / filteredSales.length || 0).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 max-w-md relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar vendas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
                    >
                      <option value="all">Todas as datas</option>
                      <option value="today">Hoje</option>
                      <option value="yesterday">Ontem</option>
                      <option value="week">Última semana</option>
                      <option value="month">Último mês</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando vendas...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Tentar Novamente
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="overflow-x-auto">
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
                          className="text-right text-sm font-medium text-gray-500 dark:text-gray-400 pb-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                          onClick={() => handleSort('quantity')}
                        >
                          <div className="flex items-center justify-end">
                            Quantidade
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                            {sortField === 'quantity' && (
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
                        <th className="text-right text-sm font-medium text-gray-500 dark:text-gray-400 pb-3">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((sale) => (
                        <tr key={sale.id} className="border-t border-gray-200 dark:border-gray-700">
                          <td className="py-3 text-sm text-gray-900 dark:text-gray-300">
                            {new Date(sale.saleDate).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3 text-sm text-gray-900 dark:text-gray-300">{sale.customerName}</td>
                          <td className="py-3 text-sm text-gray-900 dark:text-gray-300">{sale.sellerName}</td>
                          <td className="py-3 text-sm text-gray-900 dark:text-gray-300">{sale.productName}</td>
                          <td className="py-3 text-sm text-right text-gray-900 dark:text-gray-300">{sale.quantity}</td>
                          <td className="py-3 text-sm text-right text-gray-900 dark:text-gray-300">
                            {sale.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                          <td className="py-3 text-sm text-right">
                            <button
                              onClick={() => {/* TODO: Implementar detalhes */}}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mr-3"
                            >
                              Detalhes
                            </button>
                            <button 
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                              onClick={() => handleCancelSale(sale.id)}
                              disabled={isCancelling === sale.id || sale.status === 'CANCELED'}
                            >
                              {isCancelling === sale.id ? 'Cancelando...' : 'Cancelar'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredSales.length)} de {filteredSales.length} vendas
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-md text-sm font-medium ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Próxima
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <NewSaleModal
            isOpen={isNewSaleModalOpen}
            onClose={() => setIsNewSaleModalOpen(false)}
            onSave={handleAddSale}
          />
        </main>
      </div>
    </div>
  );
}