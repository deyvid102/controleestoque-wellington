import { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { useTheme } from '@/styles/ThemeContext';
import api from '@/services/api';

const ModalPedidos = ({ isOpen, onClose, onRefresh, pedidoParaEditar = null }) => {
  const { isDarkMode } = useTheme();
  const [produtos, setProdutos] = useState([]);
  
  const formatarDataParaInput = (data) => {
    if (!data) return '';
    return new Date(data).toISOString().split('T')[0];
  };

  const initialState = {
    cliente: '', // Nomeado para 'cliente' conforme seu novo Model
    produto: '',     
    quantidade: 1,
    total: '',
    status: 'P',     
    pago: false,
    dataPedido: formatarDataParaInput(new Date()),
    dataEntregue: ''
  };

  const [pedido, setPedido] = useState(initialState);

  // 1. Busca produtos
  useEffect(() => {
    if (isOpen) {
      const fetchProdutos = async () => {
        try {
          const response = await api.get('/produtos');
          setProdutos(response.data);
        } catch (error) {
          console.error("Erro ao carregar produtos:", error);
        }
      };
      fetchProdutos();
    }
  }, [isOpen]);

  // 2. Sincroniza estado (Tratando o cliente como String)
  useEffect(() => {
    if (isOpen) {
      if (pedidoParaEditar) {
        setPedido({
          // Verifica se 'cliente' é objeto (formato antigo) ou string (formato novo)
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
        setPedido(initialState);
      }
    }
  }, [isOpen, pedidoParaEditar]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // O objeto 'pedido' já contém a string no campo 'cliente'
      if (pedidoParaEditar?._id) {
        await api.put(`/pedidos/${pedidoParaEditar._id}`, pedido);
      } else {
        await api.post('/pedidos', pedido);
      }
      onRefresh(); 
      onClose();   
    } catch (error) {
      console.error("Erro ao salvar pedido:", error);
      alert("Erro ao salvar pedido.");
    }
  };

  const inputStyle = `w-full p-2 rounded-lg border outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all ${
    isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl transition-all duration-300 ${
        isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
      }`}>
        <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            {pedidoParaEditar ? 'Editar Venda' : 'Nova Venda'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
            <input 
              required 
              type="text" 
              placeholder="Nome completo do cliente"
              className={inputStyle}
              value={pedido.cliente}
              onChange={(e) => setPedido({...pedido, cliente: e.target.value})} 
            />
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Produto</label>
            <select 
              required
              className={inputStyle}
              value={pedido.produto}
              onChange={(e) => setPedido({...pedido, produto: e.target.value})}
            >
              <option value="">Selecione um produto</option>
              {produtos.map(p => (
                <option key={p._id} value={p._id}>{p.nome}</option>
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
              <input required type="number" step="0.01" className={inputStyle} value={pedido.total} onChange={(e) => setPedido({...pedido, total: e.target.value})} />
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
            className={`w-full ${pedidoParaEditar ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all mt-2 shadow-lg active:scale-95`}
          >
            <CheckCircle size={20} /> {pedidoParaEditar ? 'Salvar Alterações' : 'Confirmar Venda'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModalPedidos;