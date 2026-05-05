import axios from 'axios';

const api = axios.create({
  // Tenta ler a variável do Render; se não existir (local), usa a porta 5000
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;