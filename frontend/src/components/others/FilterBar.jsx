import { X, Filter, RotateCcw } from 'lucide-react';
import { useTheme } from '@/styles/ThemeContext';

const FilterBar = ({ 
  isOpen, 
  onClose, 
  onApply, 
  onClear, 
  title = "Filtros", 
  children 
}) => {
  const { isDarkMode } = useTheme();

  return (
    <>
      {/* Overlay para fechar ao clicar fora */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } ${isDarkMode ? 'bg-slate-900 border-l border-slate-700' : 'bg-white border-l border-slate-200'}`}>
        
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          isDarkMode ? 'border-slate-700' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-blue-500" />
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              {title}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Conteúdo Dinâmico (Inputs, Selects, etc) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {children}
        </div>

        {/* Footer com Ações */}
        <div className={`p-6 border-t space-y-3 ${
          isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <button
            onClick={onApply}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-[0.98]"
          >
            Aplicar Filtros
          </button>
          
          <button
            onClick={onClear}
            className={`w-full flex items-center justify-center gap-2 font-medium py-2 transition-colors ${
              isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <RotateCcw size={16} /> Limpar tudo
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterBar;