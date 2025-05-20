import React, { useState, useEffect } from 'react';
import { BarChart, LineChart, PieChart, Download, Package, Users, ShoppingCart } from 'lucide-react';
import { SidebarSimple } from '@phosphor-icons/react';
import Sidebar from '../components/Sidebar';
import { api } from '../contexts/AuthContext';
import FloatActionButton from '../components/FloatActionButton';

interface Sale {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  date: string;
  customerName: string;
  sellerName: string;
}

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

  // Mock data - replace with real data in production
  const mockSales: Sale[] = [
    {
      id: 1,
      productId: 1,
      productName: "Notebook Dell",
      quantity: 2,
      price: 4500,
      total: 9000,
      date: "2024-03-15",
      customerName: "João Silva",
      sellerName: "Maria Santos"
    },
    {
      id: 2,
      productId: 2,
      productName: "Mouse Wireless",
      quantity: 5,
      price: 89.90,
      total: 449.50,
      date: "2024-03-16",
      customerName: "Pedro Oliveira",
      sellerName: "Maria Santos"
    }
  ];

  // Calculate summary statistics
  const totalSales = mockSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalItems = mockSales.reduce((sum, sale) => sum + sale.quantity, 0);
  const averageTicket = totalSales / mockSales.length;

  const handleGenerateReport = async (type: 'vendas' | 'produtos' | 'clientes' | 'estoque') => {
    setIsGeneratingReport(true);
    try {
      const response = await api.get(`/reports/${type}/download`, {
        responseType: 'blob'
      });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a link element
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio-${type}-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      // Append to body, click and remove
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setIsGeneratingReport(false);
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
                <h1 className="ml-3 text-2xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Relatórios</h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <ReportCard
              title="Total de Vendas"
              value={totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              icon={<BarChart className="h-8 w-8" />}
              trend={{ value: '12%', isPositive: true }}
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
              trend={{ value: '3%', isPositive: false }}
            />
          </div>

          {/* Sales by Period */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vendas por Período</h2>
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 pb-3">Data</th>
                  <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 pb-3">Produto</th>
                  <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 pb-3">Cliente</th>
                  <th className="text-right text-sm font-medium text-gray-500 dark:text-gray-400 pb-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {mockSales.map((sale) => (
                  <tr key={sale.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="py-3 text-sm text-gray-900 dark:text-gray-300">
                      {new Date(sale.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 text-sm text-gray-900 dark:text-gray-300">{sale.productName}</td>
                    <td className="py-3 text-sm text-gray-900 dark:text-gray-300">{sale.customerName}</td>
                    <td className="py-3 text-sm text-right text-gray-900 dark:text-gray-300">
                      {sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
              {mockSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{sale.productName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{sale.quantity} unidades vendidas</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              ))}
            </div>
          </div>

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
              },
              {
                label: 'Relatório de Estoque',
                onClick: () => handleGenerateReport('estoque'),
                icon: <Package className="h-4 w-4" />
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