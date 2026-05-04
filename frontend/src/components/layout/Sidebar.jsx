import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Box, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/styles/ThemeContext';

const Sidebar = () => {
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Vendas', path: '/vendas', icon: <ShoppingCart size={20} /> },
    { name: 'Produtos', path: '/produtos', icon: <Package size={20} /> },
  ];

  return (
    <aside className={`w-64 border-r flex flex-col transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
    }`}>
      <div className={`p-6 flex items-center gap-3 border-b ${
        isDarkMode ? 'border-slate-700' : 'border-slate-200'
      }`}>
        <Box className={isDarkMode ? 'text-yellow-500' : 'text-yellow-600'} size={28} />
        <span className={`text-xl font-bold tracking-tight ${
          isDarkMode ? 'text-white' : 'text-slate-800'
        }`}>EstoqueMAX</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-yellow-500 text-white font-bold shadow-md shadow-yellow-500/20'
                  : isDarkMode 
                    ? 'text-slate-400 hover:bg-slate-700 hover:text-white' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-2">
        <button 
          onClick={toggleTheme}
          className={`w-full flex items-center justify-center gap-2 p-2 rounded-lg border transition-colors ${
            isDarkMode 
              ? 'border-slate-700 text-slate-400 hover:bg-slate-700' 
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          <span className="text-sm font-medium">{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
        </button>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 text-center">
        v1.0.0 - Deyvid Wellington
      </div>
    </aside>
  );
};

export default Sidebar;