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

  // Monitora se há um produto para editar ao abrir o modal
  useEffect(() => {
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
  }, [produtoParaEditar, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (produtoParaEditar) {
        // Modo Edição: PUT
        await api.put(`/produtos/${produtoParaEditar._id}`, formData);
      } else {
        // Modo Criação: POST
        await api.post('/produtos', formData);
      }
      
      onRefresh(); 
      onClose();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      alert("Erro ao salvar produto. Verifique a conexão ou os dados inseridos.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
        isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
      }`}>
        <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            {produtoParaEditar ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Nome</label>
            <input 
              required
              type="text" 
              className={`w-full p-2 rounded-lg border outline-none focus:ring-2 focus:ring-yellow-500/50 ${
                isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Descrição (Opcional)</label>
            <textarea 
              rows="2"
              className={`w-full p-2 rounded-lg border outline-none focus:ring-2 focus:ring-yellow-500/50 ${
                isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Custo (R$)</label>
              <input 
                required
                type="number" 
                step="0.01" 
                className={`w-full p-2 rounded-lg border outline-none focus:ring-2 focus:ring-yellow-500/50 ${
                  isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
                value={formData.custoUni}
                onChange={(e) => setFormData({...formData, custoUni: e.target.value})} 
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Venda (R$)</label>
              <input 
                required
                type="number" 
                step="0.01" 
                className={`w-full p-2 rounded-lg border outline-none focus:ring-2 focus:ring-yellow-500/50 ${
                  isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
                value={formData.valorUni}
                onChange={(e) => setFormData({...formData, valorUni: e.target.value})} 
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all mt-4 shadow-lg active:scale-95">
            <Save size={20} /> {produtoParaEditar ? 'Atualizar Dados' : 'Salvar Produto'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModalProdutos;