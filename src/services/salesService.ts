import { api } from '../contexts/AuthContext';

export interface Sale {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  totalValue: number;
  saleDate: string;
  customerName: string;
  sellerName: string;
}

export interface NewSale {
  productId: number;
  productName: string;
  quantity: number;
  totalValue: number;
  saleDate: string;
  customerName: string;
  sellerName: string;
}

export const salesService = {
  async getAllSales(): Promise<Sale[]> {
    try {
      const response = await api.get('/sales');
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Dados inválidos recebidos do servidor');
      }

      return response.data.map((sale: any) => ({
        id: sale.id,
        productId: sale.productId,
        productName: sale.productName || 'Produto não encontrado',
        quantity: parseInt(sale.quantity) || 0,
        totalValue: parseFloat(sale.totalValue) || 0,
        saleDate: sale.saleDate,
        customerName: sale.customerName || 'Cliente não informado',
        sellerName: sale.sellerName || 'Vendedor não informado'
      }));
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      throw new Error('Erro ao carregar vendas. Por favor, tente novamente.');
    }
  },

  async createSale(sale: NewSale): Promise<Sale> {
    try {
      const response = await api.post('/sales', sale);
      return {
        ...response.data,
        productName: sale.productName,
        customerName: response.data.customerName || 'Cliente não informado',
        sellerName: response.data.sellerName || 'Vendedor não informado'
      };
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      throw new Error('Erro ao criar venda. Por favor, tente novamente.');
    }
  },

  async getSaleById(id: number): Promise<Sale> {
    try {
      const response = await api.get(`/sales/${id}`);
      return {
        ...response.data,
        productName: response.data.productName || 'Produto não encontrado',
        customerName: response.data.customerName || 'Cliente não informado',
        sellerName: response.data.sellerName || 'Vendedor não informado'
      };
    } catch (error) {
      console.error('Erro ao buscar venda:', error);
      throw new Error('Erro ao carregar venda. Por favor, tente novamente.');
    }
  },

  async updateSale(id: number, sale: Partial<NewSale>): Promise<Sale> {
    try {
      const response = await api.put(`/sales/${id}`, sale);
      return {
        ...response.data,
        productName: sale.productName || response.data.productName || 'Produto não encontrado',
        customerName: response.data.customerName || 'Cliente não informado',
        sellerName: response.data.sellerName || 'Vendedor não informado'
      };
    } catch (error) {
      console.error('Erro ao atualizar venda:', error);
      throw new Error('Erro ao atualizar venda. Por favor, tente novamente.');
    }
  },

  async deleteSale(id: number): Promise<void> {
    try {
      await api.delete(`/sales/${id}`);
    } catch (error) {
      console.error('Erro ao deletar venda:', error);
      throw new Error('Erro ao deletar venda. Por favor, tente novamente.');
    }
  },

  async cancelSale(id: number): Promise<Sale> {
    try {
      console.log('Iniciando cancelamento da venda:', id);
      const response = await api.patch(`/sales/${id}`, { status: 'CANCELED' });
      console.log('Resposta do cancelamento:', response.data);
      return {
        ...response.data,
        productName: response.data.productName || 'Produto não encontrado',
        customerName: response.data.customerName || 'Cliente não informado',
        sellerName: response.data.sellerName || 'Vendedor não informado'
      };
    } catch (error: any) {
      console.error('Erro detalhado ao cancelar venda:', {
        id,
        error: error.response?.data || error.message,
        status: error.response?.status,
        headers: error.response?.headers
      });
      throw new Error(error.response?.data?.message || 'Erro ao cancelar venda. Por favor, tente novamente.');
    }
  }
}; 