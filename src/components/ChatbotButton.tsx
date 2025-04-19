import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Assistente Virtual</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="h-96 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                  <p className="text-sm">Olá! Como posso ajudar você hoje?</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Digite sua mensagem..."
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}