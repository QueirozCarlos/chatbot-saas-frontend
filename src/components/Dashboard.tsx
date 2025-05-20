import React, { useState, useEffect } from 'react';
import { getProducts, createProduct } from '../services/api';
import ProductList from './ProductList';
import NewProductModal from './NewProductModal';

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

const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar produtos. Por favor, tente novamente.');
      console.error('Erro ao buscar produtos:', err);
    }
  };

  const handleAddProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const newProduct = await createProduct(product);
      setProducts([...products, newProduct]);
      setIsNewProductModalOpen(false);
      setError(null);
    } catch (err) {
      setError('Erro ao adicionar produto. Por favor, tente novamente.');
      console.error('Erro ao adicionar produto:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={() => setIsNewProductModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Adicionar Produto
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <ProductList products={products} onProductUpdate={fetchProducts} />

      {isNewProductModalOpen && (
        <NewProductModal
          isOpen={isNewProductModalOpen}
          onClose={() => setIsNewProductModalOpen(false)}
          onSave={handleAddProduct}
          products={products}
        />
      )}
    </div>
  );
};

export default Dashboard; 