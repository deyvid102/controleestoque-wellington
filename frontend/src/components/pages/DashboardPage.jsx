import { useState, useEffect } from 'react';
import { Package, ShoppingCart, DollarSign, TrendingUp, Clock, PieChart as PieIcon } from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useTheme } from '@/styles/ThemeContext';
import api from '@/services/api';

const DashboardPage = () => {
  const { isDarkMode } = useTheme();
  const [data, setData] = useState({
    pedidos: [],
    produtosCount: 0,
    statsGrafico: [],
    ultimasVendas: [],
    maisVendidos: []
  });
  const [loading, setLoading] = useState(true);

  // Cores para as fatias do gráfico de pizza
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const chartColors = {
    text: isDarkMode ? '#94a3b8' : '#64748b', 
    grid: isDarkMode ? '#334155' : '#e2e8f0', 
    tooltipBg: isDarkMode ? '#1e293b' : '#ffffff',
    tooltipText: isDarkMode ? '#f8fafc' : '#1e293b'
  };

  const criarDataLocal = (dataString) => {
    if (!dataString) return new Date();
    const [ano, mes, dia] = dataString.split('T')[0].split('-');
    return new Date(ano, mes - 1, dia);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resPedidos, resProdutos] = await Promise.all([
          api.get('/pedidos'),
          api.get('/produtos')
        ]);

        const listaPedidos = Array.isArray(resPedidos.data) ? resPedidos.data : [];

        // 1. Processar Faturamento 7 dias
        const processarGrafico = (pedidos) => {
          const grupos = pedidos.reduce((acc, p) => {
            const d = criarDataLocal(p.dataPedido || p.createdAt);
            if (isNaN(d.getTime())) return acc;
            const sortKey = d.toISOString().split('T')[0];
            const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            if (!acc[sortKey]) acc[sortKey] = { sortKey, data: label, receita: 0 };
            acc[sortKey].receita += parseFloat(p.total) || 0;
            return acc;
          }, {});
          return Object.values(grupos).sort((a, b) => a.sortKey.localeCompare(b.sortKey)).slice(-7);
        };

        // 2. Processar Produtos Mais Vendidos (Pizza)
        const processarMaisVendidos = (pedidos) => {
          const contagem = pedidos.reduce((acc, p) => {
            const nome = p.produto?.nome || 'Não identificado';
            acc[nome] = (acc[nome] || 0) + (Number(p.quantidade) || 1);
            return acc;
          }, {});
          
          return Object.entries(contagem)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5 produtos
        };

        setData({
          pedidos: listaPedidos,
          produtosCount: resProdutos.data?.length || 0,
          statsGrafico: processarGrafico(listaPedidos),
          ultimasVendas: [...listaPedidos].reverse().slice(0, 5),
          maisVendidos: processarMaisVendidos(listaPedidos)
        });
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const hoje = new Date();
  const receitaMensal = data.pedidos
    .filter(p => {
      const d = criarDataLocal(p.dataPedido || p.createdAt);
      return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
    })
    .reduce((acc, p) => acc + (parseFloat(p.total) || 0), 0);

  const stats = [
    { label: 'Prod.', value: data.produtosCount, color: 'text-blue-500' },
    { label: 'Hoje', value: data.pedidos.filter(p => criarDataLocal(p.dataPedido).toDateString() === hoje.toDateString()).length, color: 'text-green-500' },
    { label: 'Mês', value: `R$${Math.round(receitaMensal)}`, color: 'text-yellow-500' },
  ];

  if (loading) return <div className="p-10 text-center animate-pulse text-slate-500">Sincronizando métricas...</div>;

  return (
    <div className={`space-y-4 p-3 md:p-6 pb-24 min-h-screen transition-colors ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50/50 text-slate-800'}`}>
      
      {/* Cards Lado a Lado */}
      <div className="grid grid-cols-3 gap-2 md:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`p-3 md:p-6 rounded-xl border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <p className={`text-[9px] md:text-xs font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
            <p className="text-sm md:text-2xl font-black">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Gráfico Faturamento */}
        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h3 className="text-xs md:text-sm font-bold mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-blue-500"/> Faturamento (7 dias)</h3>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.statsGrafico} margin={{ left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                <XAxis dataKey="data" fontSize={10} tickLine={false} axisLine={false} stroke={chartColors.text} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} stroke={chartColors.text} />
                <Tooltip contentStyle={{ backgroundColor: chartColors.tooltipBg, borderRadius: '10px', fontSize: '11px', border: 'none' }} />
                <Area type="monotone" dataKey="receita" stroke="#3b82f6" fillOpacity={0.2} fill="#3b82f6" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Pizza (Produtos Mais Vendidos) */}
        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h3 className="text-xs md:text-sm font-bold mb-4 flex items-center gap-2"><PieIcon size={16} className="text-purple-500"/> Produtos Mais Vendidos</h3>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.maisVendidos}
                  cx="50%"
                  cy="50%"
                  innerRadius={window.innerWidth < 768 ? 40 : 60}
                  outerRadius={window.innerWidth < 768 ? 60 : 80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.maisVendidos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: chartColors.tooltipBg, borderRadius: '10px', fontSize: '11px', border: 'none' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Últimas Vendas */}
        <div className={`p-4 rounded-2xl border lg:col-span-2 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h3 className="text-xs md:text-sm font-bold mb-4 flex items-center gap-2"><Clock size={16} className="text-slate-400"/> Últimas Vendas</h3>
          <div className="space-y-3">
            {data.ultimasVendas.map((venda, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-dashed border-slate-200 dark:border-slate-700 pb-2 last:border-0">
                <div className="flex flex-col">
                  <span className="text-xs font-bold truncate max-w-[150px]">{typeof venda.cliente === 'object' ? venda.cliente?.nome : venda.cliente}</span>
                  <span className="text-[10px] text-slate-500">{venda.produto?.nome} • Qtd: {venda.quantidade}</span>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-black ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>R$ {Number(venda.total).toFixed(2)}</span>
                  <p className={`text-[9px] font-bold uppercase ${venda.pago ? 'text-blue-500' : 'text-amber-500'}`}>{venda.pago ? 'Pago' : 'Pendente'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;