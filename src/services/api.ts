import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { token } = response.data;
          localStorage.setItem('token', token);

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  const { token, refreshToken } = response.data;
  localStorage.setItem('token', token);
  localStorage.setItem('refreshToken', refreshToken);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const createProduct = async (product: {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
}) => {
  const response = await api.post('/products', product);
  return response.data;
};

export const updateProduct = async (id: number, product: {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
}) => {
  const response = await api.put(`/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id: number) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export const createStockMovement = async (movement: {
  productId: number;
  type: 'entrada' | 'saida' | 'transferencia';
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  notes?: string;
}) => {
  const response = await api.post('/stock-movements', movement);
  return response.data;
};

export default api; 