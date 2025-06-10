import React, { useState } from 'react';
import { X, Download, FileText, Package, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReportsModal: React.FC<ReportsModalProps> = ({ isOpen, onClose }) => {
  const { api } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadReport = async (type: 'sales' | 'products') => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Relatórios
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => handleDownloadReport('sales')}
              disabled={isLoading}
              className="w-full flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                <div className="text-left">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Relatório de Vendas
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Download em PDF
                  </p>
                </div>
              </div>
              <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </button>

            <button
              onClick={() => handleDownloadReport('products')}
              disabled={isLoading}
              className="w-full flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/50 rounded-lg hover:bg-green-100 dark:hover:bg-green-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center">
                <Package className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
                <div className="text-left">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Relatório de Produtos
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Download em PDF
                  </p>
                </div>
              </div>
              <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
            </button>
          </div>

          {isLoading && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Gerando relatório...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsModal; 