import React, { useState, useEffect, useRef } from 'react';
import { Download, ChevronDown, X } from 'lucide-react';

interface FloatActionButtonProps {
  icon: React.ReactNode;
  items: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  }[];
  isLoading?: boolean;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export default function FloatActionButton({
  icon,
  items,
  isLoading = false,
  className = '',
  position = 'bottom-right'
}: FloatActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPositionClass = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-8 left-8';
      case 'top-right':
        return 'top-8 right-8';
      case 'top-left':
        return 'top-8 left-8';
      default:
        return 'bottom-8 right-8';
    }
  };

  const handleToggle = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setIsOpen(!isOpen);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  return (
    <div ref={fabRef} className={`fixed ${getPositionClass()}`}>
      <div className="relative">
        {/* Main FAB Button */}
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`
            bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full 
            shadow-lg transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
            disabled:opacity-50 disabled:cursor-not-allowed flex items-center
            ${isOpen ? 'rotate-45' : ''}
            ${className}
          `}
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {icon}
              {isOpen ? (
                <X className="h-6 w-6 ml-1" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-1" />
              )}
            </>
          )}
        </button>

        {/* Speed Dial Menu */}
        <div
          className={`
            absolute transition-all duration-300 ease-in-out
            ${position.includes('right') ? 'right-0' : 'left-0'}
            ${position.includes('bottom') ? 'bottom-full mb-2' : 'top-full mt-2'}
            ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
          `}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className="
                  w-48 px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 
                  hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center
                  transition-colors duration-200
                "
                type="button"
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 