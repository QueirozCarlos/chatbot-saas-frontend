import { api } from '../contexts/AuthContext';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
}

export const productService = {
  async getAvailableProducts(): Promise<Product[]> {
    try {
      const response = await api.get('/products');
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Dados inválidos recebidos do servidor');
      }

      return response.data.map((product: any) => ({
        id: product.id,
        name: product.name || 'Sem nome',
        description: product.description || '',
        price: parseFloat(product.price) || 0,
        stockQuantity: parseInt(product.stockQuantity || product.quantity) || 0,
        category: product.category || product.categoria || 'Sem categoria'
      })).filter(product => product.stockQuantity > 0);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw new Error('Erro ao carregar produtos. Por favor, tente novamente.');
    }
  }
}; 