import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { productService, Product } from '../services/productService';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sale: {
    productId: number;
    productName: string;
    quantity: number;
    totalValue: number;
    saleDate: string;
    customerName: string;
    sellerName: string;
  }) => void;
}

export default function NewSaleModal({ isOpen, onClose, onSave }: NewSaleModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [productId, setProductId] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);
  const [totalValue, setTotalValue] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const availableProducts = await productService.getAvailableProducts();
        setProducts(availableProducts);
      } catch (err) {
        setError('Erro ao carregar produtos. Por favor, tente novamente.');
        console.error('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

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
    if (selectedProduct && quantity > 0) {
      setTotalValue(selectedProduct.price * quantity);
    }
  }, [selectedProduct, quantity]);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    setProductId(selectedId);
    const product = products.find(p => p.id === selectedId);
    setSelectedProduct(product || null);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Number(e.target.value);
    if (selectedProduct && newQuantity > selectedProduct.stockQuantity) {
      setError(`Quantidade máxima disponível: ${selectedProduct.stockQuantity}`);
      return;
    }
    setError(null);
    setQuantity(newQuantity);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (error) return;

    const currentDate = new Date().toISOString();
    
    onSave({
      productId,
      productName: selectedProduct?.name || 'Produto não encontrado',
      quantity,
      totalValue,
      saleDate: currentDate,
      customerName,
      sellerName,
    });
    
    // Reset form
    setCustomerName('');
    setSellerName('');
    setProductId(0);
    setQuantity(1);
    setTotalValue(0);
    setSelectedProduct(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Nova Venda</h2>
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
              Nome do Cliente
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome do Vendedor
            </label>
            <input
              type="text"
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Produto
            </label>
            {isLoading ? (
              <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700">
                Carregando produtos...
              </div>
            ) : (
              <select
                value={productId}
                onChange={handleProductChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Selecione um produto</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - Estoque: {product.stockQuantity} - R$ {product.price.toFixed(2)}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quantidade
            </label>
            <input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              max={selectedProduct?.stockQuantity}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
            {error && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Valor Total
            </label>
            <input
              type="text"
              value={totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 dark:text-white"
            />
          </div>

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
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
              disabled={!!error}
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}