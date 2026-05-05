import { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { useTheme } from '@/styles/ThemeContext';
import api from '@/services/api';

const ModalPedidos = ({ isOpen, onClose, onRefresh, pedidoParaEditar = null }) => {
  const { isDarkMode } = useTheme();
  const [produtos, setProdutos] = useState([]);
  
  const formatarDataParaInput = (data) => {
    if (!data) return '';
    const d = new Date(data);
    if (isNaN(d.getTime())) return ''; // Valida se a data é válida
    return d.toISOString().split('T')[0];
  };

  const initialState = {
    cliente: '', 
    produto: '',     
    quantidade: 1,
    total: '',
    status: 'P',     
    pago: false,
    dataPedido: formatarDataParaInput(new Date()),
    dataEntregue: ''
  };

  const [pedido, setPedido] = useState(initialState);

  useEffect(() => {
    if (isOpen) {
      const fetchProdutos = async () => {
        try {
          const response = await api.get('/produtos');
          setProdutos(response.data);
        } catch (error) { console.error("Erro ao carregar produtos:", error); }
      };
      fetchProdutos();
    }
  }, [isOpen]);

  // Sincroniza o estado quando o modal abre ou o pedido para editar muda
  useEffect(() => {
    if (isOpen) {
      if (pedidoParaEditar) {
        setPedido({
          cliente: typeof pedidoParaEditar.cliente === 'object' 
            ? pedidoParaEditar.cliente?.nome 
            : pedidoParaEditar.cliente || '',
          produto: pedidoParaEditar.produto?._id || pedidoParaEditar.produto || '',
          quantidade: pedidoParaEditar.quantidade || 1,
          total: pedidoParaEditar.total || '',
          status: pedidoParaEditar.status || 'P',
          pago: pedidoParaEditar.pago || false,
          dataPedido: formatarDataParaInput(pedidoParaEditar.dataPedido),
          dataEntregue: formatarDataParaInput(pedidoParaEditar.dataEntregue)
        });
      } else {
        setPedido({
          ...initialState,
          dataPedido: formatarDataParaInput(new Date()) // Garante data atual na nova venda
        });
      }
    }
  }, [isOpen, pedidoParaEditar]);

  useEffect(() => {
    if (pedido.produto && pedido.quantidade > 0 && produtos.length > 0) {
      const produtoSelecionado = produtos.find(p => p._id === pedido.produto);
      if (produtoSelecionado && produtoSelecionado.valorUni) {
        const previsao = (parseFloat(produtoSelecionado.valorUni) * parseInt(pedido.quantidade)).toFixed(2);
        // Só atualiza se o total for diferente para evitar loops
        if (previsao !== pedido.total) {
           setPedido(prev => ({ ...prev, total: previsao }));
        }
      }
    }
  }, [pedido.produto, pedido.quantidade, produtos]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Preparar dados para envio (tratar strings vazias de data como null)
    const dadosParaEnviar = {
      ...pedido,
      dataEntregue: pedido.dataEntregue === '' ? null : pedido.dataEntregue
    };

    try {
      if (pedidoParaEditar?._id) {
        await api.put(`/pedidos/${pedidoParaEditar._id}`, dadosParaEnviar);
      } else {
        await api.post('/pedidos', dadosParaEnviar);
      }
      onRefresh(); 
      onClose();   
    } catch (error) {
      console.error("Erro ao salvar pedido:", error);
    }
  };

  const inputStyle = `w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
    isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
  }`;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className={`w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl transition-all duration-300 transform animate-in slide-in-from-bottom-10 ${
        isDarkMode ? 'bg-slate-800 border-t border-x border-slate-700 sm:border' : 'bg-white border-t border-x border-slate-100 sm:border'
      }`}>
        
        <div className="flex justify-center pt-3 sm:hidden">
          <div className={`w-12 h-1.5 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
        </div>

        <div className={`p-5 sm:p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            {pedidoParaEditar ? 'Editar Venda' : 'Nova Venda'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto pb-10 sm:pb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Data Pedido</label>
              <input type="date" className={inputStyle} value={pedido.dataPedido} onChange={(e) => setPedido({...pedido, dataPedido: e.target.value})} />
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Data Entrega</label>
              <input type="date" className={inputStyle} value={pedido.dataEntregue} onChange={(e) => setPedido({...pedido, dataEntregue: e.target.value})} />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Cliente</label>
            <input required type="text" placeholder="Nome do cliente" className={inputStyle} value={pedido.cliente} onChange={(e) => setPedido({...pedido, cliente: e.target.value})} />
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Produto</label>
            <select required className={inputStyle} value={pedido.produto} onChange={(e) => setPedido({...pedido, produto: e.target.value})}>
              <option value="">Selecione um produto</option>
              {produtos.map(p => (
                <option key={p._id} value={p._id}>{p.nome} - R$ {p.valorUni}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Quantidade</label>
              <input required type="number" min="1" className={inputStyle} value={pedido.quantidade} onChange={(e) => setPedido({...pedido, quantidade: e.target.value})} />
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total (R$)</label>
              <input required type="number" step="0.01" className={`${inputStyle} font-bold text-green-600`} value={pedido.total} onChange={(e) => setPedido({...pedido, total: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Status</label>
              <select className={inputStyle} value={pedido.status} onChange={(e) => setPedido({...pedido, status: e.target.value})}>
                <option value="P">Pendente</option>
                <option value="E">Entregue</option>
                <option value="C">Cancelado</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Pagamento</label>
              <select className={inputStyle} value={String(pedido.pago)} onChange={(e) => setPedido({...pedido, pago: e.target.value === 'true'})}>
                <option value="false">Não Pago</option>
                <option value="true">Pago</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className={`w-full ${pedidoParaEditar ? 'bg-blue-600' : 'bg-green-600'} text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all mt-4 shadow-lg active:scale-95`}
          >
            <CheckCircle size={20} /> {pedidoParaEditar ? 'Salvar Alterações' : 'Confirmar Venda'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModalPedidos;