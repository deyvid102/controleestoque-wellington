import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useTheme } from '@/styles/ThemeContext';
import api from "@/services/api.js";

const LoginPage = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ email: '', senha: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(''); 
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      /** * AJUSTE PRINCIPAL:
       * Alterado de '/operadores' para '/operadores/login'.
       * Isso garante que você caia na função 'login' do controller, 
       * que não exige o campo 'nome'.
       */
      const response = await api.post('/operadores/login', formData);
      
      const { token, operador } = response.data;

      if (token) {
        localStorage.setItem('@SistemaEstoque:token', token);
        localStorage.setItem('@SistemaEstoque:user', JSON.stringify(operador));
        
        api.defaults.headers.Authorization = `Bearer ${token}`;

        navigate('/dashboard');
      }
    } catch (err) {
      // Captura a mensagem de erro específica enviada pelo seu backend
      const msgErro = err.response?.data?.error || 'E-mail ou senha inválidos.';
      setError(msgErro);
      console.error("Erro no login:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = `w-full pl-11 pr-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-500 ${
    isDarkMode 
      ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' 
      : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
  }`;

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900' : 'bg-slate-50'
    }`}>
      <div className={`w-full max-w-md p-8 rounded-3xl border shadow-xl ${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
      }`}>
        
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-2xl bg-blue-500/10 text-blue-500 mb-4">
            <LogIn size={32} />
          </div>
          <h1 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Bem-vindo de volta
          </h1>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Acesse sua conta de operador
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2 animate-bounce">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="email"
              name="email"
              placeholder="E-mail profissional"
              required
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className={inputStyle}
            />

          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="password"
              name="senha"
              placeholder="Sua senha"
              required
              autoComplete="current-password"
              value={formData.senha}
              onChange={handleChange}
              className={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all active:scale-95 shadow-lg flex justify-center items-center gap-2 ${
              loading 
                ? 'bg-slate-600 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Acessar Painel</>
            )}
          </button>
        </form>

        <p className={`text-center mt-8 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Sistema Gerenciador de Estoque &copy; 2026
        </p>
      </div>
    </div>
  );
};

export default LoginPage;