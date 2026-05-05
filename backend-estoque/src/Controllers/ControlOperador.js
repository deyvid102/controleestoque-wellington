const Operador = require('../models/ModelOperador');
const jwt = require('jsonwebtoken'); // Certifique-se de ter instalado: npm install jsonwebtoken

// FUNÇÃO DE LOGIN
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // 1. Verifica se e-mail e senha foram enviados
    if (!email || !senha) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    // 2. Busca o operador pelo e-mail (incluindo a senha para comparação)
    const operador = await Operador.findOne({ email });

    if (!operador) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    // 3. Usa o método do seu Model para comparar a senha criptografada
    const senhaValida = await operador.compararSenha(senha);

    if (!senhaValida) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    // 4. Gera o Token JWT (troque 'SUA_CHAVE_SECRETA' por algo seguro no seu .env)
    const token = jwt.sign(
      { id: operador._id, email: operador.email },
      process.env.JWT_SECRET || 'SUA_CHAVE_SECRETA',
      { expiresIn: '1d' }
    );

    // 5. Retorna o token e os dados do operador (sem a senha)
    const dadosOperador = operador.toObject();
    delete dadosOperador.senha;

    res.json({
      token,
      operador: dadosOperador
    });

  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: 'Erro interno ao processar login.' });
  }
};

// --- SUAS OUTRAS FUNÇÕES (Mantidas) ---

exports.create = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Todos os campos (nome, email, senha) são obrigatórios.' });
    }
    const operador = await Operador.create(req.body);
    const dadosOperador = operador.toObject();
    delete dadosOperador.senha;
    res.status(201).json(dadosOperador);
  } catch (error) {
    console.error("Erro detalhado no Post Operador:", error);
    if (error.code === 11000) return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
    res.status(500).json({ error: 'Erro interno ao criar operador' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const operadores = await Operador.find().select('-senha').lean();
    res.json(operadores);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar operadores' });
  }
};

exports.delete = async (req, res) => {
  try {
    const resultado = await Operador.findByIdAndDelete(req.params.id);
    if (!resultado) return res.status(404).json({ error: 'Operador não encontrado' });
    res.json({ message: 'Operador removido com sucesso' });
  } catch (error) {
    res.status(400).json({ error: 'ID inválido' });
  }
};