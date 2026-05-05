import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Calendar, Search, Filter } from 'lucide-react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa'; 
import { useTheme } from '@/styles/ThemeContext';
import ModalPedidos from '@/components/modals/ModalPedidos';
import ModalConfirm from '@/components/modals/ModalConfirm'; 
import FilterBar from '@/components/others/FilterBar'; // Ajustado para components/others
import Pagination from '@/styles/Pagination'; 
import api from '@/services/api';

const VendasPage = () => {
  const { isDarkMode } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [pedidoParaEditar, setPedidoParaEditar] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  // Estado inicial dos filtros para facilitar o "Limpar tudo"
  const filtrosIniciais = {
    busca: '', 
    pago: 'todos', 
    status: 'todos',
    dataPedido: '',
    dataEntrega: '',
    precoMin: '',
    precoMax: ''
  };

  const [filtros, setFiltros] = useState(filtrosIniciais);

  const formatarDataBR = (data) => {
    if (!data) return '--/--/--';
    const [ano, mes, dia] = data.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pedidos');
      setPedidos(response.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    const termoBusca = filtros.busca.toLowerCase();
    const nomeCliente = typeof pedido.cliente === 'object' ? pedido.cliente?.nome : pedido.cliente;
    const nomeProduto = pedido.produto?.nome || '';
    
    const matchesBusca = (nomeCliente || '').toLowerCase().includes(termoBusca) || nomeProduto.toLowerCase().includes(termoBusca);
    const matchesPago = filtros.pago === 'todos' || (filtros.pago === 'pago' ? pedido.pago === true : pedido.pago === false);
    const matchesStatus = filtros.status === 'todos' || pedido.status === filtros.status;
    
    // Datas - usando dataEntregue do banco
    const matchesDataPedido = !filtros.dataPedido || (pedido.dataPedido && pedido.dataPedido.startsWith(filtros.dataPedido));
    const matchesDataEntrega = !filtros.dataEntrega || (pedido.dataEntregue && pedido.dataEntregue.startsWith(filtros.dataEntrega));

    // Lógica de Preço (Refinada para não travar a lista se vazio)
    const valorTotal = Number(pedido.total || 0);
    const matchesMin = filtros.precoMin === '' || valorTotal >= Number(filtros.precoMin);
    const matchesMax = filtros.precoMax === '' || valorTotal <= Number(filtros.precoMax);

    return matchesBusca && matchesPago && matchesStatus && matchesDataPedido && matchesDataEntrega && matchesMin && matchesMax;
  });

  const totalPaginas = Math.ceil(pedidosFiltrados.length / itensPorPagina);
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const pedidosExibidos = pedidosFiltrados.slice(indiceInicial, indiceInicial + itensPorPagina);

  useEffect(() => { setPaginaAtual(1); }, [filtros]);
  useEffect(() => { fetchPedidos(); }, []);

  const handleNovaVenda = () => { setPedidoParaEditar(null); setIsModalOpen(true); };
  const handleEditClick = (pedido) => { setPedidoParaEditar(pedido); setIsModalOpen(true); };
  const handleDeleteClick = (pedido) => { setPedidoSelecionado(pedido); setIsDeleteModalOpen(true); };
  
  const confirmDelete = async () => {
    try { 
      await api.delete(`/pedidos/${pedidoSelecionado._id}`); 
      fetchPedidos(); 
      setIsDeleteModalOpen(false); 
    } catch (error) { console.error(error); }
  };

  const inputStyle = `w-full text-sm rounded-lg border p-2.5 outline-none transition-all ${
    isDarkMode 
      ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-500/50' 
      : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-blue-200'
  } focus:ring-2`;

  const labelStyle = `text-[10px] font-bold uppercase mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`;

  return (
    <div className="space-y-4 md:space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Vendas</h1>
        <div className="flex w-full sm:w-auto gap-2">
            <button 
                onClick={() => setIsFilterOpen(true)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium transition-all ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
            >
                <Filter size={18} /> Filtros
            </button>
            <button onClick={handleNovaVenda} className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-lg flex justify-center items-center gap-2 transition-all shadow-md active:scale-95">
                <Plus size={20} /> Nova Venda
            </button>
        </div>
      </div>

      {/* Busca Rápida */}
      <div className={`relative rounded-xl border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" placeholder="Buscar cliente ou produto..." value={filtros.busca}
          onChange={(e) => setFiltros({...filtros, busca: e.target.value})}
          className={`w-full pl-12 pr-4 py-3.5 bg-transparent outline-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
        />
      </div>
      
      {/* Tabela de Vendas (Permanecendo com o layout anterior que você aprovou) */}
      {pedidosFiltrados.length === 0 && !loading ? (
        <div className={`text-center py-20 rounded-xl border border-dashed transition-colors ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'
        }`}>
          <ShoppingBag size={48} className="mx-auto text-slate-300 mb-4" />
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} font-medium`}>Nenhuma venda encontrada.</p>
        </div>
      ) : (
        <div className={`rounded-xl border shadow-md overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className={`${isDarkMode ? 'bg-slate-900/50 text-slate-400' : 'bg-slate-100 text-slate-600'} text-xs uppercase tracking-wider font-bold`}>
                <tr>
                  <th className="px-6 py-4">Cliente / Pedido</th>
                  <th className="px-6 py-4">Entrega</th>
                  <th className="px-6 py-4">Produto</th>
                  <th className="px-6 py-4 text-center">Total</th>
                  <th className="px-6 py-4 text-center">Pagamento</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                {pedidosExibidos.map((pedido) => (
                  <tr key={pedido._id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-blue-50/30'}`}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{typeof pedido.cliente === 'object' ? pedido.cliente?.nome : pedido.cliente || 'N/A'}</span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1"><Calendar size={10} /> {formatarDataBR(pedido.dataPedido)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                        <span className={`font-medium flex items-center gap-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            <Calendar size={12} className="text-blue-500" /> {formatarDataBR(pedido.dataEntregue)}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{pedido.produto?.nome || 'N/A'}</span>
                        <span className="text-xs text-slate-500 font-medium">Qtd: {pedido.quantidade}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-center font-black ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>R$ {Number(pedido.total || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${pedido.pago ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
                        {pedido.pago ? 'PAGO' : 'NÃO PAGO'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${pedido.status === 'E' ? 'bg-blue-500/10 text-blue-600 border-blue-200' : pedido.status === 'C' ? 'bg-red-500/10 text-red-600 border-red-200' : 'bg-yellow-500/10 text-yellow-700 border-yellow-200'}`}>
                         {pedido.status === 'E' ? 'ENTREGUE' : pedido.status === 'C' ? 'CANCELADO' : 'PENDENTE'}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-3 text-lg">
                        <button onClick={() => handleEditClick(pedido)} className="text-blue-500 hover:scale-110 transition-transform"><FaEdit /></button>
                        <button onClick={() => handleDeleteClick(pedido)} className="text-red-500 hover:scale-110 transition-transform"><FaTrashAlt /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700">
             {pedidosExibidos.map(pedido => (
                 <div key={pedido._id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{typeof pedido.cliente === 'object' ? pedido.cliente?.nome : pedido.cliente}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Entrega: {formatarDataBR(pedido.dataEntregue)}</p>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={() => handleEditClick(pedido)} className="text-blue-500 p-2"><FaEdit size={18}/></button>
                             <button onClick={() => handleDeleteClick(pedido)} className="text-red-500 p-2"><FaTrashAlt size={18}/></button>
                        </div>
                    </div>
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'} flex justify-between items-center`}>
                        <span className="text-sm">{pedido.produto?.nome}</span>
                        <span className={`font-black ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>R$ {Number(pedido.total).toFixed(2)}</span>
                    </div>
                 </div>
             ))}
          </div>
        </div>
      )}

      {pedidosFiltrados.length > itensPorPagina && (
        <Pagination currentPage={paginaAtual} totalPages={totalPaginas} onPageChange={(page) => setPaginaAtual(page)} />
      )}

      {/* Sidebar de Filtros */}
      <FilterBar 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)}
        onApply={() => setIsFilterOpen(false)}
        onClear={() => setFiltros(filtrosIniciais)}
      >
        <div className="space-y-4">
          <div>
            <label className={labelStyle}>Data do Pedido</label>
            <input type="date" value={filtros.dataPedido} onChange={(e) => setFiltros({...filtros, dataPedido: e.target.value})} className={inputStyle} />
          </div>
          <div>
            <label className={labelStyle}>Data de Entrega</label>
            <input type="date" value={filtros.dataEntrega} onChange={(e) => setFiltros({...filtros, dataEntrega: e.target.value})} className={inputStyle} />
          </div>
          <div>
            <label className={labelStyle}>Faixa de Preço (R$)</label>
            <div className="flex gap-2">
              <input type="number" placeholder="Min" value={filtros.precoMin} onChange={(e) => setFiltros({...filtros, precoMin: e.target.value})} className={inputStyle} />
              <input type="number" placeholder="Max" value={filtros.precoMax} onChange={(e) => setFiltros({...filtros, precoMax: e.target.value})} className={inputStyle} />
            </div>
          </div>
          <div>
            <label className={labelStyle}>Pagamento</label>
            <select value={filtros.pago} onChange={(e) => setFiltros({...filtros, pago: e.target.value})} className={inputStyle}>
              <option value="todos">Todos</option>
              <option value="pago">Pago</option>
              <option value="nao_pago">Não Pago</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>Status</label>
            <select value={filtros.status} onChange={(e) => setFiltros({...filtros, status: e.target.value})} className={inputStyle}>
              <option value="todos">Todos</option>
              <option value="P">Pendente</option>
              <option value="E">Entregue</option>
              <option value="C">Cancelado</option>
            </select>
          </div>
        </div>
      </FilterBar>

      <ModalPedidos isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={fetchPedidos} pedidoParaEditar={pedidoParaEditar} />
      <ModalConfirm isOpen={isDeleteModalOpen} type="danger" title="Excluir Venda" message="Deseja realmente excluir esta venda?" onConfirm={confirmDelete} onClose={() => setIsDeleteModalOpen(false)} />
    </div>
  );
};

export default VendasPage;