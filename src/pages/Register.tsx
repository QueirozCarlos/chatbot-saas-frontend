import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Package, Sun, Moon } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Por favor, insira um e-mail válido');
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.username, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 text-white text-center p-8">
          <h1 className="text-4xl font-bold mb-4">Crie sua Conta</h1>
          <p className="text-xl opacity-90">Junte-se a nós e comece a gerenciar seu estoque hoje mesmo</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 relative">
        {/* Theme Toggle Button */}
        <div className="absolute top-4 right-4 flex items-center space-x-3">
          {isDarkMode ? (
            <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          )}
          <button
            onClick={toggleDarkMode}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                isDarkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="p-4 bg-white/15 dark:bg-white/15 rounded-full backdrop-blur-sm">
                <Package className="h-12 w-12 text-gray-800 dark:text-white" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-800 dark:text-white">Criar Conta</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-white/80">Preencha os dados para se registrar</p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/20 text-red-600 dark:text-red-200 p-3 rounded-md text-sm backdrop-blur-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-white">
                  Nome Completo
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-white/20 dark:bg-white/20 border border-gray-300/30 dark:border-white/30 rounded-md shadow-sm placeholder:text-gray-500/50 dark:placeholder:text-white/50 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-500/50 dark:focus:ring-white/50 focus:border-transparent"
                  placeholder="Digite seu nome completo"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-white">
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-white/20 dark:bg-white/20 border border-gray-300/30 dark:border-white/30 rounded-md shadow-sm placeholder:text-gray-500/50 dark:placeholder:text-white/50 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-500/50 dark:focus:ring-white/50 focus:border-transparent"
                  placeholder="Digite seu e-mail"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-white">
                  Telefone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-white/20 dark:bg-white/20 border border-gray-300/30 dark:border-white/30 rounded-md shadow-sm placeholder:text-gray-500/50 dark:placeholder:text-white/50 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-500/50 dark:focus:ring-white/50 focus:border-transparent"
                  placeholder="Digite seu telefone"
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-white">
                  Nome de Usuário (login)
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-white/20 dark:bg-white/20 border border-gray-300/30 dark:border-white/30 rounded-md shadow-sm placeholder:text-gray-500/50 dark:placeholder:text-white/50 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-500/50 dark:focus:ring-white/50 focus:border-transparent"
                  placeholder="Digite seu nome de usuário"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-white">
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-white/20 dark:bg-white/20 border border-gray-300/30 dark:border-white/30 rounded-md shadow-sm placeholder:text-gray-500/50 dark:placeholder:text-white/50 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-500/50 dark:focus:ring-white/50 focus:border-transparent"
                  placeholder="Digite sua senha"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-white">
                  Confirmação de Senha
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-white/20 dark:bg-white/20 border border-gray-300/30 dark:border-white/30 rounded-md shadow-sm placeholder:text-gray-500/50 dark:placeholder:text-white/50 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-500/50 dark:focus:ring-white/50 focus:border-transparent"
                  placeholder="Confirme sua senha"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Criando conta...' : 'Criar conta'}
              </button>
              <p className="mt-4 text-center text-sm text-gray-600 dark:text-white/80">
                Já tem uma conta?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  Faça login aqui
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}