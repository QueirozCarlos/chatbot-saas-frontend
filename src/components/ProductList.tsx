import React, { useState } from 'react';
import { deleteProduct, updateProduct } from '../services/api';
import EditProductModal from './EditProductModal';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
}

interface ProductListProps {
  products: Product[];
  onProductUpdate: () => Promise<void>;
}

const ProductList: React.FC<ProductListProps> = ({ products, onProductUpdate }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteProduct(id);
        await onProductUpdate();
        setError(null);
      } catch (err) {
        setError('Erro ao excluir produto. Por favor, tente novamente.');
        console.error('Erro ao excluir produto:', err);
      }
    }
  };

  const handleSaveEdit = async (updatedProduct: Product) => {
    try {
      await updateProduct(updatedProduct.id, updatedProduct);
      await onProductUpdate();
      setError(null);
    } catch (err) {
      setError('Erro ao atualizar produto. Por favor, tente novamente.');
      console.error('Erro ao atualizar produto:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Lista de Produtos</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
            <p className="text-gray-600 mb-2">{product.description}</p>
            <p className="text-gray-800 font-medium mb-2">
              Preço: R$ {product.price.toFixed(2)}
            </p>
            <p className="text-gray-800 font-medium mb-4">
              Estoque: {product.stockQuantity}
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(product)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {isEditModalOpen && selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProduct(null);
          }}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default ProductList; 