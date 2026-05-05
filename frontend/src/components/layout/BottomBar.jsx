import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '@/styles/ThemeContext';
import ModalConfirm from '@/components/modals/ModalConfirm';
import api from '@/services/api';

const BottomBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const menuItems = [
    { name: 'Início', path: '/dashboard', icon: <LayoutDashboard size={22} /> },
    { name: 'Vendas', path: '/vendas', icon: <ShoppingCart size={22} /> },
    { name: 'Produtos', path: '/produtos', icon: <Package size={22} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('@SistemaEstoque:token');
    localStorage.removeItem('@SistemaEstoque:user');
    delete api.defaults.headers.Authorization;
    navigate('/login');
  };

  return (
    <>
      <nav 
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 border-t transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex justify-around items-center h-16">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all relative ${
                  isActive
                    ? 'text-yellow-500 font-bold'
                    : isDarkMode 
                      ? 'text-slate-400' 
                      : 'text-slate-500'
                }`}
              >
                <div className={isActive ? 'scale-110 transition-transform' : ''}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-medium">{item.name}</span>
                
                {isActive && (
                  <div className="absolute bottom-0 w-8 h-1 bg-yellow-500 rounded-t-full shadow-[0_-2px_10px_rgba(234,179,8,0.4)]" />
                )}
              </Link>
            );
          })}

          {/* Botão de Tema */}
          <button 
            onClick={toggleTheme}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
            <span className="text-[10px] font-medium">Tema</span>
          </button>

          {/* Botão de Sair (Logout) */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
              isDarkMode ? 'text-red-400' : 'text-red-500'
            }`}
          >
            <LogOut size={22} />
            <span className="text-[10px] font-bold">Sair</span>
          </button>
        </div>
      </nav>

      {/* Modal de Confirmação */}
      <ModalConfirm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogout}
        title="Sair do sistema?"
        message="Deseja realmente encerrar sua sessão atual?"
      />
    </>
  );
};

export default BottomBar;