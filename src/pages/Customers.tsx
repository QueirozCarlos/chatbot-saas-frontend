import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Plus, Search, Edit2, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { SidebarSimple } from '@phosphor-icons/react';
import Sidebar from '../components/Sidebar';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

const mockCustomers: Customer[] = [
  {
    id: 1,
    name: 'João Silva',
    email: 'joao.silva@example.com',
    phone: '(11) 98765-4321',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    createdAt: '2023-01-15T10:00:00Z',
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria.santos@example.com',
    phone: '(21) 99876-5432',
    address: 'Avenida Atlântica, 456 - Rio de Janeiro, RJ',
    createdAt: '2023-02-20T11:30:00Z',
  },
  {
    id: 3,
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@example.com',
    phone: '(31) 97654-3210',
    address: 'Rua do Contorno, 789 - Belo Horizonte, MG',
    createdAt: '2023-03-10T14:15:00Z',
  },
  {
    id: 4,
    name: 'Ana Pereira',
    email: 'ana.pereira@example.com',
    phone: '(41) 96543-2109',
    address: 'Alameda dos Anjos, 101 - Curitiba, PR',
    createdAt: '2023-04-01T09:45:00Z',
  },
  {
    id: 5,
    name: 'Pedro Costa',
    email: 'pedro.costa@example.com',
    phone: '(51) 95432-1098',
    address: 'Rua Independência, 202 - Porto Alegre, RS',
    createdAt: '2023-05-05T16:00:00Z',
  },
];

const Customers: React.FC = () => {
  const { api, isAuthenticated } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<number | null>(null);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Estados para o formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    fetchCustomers();
  }, [isAuthenticated]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 500)); 
      setCustomers(mockCustomers);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      setError('Erro ao carregar clientes. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        // Atualizar cliente existente
        // await api.put(`/customers/${editingCustomer.id}`, formData);
        // Simulate update
        const updatedCustomers = customers.map(c => 
          c.id === editingCustomer.id ? { ...c, ...formData } : c
        );
        setCustomers(updatedCustomers as Customer[]);
      } else {
        // Criar novo cliente
        // await api.post('/customers', formData);
        // Simulate create
        const newCustomer: Customer = {
          id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
          ...formData,
          createdAt: new Date().toISOString(),
        };
        setCustomers([...customers, newCustomer]);
      }
      
      // Limpar formulário e atualizar lista
      setFormData({ name: '', email: '', phone: '', address: '' });
      setEditingCustomer(null);
      setIsNewCustomerModalOpen(false);
      // await fetchCustomers(); // No need to re-fetch all for mock data
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
      setError('Erro ao salvar cliente. Por favor, tente novamente.');
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address
    });
    setIsNewCustomerModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) {
      return;
    }

    try {
      // await api.delete(`/customers/${id}`);
      // Simulate delete
      setCustomers(customers.filter(customer => customer.id !== id));
      // await fetchCustomers(); // No need to re-fetch all for mock data
    } catch (err) {
      console.error('Erro ao excluir cliente:', err);
      setError('Erro ao excluir cliente. Por favor, tente novamente.');
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  if (!isAuthenticated) {
    return null;
  }

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
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  className="fixed left-0 top-2 sm:top-3 p-1.5 sm:p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 z-50"
                  aria-label={isSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
                >
                  <SidebarSimple className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-300" weight="duotone" />
                </button>
                <Users className="h-5 w-5 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-500 ml-1 sm:ml-2" />
                <h1 className="ml-1 sm:ml-3 text-base sm:text-2xl font-bold text-gray-900 dark:text-white">Clientes</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-8">
          {error && (
            <div className="mb-4 sm:mb-8 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-2 sm:p-4">
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Actions Bar */}
          <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 w-full text-xs sm:text-base border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <button
              onClick={() => {
                setEditingCustomer(null);
                setFormData({ name: '', email: '', phone: '', address: '' });
                setIsNewCustomerModalOpen(true);
              }}
              className="flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-base bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              Novo Cliente
            </button>
          </div>

          {/* Customers List */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Contato
                    </th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                      Endereço
                    </th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-2 sm:px-6 py-3 sm:py-4 text-center text-gray-500 dark:text-gray-400">
                        Carregando clientes...
                      </td>
                    </tr>
                  ) : filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-2 sm:px-6 py-3 sm:py-4 text-center text-gray-500 dark:text-gray-400">
                        Nenhum cliente encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <tr key={customer.id}>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                            {customer.name}
                          </div>
                        </td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              {customer.email}
                            </div>
                            <div className="flex items-center mt-0.5 sm:mt-1">
                              <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              {customer.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              {customer.address}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                          <button
                            onClick={() => handleEdit(customer)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-1 sm:mr-3 px-1 py-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Edit2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 px-1 py-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Novo/Editar Cliente */}
      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm sm:max-w-md mx-auto my-auto">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <button
                onClick={() => {
                  setIsNewCustomerModalOpen(false);
                  setEditingCustomer(null);
                  setFormData({ name: '', email: '', phone: '', address: '' });
                }}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="sr-only">Fechar</span>
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nome
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Endereço
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="mt-1 block w-full px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="mt-4 sm:mt-6 flex justify-end space-x-2 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewCustomerModalOpen(false);
                    setEditingCustomer(null);
                    setFormData({ name: '', email: '', phone: '', address: '' });
                  }}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {editingCustomer ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers; 