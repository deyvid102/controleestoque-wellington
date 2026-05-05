import { useState, useEffect } from 'react';
import { Plus, Search, Package } from 'lucide-react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa'; 
import { useTheme } from '@/styles/ThemeContext';
import ModalProdutos from '@/components/modals/ModalProdutos';
import ModalConfirm from '@/components/modals/ModalConfirm'; 
import Pagination from '@/styles/Pagination'; 
import api from '@/services/api';

const ProdutosPage = () => {
  const { isDarkMode } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [produtoParaEditar, setProdutoParaEditar] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

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

  const produtosFiltrados = produtos.filter(produto => 
    produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (produto.descricao && produto.descricao.toLowerCase().includes(busca.toLowerCase()))
  );

  const totalPaginas = Math.ceil(produtosFiltrados.length / itensPorPagina);
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const produtosExibidos = produtosFiltrados.slice(indiceInicial, indiceInicial + itensPorPagina);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca]);

  const handleNovoProduto = () => {
    setProdutoParaEditar(null);
    setIsModalOpen(true);
  };

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
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Responsivo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Produtos
        </h1>
        <button 
          onClick={handleNovoProduto}
          className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-3 px-6 rounded-lg flex justify-center items-center gap-2 transition-all shadow-lg active:scale-95"
        >
          <Plus size={20} /> Novo Produto
        </button>
      </div>

      {/* Container Principal */}
      <div className={`rounded-xl border shadow-md overflow-hidden transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'
      }`}>
        {/* Busca Refinada */}
        <div className={`p-4 border-b ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
          <div className="relative w-full">
            <Search className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Pesquisar no inventário..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className={`w-full border rounded-lg py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all ${
                isDarkMode 
                ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600' 
                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className={`${isDarkMode ? 'bg-slate-900/50 text-slate-400' : 'bg-slate-100 text-slate-600'} text-xs uppercase tracking-wider`}>
              <tr>
                <th className="px-6 py-4 font-bold">Produto</th>
                <th className="px-6 py-4 font-bold text-center">Custo</th>
                <th className="px-6 py-4 font-bold text-center">Venda</th>
                <th className="px-6 py-4 font-bold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-200'}`}>
              {produtosExibidos.map((produto) => (
                <tr key={produto._id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-blue-50/50'}`}>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{produto.nome}</span>
                      <span className={`text-xs italic line-clamp-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                        {produto.descricao || 'Sem descrição'}
                      </span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-center text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    R$ {Number(produto.custoUni).toFixed(2)}
                  </td>
                  <td className={`px-6 py-4 text-center font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    R$ {Number(produto.valorUni).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEditClick(produto)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"><FaEdit size={18} /></button>
                      <button onClick={() => handleDeleteClick(produto)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><FaTrashAlt size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards Refinados */}
        <div className={`md:hidden divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-200'}`}>
          {produtosExibidos.length > 0 ? produtosExibidos.map((produto) => (
            <div key={produto._id} className="p-4 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex flex-col pr-2">
                  <span className={`font-bold text-lg leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{produto.nome}</span>
                  <span className="text-sm text-slate-500 italic mt-1">{produto.descricao || "Sem descrição"}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEditClick(produto)} className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}><FaEdit size={18} /></button>
                  <button onClick={() => handleDeleteClick(produto)} className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'}`}><FaTrashAlt size={18} /></button>
                </div>
              </div>
              <div className={`flex justify-between items-center p-3 rounded-lg border ${isDarkMode ? 'bg-slate-900/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Custo</span>
                  <span className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>R$ {Number(produto.custoUni).toFixed(2)}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase text-yellow-600 font-bold tracking-wider">Venda</span>
                  <span className={`text-lg font-black ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>R$ {Number(produto.valorUni).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="p-10 text-center flex flex-col items-center gap-3">
               {loading ? <span className="animate-pulse text-yellow-500">Carregando...</span> : <><Package size={48} className="text-slate-300" /><span className="text-slate-500 font-medium">Nenhum produto em estoque.</span></>}
            </div>
          )}
        </div>
      </div>

      {/* Paginação */}
      {produtosFiltrados.length > itensPorPagina && (
        <div className="flex justify-center pt-2">
          <Pagination 
            currentPage={paginaAtual} 
            totalPages={totalPaginas} 
            onPageChange={(page) => setPaginaAtual(page)} 
          />
        </div>
      )}

      <ModalProdutos isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={fetchProdutos} produtoParaEditar={produtoParaEditar} />
      <ModalConfirm isOpen={isDeleteModalOpen} type="danger" title="Excluir Produto" message={`Deseja excluir "${produtoSelecionado?.nome}"?`} onConfirm={confirmDelete} onClose={() => setIsDeleteModalOpen(false)} />
    </div>
  );
};

export default ProdutosPage;