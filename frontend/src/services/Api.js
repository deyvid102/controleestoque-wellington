import axios from 'axios';

const api = axios.create({
  // URL do seu backend Node.js. 
  // No futuro, ao subir para o Render ou VPS, basta alterar aqui.
  baseURL: 'http://localhost:5000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;