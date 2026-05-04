import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useTheme } from '@/styles/ThemeContext';

const MainLayout = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`flex h-screen font-sans transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Barra Lateral fixa */}
      <Sidebar />

      {/* Área de Conteúdo Principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 
           Removido o header/topbar para dar mais espaço ao conteúdo.
           O padding (p-8) garante que o título das páginas não cole no topo.
        */}
        <section className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
};

export default MainLayout;