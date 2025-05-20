import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
}

interface StockMovement {
  id?: number;
  productId: number;
  type: 'entrada' | 'saida' | 'transferencia';
  quantity: number;
  date: string;
  fromLocation?: string;
  toLocation?: string;
  notes?: string;
}

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (movement: Omit<StockMovement, 'id'>) => void;
  products: Product[];
}

export default function StockMovementModal({ isOpen, onClose, onSave, products }: StockMovementModalProps) {
  const [type, setType] = useState<'entrada' | 'saida' | 'transferencia'>('entrada');
  const [productId, setProductId] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const [fromLocation, setFromLocation] = useState<string>('');
  const [toLocation, setToLocation] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const movement: Omit<StockMovement, 'id'> = {
      productId,
      type,
      quantity,
      date: new Date().toISOString(),
      notes,
    };

    if (type === 'transferencia') {
      movement.fromLocation = fromLocation;
      movement.toLocation = toLocation;
    }

    onSave(movement);
    resetForm();
  };

  const resetForm = () => {
    setType('entrada');
    setProductId(0);
    setQuantity(0);
    setFromLocation('');
    setToLocation('');
    setNotes('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Movimentação de Estoque
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Movimentação
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as 'entrada' | 'saida' | 'transferencia')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
              <option value="transferencia">Transferência</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="product" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Produto
            </label>
            <select
              id="product"
              value={productId}
              onChange={(e) => setProductId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Selecione um produto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} (Estoque: {product.stockQuantity})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quantidade
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
              min="1"
            />
          </div>

          {type === 'transferencia' && (
            <>
              <div className="mb-4">
                <label htmlFor="fromLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Local de Origem
                </label>
                <input
                  type="text"
                  id="fromLocation"
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="toLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Local de Destino
                </label>
                <input
                  type="text"
                  id="toLocation"
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </>
          )}

          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observações
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 