import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa'; 
import { useTheme } from '@/styles/ThemeContext';
import ModalProdutos from '@/components/modals/ModalProdutos';
import ModalConfirm from '@/components/modals/ModalConfirm'; 
import api from '@/services/api';

const ProdutosPage = () => {
  const { isDarkMode } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [produtoParaEditar, setProdutoParaEditar] = useState(null); // Estado para edição
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/produtos');
      setProdutos(response.data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Abre o modal para criação
  const handleNovoProduto = () => {
    setProdutoParaEditar(null);
    setIsModalOpen(true);
  };

  // Abre o modal para edição
  const handleEditClick = (produto) => {
    setProdutoParaEditar(produto);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (produto) => {
    setProdutoSelecionado(produto);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/produtos/${produtoSelecionado._id}`);
      fetchProdutos();
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  return (
    <div className="space-y-6 transition-colors duration-300">
      <div className="flex justify-between items-center">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
          Produtos
        </h1>
        <button 
          onClick={handleNovoProduto}
          className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all shadow-md active:scale-95"
        >
          <Plus size={20} /> Novo Produto
        </button>
      </div>

      <div className={`rounded-xl border shadow-sm overflow-hidden transition-all duration-300 ${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <div className={`p-4 border-b ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar no inventário..." 
              className={`w-full border rounded-lg py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all ${
                isDarkMode 
                ? 'bg-slate-900 border-slate-700 text-slate-200' 
                : 'bg-white border-slate-200 text-slate-700'
              }`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className={`${isDarkMode ? 'bg-slate-900/50 text-slate-400' : 'bg-slate-50 text-slate-500'} text-xs uppercase tracking-wider`}>
              <tr>
                <th className="px-6 py-4 font-semibold">Produto / Descrição</th>
                <th className="px-6 py-4 font-semibold text-center">Custo</th>
                <th className="px-6 py-4 font-semibold text-center">Venda</th>
                <th className="px-6 py-4 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
              {produtos.length > 0 ? produtos.map((produto) => (
                <tr key={produto._id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {produto.nome}
                      </span>
                      <span className="text-xs text-slate-500 line-clamp-1 italic">
                        {produto.descricao || "Sem descrição"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-400 text-sm">
                    R$ {Number(produto.custoUni || 0).toFixed(2)}
                  </td>
                  <td className={`px-6 py-4 text-center font-semibold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    R$ {Number(produto.valorUni || 0).toFixed(2)}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-4">
                      <button 
                        onClick={() => handleEditClick(produto)}
                        title="Editar Produto"
                        className="text-blue-500 hover:text-blue-600 transition-colors p-1"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(produto)}
                        title="Excluir Produto"
                        className="text-red-500 hover:text-red-600 transition-colors p-1"
                      >
                        <FaTrashAlt size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-slate-500">
                    {loading ? "Carregando..." : "Nenhum produto cadastrado."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalProdutos 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchProdutos} 
        produtoParaEditar={produtoParaEditar}
      />

      <ModalConfirm 
        isOpen={isDeleteModalOpen}
        type="danger"
        title="Excluir Produto"
        message={`Deseja realmente excluir o produto "${produtoSelecionado?.nome}"? Esta ação não pode ser desfeita.`}
        onConfirm={confirmDelete}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};

export default ProdutosPage;