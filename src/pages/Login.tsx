import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Package, Sun, Moon, Eye, EyeOff, BarChart, LineChart } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/home');
    } catch (err) {
      setError('Email ou senha inválidos');
    } finally {
      setIsLoading(false);
     }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image and Text */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center relative overflow-hidden p-8">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 flex items-center justify-center text-white text-center flex-col">
          <div className="flex items-end mb-4 space-x-2">
            <BarChart className="h-24 w-24 text-blue-300 transform -rotate-12" strokeWidth={1.5} />
            <LineChart className="h-28 w-28 text-blue-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold mb-4">Bem-vindo ao ShopSync</h1>
          <p className="text-xl opacity-90">Transforme seu estoque com nossas soluções!</p>
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
            <h2 className="mt-6 text-3xl font-bold text-gray-800 dark:text-white">ShopSync Sistema</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-white/80">Faça login para acessar o sistema</p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/20 text-red-600 dark:text-red-200 p-3 rounded-md text-sm backdrop-blur-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-white">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white/20 dark:bg-white/20 border border-gray-300/30 dark:border-white/30 rounded-md shadow-sm placeholder:text-gray-500/50 dark:placeholder:text-white/50 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-500/50 dark:focus:ring-white/50 focus:border-transparent"
                  placeholder="Digite seu email"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-white">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white/20 dark:bg-white/20 border border-gray-300/30 dark:border-white/30 rounded-md shadow-sm placeholder:text-gray-500/50 dark:placeholder:text-white/50 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-500/50 dark:focus:ring-white/50 focus:border-transparent pr-10"
                    placeholder="Digite sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-gray-600 hover:text-gray-800 dark:text-white/80 dark:hover:text-white focus:outline-none focus:underline"
              >
                Esqueceu sua senha?
              </Link>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
              <p className="mt-4 text-center text-sm text-gray-600 dark:text-white/80">
                Não tem uma conta?{' '}
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  Registre-se aqui
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}