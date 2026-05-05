import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useTheme } from '@/styles/ThemeContext';
import api from '@/services/api';

const ModalProdutos = ({ isOpen, onClose, onRefresh, produtoParaEditar = null }) => {
  const { isDarkMode } = useTheme();
  
  const initialFormState = { 
    nome: '', 
    descricao: '', 
    custoUni: '', 
    valorUni: '' 
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isOpen) {
      if (produtoParaEditar) {
        setFormData({
          nome: produtoParaEditar.nome || '',
          descricao: produtoParaEditar.descricao || '',
          custoUni: produtoParaEditar.custoUni || '',
          valorUni: produtoParaEditar.valorUni || ''
        });
      } else {
        setFormData(initialFormState);
      }
    }
  }, [produtoParaEditar, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (produtoParaEditar) {
        await api.put(`/produtos/${produtoParaEditar._id}`, formData);
      } else {
        await api.post('/produtos', formData);
      }
      onRefresh(); 
      onClose();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
    }
  };

  const inputStyle = `w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
    isDarkMode 
      ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500' 
      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
  }`;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      {/* Container Responsivo: Bottom Sheet no Mobile, Modal Centralizado no Desktop */}
      <div className={`w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl transition-all duration-300 transform animate-in slide-in-from-bottom-10 ${
        isDarkMode ? 'bg-slate-800 border-t border-x border-slate-700 sm:border' : 'bg-white border-t border-x border-slate-100 sm:border'
      }`}>
        
        {/* Indicador visual para mobile (Handle) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className={`w-12 h-1.5 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
        </div>

        <div className={`p-5 sm:p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            {produtoParaEditar ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Formulário com scroll interno para evitar quebra com teclado mobile */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto pb-10 sm:pb-6">
          <div>
            <label className={`block text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Nome do Produto</label>
            <input 
              required
              type="text" 
              placeholder="Ex: Camiseta Branca"
              className={inputStyle}
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Descrição (Opcional)</label>
            <textarea 
              rows="2"
              placeholder="Detalhes do produto..."
              className={inputStyle}
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Custo (R$)</label>
              <input 
                required
                type="number" 
                step="0.01" 
                placeholder="0,00"
                className={inputStyle}
                value={formData.custoUni}
                onChange={(e) => setFormData({...formData, custoUni: e.target.value})} 
              />
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Venda (R$)</label>
              <input 
                required
                type="number" 
                step="0.01" 
                placeholder="0,00"
                className={`${inputStyle} font-bold text-green-600 dark:text-green-400`}
                value={formData.valorUni}
                onChange={(e) => setFormData({...formData, valorUni: e.target.value})} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all mt-4 shadow-lg active:scale-95`}
          >
            <Save size={20} /> {produtoParaEditar ? 'Atualizar Dados' : 'Salvar Produto'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModalProdutos;