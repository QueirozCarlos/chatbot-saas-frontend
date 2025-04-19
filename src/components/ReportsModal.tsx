import React, { useState, useEffect } from 'react';
import { X, Download, Printer } from 'lucide-react';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportsModal({ isOpen, onClose }: ReportsModalProps) {
  const [selectedReport, setSelectedReport] = useState('');

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleDownload = () => {
    // Implementar lógica de download do relatório
    console.log('Downloading report:', selectedReport);
  };

  const handlePrint = () => {
    // Implementar lógica de impressão do relatório
    console.log('Printing report:', selectedReport);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Relatórios</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Selecione o Relatório
            </label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Selecione um relatório</option>
              <option value="sales">Relatório de Vendas</option>
              <option value="products">Relatório de Produtos</option>
              <option value="customers">Relatório de Clientes</option>
              <option value="inventory">Relatório de Estoque</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              onClick={handleDownload}
              disabled={!selectedReport}
              className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
            <button
              onClick={handlePrint}
              disabled={!selectedReport}
              className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </button>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 rounded-md"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 