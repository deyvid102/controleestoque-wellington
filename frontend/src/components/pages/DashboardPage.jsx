import { useState, useEffect } from 'react';
import { Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar 
} from 'recharts';
import { useTheme } from '@/styles/ThemeContext';
import api from '@/services/api';

const DashboardPage = () => {
  const { isDarkMode } = useTheme();
  const [data, setData] = useState({
    pedidos: [],
    produtosCount: 0,
    statsGrafico: []
  });
  const [loading, setLoading] = useState(true);

  // Cores dinâmicas para os gráficos
  const chartColors = {
    text: isDarkMode ? '#94a3b8' : '#64748b', 
    grid: isDarkMode ? '#334155' : '#e2e8f0', 
    tooltipBg: isDarkMode ? '#1e293b' : '#ffffff',
    tooltipText: isDarkMode ? '#f8fafc' : '#1e293b'
  };

  // Função auxiliar para criar data local sem erro de fuso horário
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

        const processarGrafico = (pedidos) => {
  const grupos = pedidos.reduce((acc, p) => {
    // Usamos a função criarDataLocal para evitar o erro de fuso horário
    const d = criarDataLocal(p.dataPedido || p.createdAt);
    if (isNaN(d.getTime())) return acc;

    // Criamos uma chave de ordenação (YYYY-MM-DD) e um label (DD/MM)
    const sortKey = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    if (!acc[sortKey]) {
      acc[sortKey] = { sortKey, data: label, receita: 0, vendas: 0 };
    }
    
    acc[sortKey].receita += parseFloat(p.total) || 0;
    acc[sortKey].vendas += 1;
    return acc;
  }, {});
  
  // Ordena pela chave cronológica (sortKey) antes de pegar os últimos 7 dias
  return Object.values(grupos)
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .slice(-7);
};

        setData({
          pedidos: listaPedidos,
          produtosCount: resProdutos.data?.length || 0,
          statsGrafico: processarGrafico(listaPedidos)
        });
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const receitaMensal = data.pedidos
    .filter(p => {
      // CORREÇÃO: Comparação de mês/ano usando data local
      const d = criarDataLocal(p.dataPedido || p.createdAt);
      return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
    })
    .reduce((acc, p) => acc + (parseFloat(p.total) || 0), 0);

  const vendasHoje = data.pedidos.filter(p => {
    // CORREÇÃO: Comparação de "Hoje" usando data local
    const d = criarDataLocal(p.dataPedido || p.createdAt);
    return d.toDateString() === hoje.toDateString();
  }).length;

  const stats = [
    { label: 'Produtos', value: data.produtosCount, icon: <Package size={22}/>, color: 'text-blue-500' },
    { label: 'Vendas Hoje', value: vendasHoje, icon: <ShoppingCart size={22}/>, color: 'text-green-500' },
    { label: 'Receita (Mês)', value: `R$ ${receitaMensal.toFixed(2)}`, icon: <DollarSign size={22}/>, color: 'text-yellow-500' },
  ];

  if (loading) return <div className="p-10 text-center animate-pulse text-slate-500">Sincronizando métricas...</div>;

  return (
    <div className={`space-y-8 p-4 min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-transparent text-slate-800'}`}>
      
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`p-6 rounded-2xl border shadow-sm transition-all duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                <p className="text-3xl font-black mt-1">{stat.value}</p>
              </div>
              <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'} ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Card Gráfico de Faturamento */}
        <div className={`p-6 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h3 className="font-bold mb-8 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-500"/> Faturamento Recente
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.statsGrafico}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                <XAxis 
                  dataKey="data" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  stroke={chartColors.text}
                  dy={10}
                />
                <YAxis 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  stroke={chartColors.text}
                  tickFormatter={(v) => `R$${v}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: chartColors.tooltipBg, 
                    borderColor: chartColors.grid,
                    color: chartColors.tooltipText,
                    borderRadius: '12px'
                  }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Area type="monotone" dataKey="receita" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReceita)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card Gráfico de Volume */}
        <div className={`p-6 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h3 className="font-bold mb-8 flex items-center gap-2">
            <ShoppingCart size={18} className="text-green-500"/> Volume de Pedidos
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.statsGrafico}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                <XAxis 
                  dataKey="data" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  stroke={chartColors.text}
                  dy={10}
                />
                <YAxis 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  stroke={chartColors.text}
                />
                <Tooltip 
                  cursor={{fill: isDarkMode ? '#334155' : '#f1f5f9', opacity: 0.4}}
                  contentStyle={{ 
                    backgroundColor: chartColors.tooltipBg, 
                    borderColor: chartColors.grid,
                    color: chartColors.tooltipText,
                    borderRadius: '12px'
                  }}
                />
                <Bar dataKey="vendas" fill="#10b981" radius={[6, 6, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;