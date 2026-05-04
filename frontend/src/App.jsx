import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { ThemeProvider } from '@/styles/ThemeContext'; // Importação essencial

// Importação das páginas reais
import DashboardPage from '@/components/pages/DashboardPage';
import ProdutosPage from '@/components/pages/ProdutosPage';
import VendasPage from '@/components/pages/VendasPage';

function App() {
  return (
    /* 
       O ThemeProvider DEVE envolver o roteador. 
       Isso garante que o MainLayout e a Sidebar (que usam o useTheme) 
       estejam dentro do contexto.
    */
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* O MainLayout gerencia o fundo dinâmico e contém a Sidebar */}
          <Route path="/" element={<MainLayout />}>
            
            {/* Dashboard como página inicial */}
            <Route index element={<DashboardPage />} />
            
            {/* Rota de Gerenciamento de Estoque */}
            <Route path="produtos" element={<ProdutosPage />} />
            
            {/* Rota de Histórico de Vendas */}
            <Route path="vendas" element={<VendasPage />} />
            
            {/* Fallback para redirecionar rotas inexistentes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;