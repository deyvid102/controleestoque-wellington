import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Box, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '@/styles/ThemeContext';
import ModalConfirm from '@/components/modals/ModalConfirm'; // Certifique-se que o caminho está correto
import api from '@/services/api';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Vendas', path: '/vendas', icon: <ShoppingCart size={20} /> },
    { name: 'Produtos', path: '/produtos', icon: <Package size={20} /> },
  ];

  const handleLogout = () => {
    // 1. Limpa os dados de autenticação
    localStorage.removeItem('@SistemaEstoque:token');
    localStorage.removeItem('@SistemaEstoque:user');
    
    // 2. Remove o header do axios para segurança
    delete api.defaults.headers.Authorization;

    // 3. Redireciona para o login
    navigate('/login');
  };

  return (
    <>
      <aside className={`w-64 border-r flex flex-col transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <div className={`p-6 flex items-center gap-3 border-b ${
          isDarkMode ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <Box className={isDarkMode ? 'text-yellow-500' : 'text-yellow-600'} size={28} />
          <span className={`text-xl font-bold tracking-tight ${
            isDarkMode ? 'text-white' : 'text-slate-800'
          }`}>Estoque Wells</span>
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

        {/* Seção de Ações de Sistema */}
        <div className="p-4 space-y-2">
          {/* Botão de Tema */}
          <button 
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all border ${
              isDarkMode 
                ? 'border-slate-700 text-slate-400 hover:bg-slate-700' 
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span className="text-sm font-medium">{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>

          {/* Botão de Sair */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all border ${
              isDarkMode 
                ? 'border-red-500/20 text-red-400 hover:bg-red-500/10' 
                : 'border-red-100 text-red-600 hover:bg-red-50'
            }`}
          >
            <LogOut size={20} />
            <span className="text-sm font-bold">Sair do Sistema</span>
          </button>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 text-center">
          v1.0.0 - Deyvid Wellington
        </div>
      </aside>

      {/* Modal de Confirmação */}
      <ModalConfirm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogout}
        title="Deseja realmente sair?"
        message="Você precisará informar suas credenciais novamente para acessar o painel."
      />
    </>
  );
};

export default Sidebar;