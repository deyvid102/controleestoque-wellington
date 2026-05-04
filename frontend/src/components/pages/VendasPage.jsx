import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, CheckCircle, Clock, Calendar, Filter, Search } from 'lucide-react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa'; 
import { useTheme } from '@/styles/ThemeContext';
import ModalPedidos from '@/components/modals/ModalPedidos';
import ModalConfirm from '@/components/modals/ModalConfirm'; 
import FilterBar from '@/components/others/FilterBar';
import api from '@/services/api';

const VendasPage = () => {
  const { isDarkMode } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFilterBarOpen, setIsFilterBarOpen] = useState(false);
  
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [pedidoParaEditar, setPedidoParaEditar] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filtros, setFiltros] = useState({
    busca: '',
    pago: 'todos',
    status: 'todos',
    valorMin: '',
    valorMax: '',
    periodoTipo: 'todos',
    dataInicio: '',
    dataFim: '',
    campoData: 'dataPedido'
  });

  // CORREÇÃO: Formata a data ignorando o fuso horário UTC
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
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    const termoBusca = filtros.busca.toLowerCase();
    const nomeCliente = typeof pedido.cliente === 'object' ? pedido.cliente?.nome : pedido.cliente;
    const nomeProduto = pedido.produto?.nome || '';

    const matchesBusca = 
      (nomeCliente || '').toLowerCase().includes(termoBusca) || 
      nomeProduto.toLowerCase().includes(termoBusca);
    
    const matchesPago = filtros.pago === 'todos' || 
      (filtros.pago === 'pago' ? pedido.pago === true : pedido.pago === false);
    
    const matchesStatus = filtros.status === 'todos' || pedido.status === filtros.status;

    const valor = Number(pedido.total || 0);
    const matchesMin = filtros.valorMin === '' || valor >= Number(filtros.valorMin);
    const matchesMax = filtros.valorMax === '' || valor <= Number(filtros.valorMax);

    let matchesData = true;
    
    // CORREÇÃO: Cria a referência de data usando valores locais para evitar atraso de 1 dia
    const rawData = pedido[filtros.campoData];
    let dataRef = null;
    
    if (rawData) {
      const [ano, mes, dia] = rawData.split('T')[0].split('-');
      dataRef = new Date(ano, mes - 1, dia);
      dataRef.setHours(0, 0, 0, 0);
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (filtros.periodoTipo !== 'todos') {
      if (!dataRef) {
        matchesData = false;
      } else {
        if (filtros.periodoTipo === 'hoje') {
          matchesData = dataRef.getTime() === hoje.getTime();
        } else if (filtros.periodoTipo === 'mes') {
          matchesData = dataRef.getMonth() === hoje.getMonth() && 
                        dataRef.getFullYear() === hoje.getFullYear();
        } else if (filtros.periodoTipo === 'outro' && filtros.dataInicio && filtros.dataFim) {
          // Ajuste para datas do input (que também vêm em yyyy-mm-dd)
          const [iAno, iMes, iDia] = filtros.dataInicio.split('-');
          const [fAno, fMes, fDia] = filtros.dataFim.split('-');
          
          const inicio = new Date(iAno, iMes - 1, iDia);
          const fim = new Date(fAno, fMes - 1, fDia);
          fim.setHours(23, 59, 59);
          
          matchesData = dataRef >= inicio && dataRef <= fim;
        }
      }
    }

    return matchesBusca && matchesPago && matchesStatus && matchesMin && matchesMax && matchesData;
  });

  const handleLimparFiltros = () => {
    setFiltros({
      busca: '', pago: 'todos', status: 'todos', valorMin: '', valorMax: '',
      periodoTipo: 'todos', dataInicio: '', dataFim: '', campoData: 'dataPedido'
    });
    setIsFilterBarOpen(false);
  };

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

  const togglePagamento = async (pedido) => {
    try {
      await api.put(`/pedidos/${pedido._id}`, { ...pedido, pago: !pedido.pago });
      fetchPedidos();
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchPedidos(); }, []);

  const inputStyle = `text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'
  }`;

  return (
    <div className="space-y-6 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Vendas</h1>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsFilterBarOpen(true)}
            className={`p-2.5 rounded-lg border transition-all ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter size={20} />
          </button>
          <button onClick={handleNovaVenda} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 transition-all shadow-md active:scale-95">
            <Plus size={20} /> Nova Venda
          </button>
        </div>
      </div>

      <div className={`p-4 rounded-xl border flex flex-wrap gap-4 items-center ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-200'}`}>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" placeholder="Buscar cliente ou produto..." value={filtros.busca}
            onChange={(e) => setFiltros({...filtros, busca: e.target.value})}
            className={`${inputStyle} w-full pl-10 py-2`}
          />
        </div>
        <select value={filtros.pago} onChange={(e) => setFiltros({...filtros, pago: e.target.value})} className={`${inputStyle} px-3 py-2 min-w-[140px]`}>
          <option value="todos">Todos Pagamentos</option>
          <option value="pago">Pago</option>
          <option value="nao_pago">Não Pago</option>
        </select>
        <select value={filtros.status} onChange={(e) => setFiltros({...filtros, status: e.target.value})} className={`${inputStyle} px-3 py-2 min-w-[140px]`}>
          <option value="todos">Todos Status</option>
          <option value="P">Pendente</option>
          <option value="E">Entregue</option>
          <option value="C">Cancelado</option>
        </select>
      </div>
      
      {pedidosFiltrados.length === 0 && !loading ? (
        <div className="text-center py-20">
          <ShoppingBag size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-500">Nenhum resultado encontrado.</p>
        </div>
      ) : (
        <div className={`rounded-xl border shadow-sm overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className={`${isDarkMode ? 'bg-slate-900/50 text-slate-400' : 'bg-slate-50 text-slate-500'} text-xs uppercase tracking-wider`}>
                <tr>
                  <th className="px-6 py-4 font-semibold">Cliente / Data</th>
                  <th className="px-6 py-4 font-semibold">Produto</th>
                  <th className="px-6 py-4 font-semibold text-center">Total</th>
                  <th className="px-6 py-4 font-semibold text-center">Pagamento</th>
                  <th className="px-6 py-4 font-semibold text-center">Status / Entrega</th>
                  <th className="px-6 py-4 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                {pedidosFiltrados.map((pedido) => (
                  <tr key={pedido._id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {typeof pedido.cliente === 'object' ? pedido.cliente?.nome : pedido.cliente || 'N/A'}
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1"><Calendar size={10} /> {formatarDataBR(pedido.dataPedido)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{pedido.produto?.nome || 'N/A'}</span>
                        <span className="text-xs text-slate-500">Qtd: {pedido.quantidade}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-center font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>R$ {Number(pedido.total || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => togglePagamento(pedido)} className={`flex items-center gap-2 mx-auto px-3 py-1 rounded-full text-[10px] uppercase font-black transition-all active:scale-95 ${pedido.pago ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                        {pedido.pago ? <CheckCircle size={12} /> : <Clock size={12} />}{pedido.pago ? 'Pago' : 'Não Pago'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${pedido.status === 'E' ? (isDarkMode ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-100 text-blue-700 border-blue-200') : pedido.status === 'C' ? (isDarkMode ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-100 text-red-700 border-red-200') : (isDarkMode ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-100 text-yellow-700 border-yellow-200')}`}>{pedido.status === 'E' ? 'Entregue' : pedido.status === 'C' ? 'Cancelado' : 'Pendente'}</span>
                        {pedido.dataEntregue && <span className={`text-[9px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Entregue: {formatarDataBR(pedido.dataEntregue)}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-4">
                        <button onClick={() => handleEditClick(pedido)} className="text-blue-500 hover:text-blue-600 transition-colors"><FaEdit size={18} /></button>
                        <button onClick={() => handleDeleteClick(pedido)} className="text-red-500 hover:text-red-600 transition-colors"><FaTrashAlt size={17} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <FilterBar 
        isOpen={isFilterBarOpen} onClose={() => setIsFilterBarOpen(false)}
        onApply={() => setIsFilterBarOpen(false)} onClear={handleLimparFiltros} title="Filtros Avançados"
      >
        <div className="space-y-6">
          <div>
            <label className={`block text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Busca Rápida</label>
            <input type="text" value={filtros.busca} onChange={(e) => setFiltros({...filtros, busca: e.target.value})} placeholder="Nome do cliente ou produto..." className={`w-full p-2.5 ${inputStyle}`} />
          </div>
          <div>
            <label className={`block text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Faixa de Valor (R$)</label>
            <div className="flex items-center gap-2">
              <input type="number" placeholder="Mín" value={filtros.valorMin} onChange={(e) => setFiltros({...filtros, valorMin: e.target.value})} className={`w-full p-2.5 ${inputStyle}`} />
              <span className="text-slate-500">-</span>
              <input type="number" placeholder="Máx" value={filtros.valorMax} onChange={(e) => setFiltros({...filtros, valorMax: e.target.value})} className={`w-full p-2.5 ${inputStyle}`} />
            </div>
          </div>
          <div>
            <label className={`block text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Período</label>
            <div className="space-y-3">
              <select value={filtros.campoData} onChange={(e) => setFiltros({...filtros, campoData: e.target.value})} className={`w-full p-2.5 ${inputStyle}`}>
                <option value="dataPedido">Data do Pedido</option>
                <option value="dataEntregue">Data da Entrega</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                {['todos', 'hoje', 'mes', 'outro'].map((tipo) => (
                  <button key={tipo} onClick={() => setFiltros({...filtros, periodoTipo: tipo})} className={`py-2 text-xs font-bold rounded-lg border transition-all ${filtros.periodoTipo === tipo ? 'bg-blue-600 border-blue-600 text-white' : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50')}`}>
                    {tipo === 'todos' ? 'TODOS' : tipo === 'mes' ? 'ESTE MÊS' : tipo.toUpperCase()}
                  </button>
                ))}
              </div>
              {filtros.periodoTipo === 'outro' && (
                <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-1">
                  <input type="date" value={filtros.dataInicio} onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})} className={`w-full p-2.5 ${inputStyle}`} />
                  <input type="date" value={filtros.dataFim} onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})} className={`w-full p-2.5 ${inputStyle}`} />
                </div>
              )}
            </div>
          </div>
        </div>
      </FilterBar>

      <ModalPedidos isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={fetchPedidos} pedidoParaEditar={pedidoParaEditar} />
      <ModalConfirm isOpen={isDeleteModalOpen} type="danger" title="Excluir Venda" message="Deseja realmente excluir esta venda?" onConfirm={confirmDelete} onClose={() => setIsDeleteModalOpen(false)} />
    </div>
  );
};

export default VendasPage;