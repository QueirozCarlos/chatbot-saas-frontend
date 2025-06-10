import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Package, LogOut, Plus, Search, RefreshCw, DollarSign, BarChart, LineChart, PieChart, AlertCircle, ArrowUpDown, Tag, PackagePlus } from 'lucide-react';
import { SidebarSimple } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import NewProductModal from '../components/NewProductModal';
import CategoryModal from '../components/CategoryModal';
import ChatbotButton from '../components/ChatbotButton';
import Sidebar from '../components/Sidebar';
import { api } from '../contexts/AuthContext';
import StockMovementModal from '../components/StockMovementModal';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
}

interface StockMovement {
  id: number;
  productId: number;
  type: 'entrada' | 'saida' | 'transferencia';
  quantity: number;
  date: string;
  fromLocation?: string;
  toLocation?: string;
  notes?: string;
}

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isStockMovementModalOpen, setIsStockMovementModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [lowStockAlert, setLowStockAlert] = useState<number>(5);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [totalStockValue, setTotalStockValue] = useState<number>(0);
  
  // Sorting states for products
  const [productSortField, setProductSortField] = useState<keyof Product>('name');
  const [productSortDirection, setProductSortDirection] = useState<'asc' | 'desc'>('asc');

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Iniciando busca de produtos...');
      const response = await api.get('/products');
      console.log('Resposta da API:', response.data);
      
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Dados inválidos recebidos da API:', response.data);
        setError('Dados inválidos recebidos do servidor');
        return;
      }

      // Mapear os dados da API para o formato esperado
      const mappedProducts = response.data.map((product: any) => {
        try {
          const mappedProduct = {
            id: product.id,
            name: product.name || 'Sem nome',
            description: product.description || '',
            price: parseFloat(product.price) || 0,
            stockQuantity: parseInt(product.stockQuantity || product.quantity) || 0,
            category: product.category || product.categoria || 'Sem categoria'
          };
          console.log('Produto mapeado:', mappedProduct);
          return mappedProduct;
        } catch (err) {
          console.error('Erro ao mapear produto:', product, err);
          return null;
        }
      }).filter(Boolean);

      console.log('Todos os produtos mapeados:', mappedProducts);
      setProducts(mappedProducts);
      
      // Calcular valor total inicial
      const initialTotal = calculateTotalStockValue(mappedProducts);
      console.log('Valor total inicial:', initialTotal);
      setTotalStockValue(initialTotal);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      setError('Erro ao carregar produtos. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Dashboard montado, iniciando fetchProducts...');
    fetchProducts();
  }, []);

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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    try {
      console.log('Novo produto recebido do modal:', newProduct);
      
      // Preparar os dados para enviar à API
      const productToSend = {
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        stockQuantity: newProduct.stockQuantity,
        categoria: newProduct.category
      };
      
      console.log('Produto a ser enviado para a API:', productToSend);
      const response = await api.post('/products', productToSend);
      console.log('Resposta da API ao adicionar produto:', response.data);
      
      // Garantir que a categoria esteja presente na resposta
      const productWithCategory = {
        ...response.data,
        category: response.data.categoria || response.data.category || newProduct.category
      };
      console.log('Produto com categoria garantida:', productWithCategory);
      
      // Atualizar a lista de produtos com o novo produto
      const updatedProducts = [...products, productWithCategory];
      console.log('Lista de produtos atualizada:', updatedProducts);
      setProducts(updatedProducts);
      
      // Calcular e atualizar o valor total
      const newTotal = calculateTotalStockValue(updatedProducts);
      console.log('Novo valor total após adicionar produto:', newTotal);
      setTotalStockValue(newTotal);
      
      setIsNewProductModalOpen(false);
    } catch (err) {
      console.error('Error adding product:', err);
      setError('Erro ao adicionar produto. Por favor, tente novamente.');
    }
  };

  const handleAddStockMovement = async (movement: Omit<StockMovement, 'id'>) => {
    try {
      const response = await api.post('/stock-movements', movement);
      setStockMovements([...stockMovements, response.data]);
      
      // Atualizar quantidade do produto
      const updatedProducts = products.map(product => {
        if (product.id === movement.productId) {
          const newQuantity = movement.type === 'entrada' 
            ? product.stockQuantity + movement.quantity
            : movement.type === 'saida'
              ? product.stockQuantity - movement.quantity
              : product.stockQuantity;
          return { ...product, stockQuantity: newQuantity };
        }
        return product;
      });
      setProducts(updatedProducts);
      
      setIsStockMovementModalOpen(false);
    } catch (err) {
      console.error('Error adding stock movement:', err);
      setError('Erro ao adicionar movimentação. Por favor, tente novamente.');
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      // Fetch products from API
      const response = await api.get('/products');
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Dados inválidos recebidos do servidor');
      }

      // Map the API data to the expected format
      const mappedProducts = response.data.map((product: any) => ({
        id: product.id,
        name: product.name || 'Sem nome',
        description: product.description || '',
        price: parseFloat(product.price) || 0,
        stockQuantity: parseInt(product.stockQuantity || product.quantity) || 0,
        category: product.category || product.categoria || 'Sem categoria'
      }));

      // Update products state
      setProducts(mappedProducts);
      
      // Update total stock value
      const newTotal = calculateTotalStockValue(mappedProducts);
      setTotalStockValue(newTotal);
      
    } catch (err) {
      console.error('Erro ao atualizar produtos:', err);
      setError('Erro ao atualizar produtos. Por favor, tente novamente.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductSort = (field: keyof Product) => {
    if (productSortField === field) {
      setProductSortDirection(productSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setProductSortField(field);
      setProductSortDirection('asc');
    }
  };

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aValue = a[productSortField];
    const bValue = b[productSortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return productSortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return productSortDirection === 'asc'
      ? Number(aValue) - Number(bValue)
      : Number(bValue) - Number(aValue);
  });

  const handleEditProduct = async (updatedProduct: Product) => {
    try {
      console.log('Produto a ser editado:', updatedProduct);
      
      // Preparar os dados para enviar à API
      const productToSend = {
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: updatedProduct.price,
        stockQuantity: updatedProduct.stockQuantity,
        categoria: updatedProduct.category
      };
      
      console.log('Produto a ser enviado para a API:', productToSend);
      const response = await api.put(`/products/${updatedProduct.id}`, productToSend);
      console.log('Resposta da API ao editar produto:', response.data);
      
      // Garantir que a categoria esteja presente na resposta
      const productWithCategory = {
        ...response.data,
        category: response.data.categoria || response.data.category || updatedProduct.category
      };
      
      // Atualizar a lista de produtos
      const updatedProducts = products.map(product => 
        product.id === updatedProduct.id ? productWithCategory : product
      );
      console.log('Lista de produtos após edição:', updatedProducts);
      setProducts(updatedProducts);
      
      // Calcular e atualizar o valor total
      const newTotal = calculateTotalStockValue(updatedProducts);
      console.log('Novo valor total após editar produto:', newTotal);
      setTotalStockValue(newTotal);
      
      setEditingProduct(null);
    } catch (err) {
      console.error('Error editing product:', err);
      setError('Erro ao editar produto. Por favor, tente novamente.');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      console.log('Excluindo produto:', productId);
      await api.delete(`/products/${productId}`);
      
      // Atualizar a lista de produtos
      const updatedProducts = products.filter(product => product.id !== productId);
      console.log('Lista de produtos após exclusão:', updatedProducts);
      setProducts(updatedProducts);
      
      // Calcular e atualizar o valor total
      const newTotal = calculateTotalStockValue(updatedProducts);
      console.log('Novo valor total após excluir produto:', newTotal);
      setTotalStockValue(newTotal);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Erro ao excluir produto. Por favor, tente novamente.');
    }
  };

  // Calcular o valor total em estoque
  const calculateTotalStockValue = (products: Product[]) => {
    try {
      console.log('Calculando valor total para produtos:', products);
      if (!products || !Array.isArray(products)) {
        console.error('Lista de produtos inválida:', products);
        return 0;
      }

      const total = products.reduce((sum, product) => {
        try {
          const price = parseFloat(product.price.toString()) || 0;
          const quantity = parseInt(product.stockQuantity.toString()) || 0;
          const productValue = price * quantity;
          console.log(`Produto: ${product.name}, Preço: ${price}, Quantidade: ${quantity}, Valor: ${productValue}`);
          return sum + productValue;
        } catch (err) {
          console.error('Erro ao calcular valor do produto:', product, err);
          return sum;
        }
      }, 0);

      console.log('Valor total calculado:', total);
      return total;
    } catch (err) {
      console.error('Erro ao calcular valor total:', err);
      return 0;
    }
  };

  // Atualizar o valor total em estoque sempre que os produtos mudarem
  useEffect(() => {
    if (products.length > 0) {
      const total = calculateTotalStockValue(products);
      console.log('Atualizando valor total:', total);
      setTotalStockValue(total);
    } else {
      setTotalStockValue(0);
    }
  }, [products]);

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
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <button
                  id="menu-button"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  className="fixed left-0 top-2 sm:top-3 p-1.5 sm:p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 z-50"
                  aria-label={isSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
                >
                  <SidebarSimple className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-300" weight="duotone" />
                </button>
                <Package className="h-5 w-5 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-500 ml-1 sm:ml-2" />
                <h1 className="ml-1 sm:ml-3 text-sm sm:text-2xl font-bold text-gray-900 dark:text-white">Sistema de Estoque</h1>
              </div>             
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-6 mb-3 sm:mb-8">
            <div className="bg-white dark:bg-gray-800 p-2 sm:p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total de Produtos</p>
                  <p className="text-sm sm:text-2xl font-semibold text-gray-900 dark:text-white">{products.length}</p>
                </div>
                <Package className="h-4 w-4 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-2 sm:p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Valor Total em Estoque</p>
                  <p className="text-sm sm:text-2xl font-semibold text-gray-900 dark:text-white">
                    {totalStockValue.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </p>
                </div>
                <DollarSign className="h-4 w-4 sm:h-8 sm:w-8 text-purple-600 dark:text-purple-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-2 sm:p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Produtos com Estoque Baixo</p>
                  <p className="text-sm sm:text-2xl font-semibold text-gray-900 dark:text-white">
                    {products.filter(p => p.stockQuantity <= lowStockAlert).length}
                  </p>
                </div>
                <AlertCircle className="h-4 w-4 sm:h-8 sm:w-8 text-red-600 dark:text-red-500" />
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="mb-3 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 w-full text-xs sm:text-base border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center justify-center px-2 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-base bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 sm:h-5 sm:w-5 mr-1 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
              <button
                onClick={() => setIsNewProductModalOpen(true)}
                className="flex items-center justify-center px-2 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-base bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-3 w-3 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                Novo Produto
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-3 sm:mb-8 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-2 sm:p-4">
              <div className="flex items-center">
                <AlertCircle className="h-3 w-3 sm:h-5 sm:w-5 text-red-500 dark:text-red-400 mr-1 sm:mr-3" />
                <p className="text-xs sm:text-sm text-red-700 dark:text-red-200">{error}</p>
              </div>
            </div>
          )}

          {/* Products Table */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th 
                          className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleProductSort('name')}
                        >
                          <div className="flex items-center">
                            Produto
                            <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                          </div>
                        </th>
                        <th 
                          className="hidden sm:table-cell px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleProductSort('category')}
                        >
                          <div className="flex items-center">
                            Categoria
                            <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                          </div>
                        </th>
                        <th 
                          className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleProductSort('stockQuantity')}
                        >
                          <div className="flex items-center">
                            Qtd
                            <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                          </div>
                        </th>
                        <th 
                          className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleProductSort('price')}
                        >
                          <div className="flex items-center">
                            Preço
                            <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                          </div>
                        </th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {sortedProducts.map((product) => (
                        <tr 
                          key={product.id}
                          className={product.stockQuantity <= lowStockAlert ? 'bg-red-50 dark:bg-red-900/20' : ''}
                        >
                          <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                            <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">{product.category}</div>
                          </td>
                          <td className="hidden sm:table-cell px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{product.category}</div>
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm text-gray-900 dark:text-white">
                              {product.stockQuantity}
                              {product.stockQuantity <= lowStockAlert && (
                                <span className="ml-1 sm:ml-2 text-red-600 dark:text-red-400">
                                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 inline" />
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm text-gray-900 dark:text-white">
                              {product.price.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              })}
                            </div>
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-1 sm:mr-3 px-1 sm:px-2 py-0.5 sm:py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 px-1 sm:px-2 py-0.5 sm:py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              Excluir
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <NewProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
        onSave={handleAddProduct}
      />

      <NewProductModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onSave={handleEditProduct}
        initialProduct={editingProduct}
      />

      <StockMovementModal
        isOpen={isStockMovementModalOpen}
        onClose={() => setIsStockMovementModalOpen(false)}
        onSave={handleAddStockMovement}
        products={products}
      />

      <ChatbotButton />
    </div>
  );
}