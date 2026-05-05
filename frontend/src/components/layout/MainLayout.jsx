import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomBar from './BottomBar';
import { useTheme } from '@/styles/ThemeContext';

const MainLayout = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`flex h-screen font-sans transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* 
          Sidebar: 
          'hidden' esconde por padrão (mobile). 
          'md:flex' mostra como flexbox apenas em telas médias ou maiores. 
      */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Área de Conteúdo Principal */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <section className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </section>
      </main>

      {/* 
          BottomBar: 
          O componente já deve ter 'md:hidden' interno, 
          mas garantimos o posicionamento fixo aqui se necessário. 
      */}
      <BottomBar />
    </div>
  );
};

export default MainLayout;