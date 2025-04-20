import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Package, Sun, Moon } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Aqui você implementaria a lógica de envio de email
      // Por enquanto, apenas simulamos o envio
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Um email foi enviado com as instruções para redefinir sua senha.');
    } catch (err) {
      setError('Ocorreu um erro ao enviar o email. Tente novamente mais tarde.');
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
          <h1 className="text-4xl font-bold mb-4">Redefinição de Senha</h1>
          <p className="text-xl opacity-90">Recupere o acesso à sua conta!</p>
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
            <h2 className="mt-6 text-3xl font-bold text-gray-800 dark:text-white">Recuperar Senha</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-white/80">
              Digite seu email para receber as instruções de redefinição
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/20 text-red-600 dark:text-red-200 p-3 rounded-md text-sm backdrop-blur-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-500/20 text-green-600 dark:text-green-200 p-3 rounded-md text-sm backdrop-blur-sm">
                {success}
              </div>
            )}
            
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
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Enviando...' : 'Enviar instruções'}
              </button>
              <p className="mt-4 text-center text-sm text-gray-600 dark:text-white/80">
                Lembrou sua senha?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  Voltar para o login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 