import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { ThemeProvider } from '@/styles/ThemeContext';

// Importação das páginas
import DashboardPage from '@/components/pages/DashboardPage';
import ProdutosPage from '@/components/pages/ProdutosPage';
import VendasPage from '@/components/pages/VendasPage';
import LoginPage from '@/login/LoginPage';

// COMPONENTE DE PROTEÇÃO DE ROTA
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('@SistemaEstoque:token');
  
  // Se não houver token, redireciona para o login e limpa qualquer tentativa de histórico
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota Pública */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rotas Protegidas: Todas dentro do MainLayout passam pela verificação */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Redireciona a raiz "/" automaticamente para o dashboard se logado */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="produtos" element={<ProdutosPage />} />
            <Route path="vendas" element={<VendasPage />} />
          </Route>

          {/* Fallback para rotas inexistentes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;