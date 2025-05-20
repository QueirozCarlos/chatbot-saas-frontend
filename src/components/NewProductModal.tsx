import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
}

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'> | Product) => void;
  initialProduct?: Product | null;
}

export default function NewProductModal({ isOpen, onClose, onSave, initialProduct }: NewProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stockQuantity: '',
  });
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (initialProduct) {
      setFormData({
        name: initialProduct.name,
        description: initialProduct.description || '',
        category: initialProduct.category,
        price: initialProduct.price.toString(),
        stockQuantity: initialProduct.stockQuantity.toString(),
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        stockQuantity: '',
      });
    }
  }, [initialProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Dados do formulário:', formData);
    
    if (!formData.name || !formData.price || !formData.stockQuantity || !formData.category) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const newProduct = {
      ...(initialProduct ? { id: initialProduct.id } : {}),
      name: formData.name,
      description: formData.description,
      category: formData.category.trim(),
      price: parseFloat(formData.price),
      stockQuantity: parseInt(formData.stockQuantity),
    };

    console.log('Novo produto a ser enviado:', newProduct);

    setError(null);

    if (!newProduct.name.trim()) {
      setError('O nome do produto é obrigatório');
      return;
    }

    if (!newProduct.category) {
      setError('A categoria do produto é obrigatória');
      return;
    }

    if (newProduct.price <= 0) {
      setError('O preço deve ser maior que zero');
      return;
    }

    if (newProduct.stockQuantity <= 0) {
      setError('A quantidade em estoque deve ser maior que zero');
      return;
    }

    onSave(newProduct);

    // Limpar campos após salvar
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      stockQuantity: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Novo Produto</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome do Produto
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoria
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Preço
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quantidade em Estoque
            </label>
            <input
              type="number"
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm mt-2">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}