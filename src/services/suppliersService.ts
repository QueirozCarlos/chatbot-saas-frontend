import api from './api';

export interface Supplier {
  id: number;
  name: string;
  company: string;
  contact: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierData {
  name: string;
  company: string;
  contact: string;
  status: 'active' | 'inactive';
}

export interface UpdateSupplierData {
  name?: string;
  company?: string;
  contact?: string;
  status?: 'active' | 'inactive';
}

class SuppliersService {
  async getAllSuppliers(): Promise<Supplier[]> {
    const response = await api.get('/suppliers');
    return response.data;
  }

  async getSupplierById(id: number): Promise<Supplier> {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  }

  async createSupplier(data: CreateSupplierData): Promise<Supplier> {
    const response = await api.post('/suppliers', data);
    return response.data;
  }

  async updateSupplier(id: number, data: UpdateSupplierData): Promise<Supplier> {
    const response = await api.put(`/suppliers/${id}`, data);
    return response.data;
  }

  async deleteSupplier(id: number): Promise<void> {
    await api.delete(`/suppliers/${id}`);
  }

  async updateSupplierStatus(id: number, status: 'active' | 'inactive'): Promise<Supplier> {
    const response = await api.patch(`/suppliers/${id}/status`, { status });
    return response.data;
  }
}

export const suppliersService = new SuppliersService(); 