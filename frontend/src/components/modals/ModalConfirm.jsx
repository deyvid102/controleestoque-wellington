import React from 'react';
import { X, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTheme } from '@/styles/ThemeContext';

const ModalConfirm = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmar Ação", 
  message = "Você tem certeza que deseja realizar esta operação?",
  type = "danger", // danger, warning, success
  confirmText = "Confirmar",
  cancelText = "Cancelar"
}) => {
  const { isDarkMode } = useTheme();

  if (!isOpen) return null;

  // Configuração dinâmica de cores e ícones
  const variants = {
    danger: {
      icon: <AlertCircle className="text-red-500" size={40} />,
      button: "bg-red-600 hover:bg-red-700 shadow-red-900/20",
      lightBg: "bg-red-500/10",
    },
    warning: {
      icon: <AlertTriangle className="text-yellow-500" size={40} />,
      button: "bg-yellow-500 hover:bg-yellow-600 text-slate-900",
      lightBg: "bg-yellow-500/10",
    },
    success: {
      icon: <CheckCircle2 className="text-green-500" size={40} />,
      button: "bg-green-600 hover:bg-green-700 shadow-green-900/20",
      lightBg: "bg-green-500/10",
    }
  };

  const currentVariant = variants[type] || variants.danger;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`w-full max-w-sm rounded-2xl shadow-2xl transition-all duration-300 scale-100 ${
        isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
      }`}>
        
        {/* Header com botão fechar */}
        <div className="flex justify-end p-2">
          <button onClick={onClose} className="text-slate-400 hover:text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo Centralizado */}
        <div className="px-6 pb-6 text-center">
          <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${currentVariant.lightBg}`}>
            {currentVariant.icon}
          </div>
          
          <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {title}
          </h3>
          
          <p className={`text-sm leading-relaxed mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {message}
          </p>

          {/* Ações */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95 ${currentVariant.button}`}
            >
              {confirmText}
            </button>
            
            <button
              onClick={onClose}
              className={`w-full py-3 rounded-xl font-medium transition-colors ${
                isDarkMode 
                  ? 'text-slate-400 hover:bg-slate-700/50' 
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirm;