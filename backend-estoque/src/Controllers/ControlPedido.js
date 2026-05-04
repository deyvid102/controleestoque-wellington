const Pedidos = require('../models/ModelPedido');

// Removida a necessidade de getOrCreateCliente e Clientes model

exports.create = async (req, res) => {
    try {
        const { cliente, produto, quantidade, total, status, pago, dataPedido } = req.body;

        // Agora criamos o pedido salvando o nome do cliente diretamente como string
        const novoPedido = await Pedidos.create({
            cliente, // String required no seu novo Model
            produto,
            quantidade,
            total,
            status,
            pago,
            dataPedido: dataPedido || new Date()
        });

        // Retorna populado apenas com os dados do produto
        const pedidoCompleto = await Pedidos.findById(novoPedido._id)
            .populate('produto', 'nome precoVenda');

        res.status(201).json(pedidoCompleto);
    } catch (error) {
        console.error("Erro ao criar pedido:", error);
        res.status(400).json({ error: 'Erro ao processar pedido' });
    }
};

exports.getAll = async (req, res) => {
    try {
        const pedidos = await Pedidos.find()
            .sort({ createdAt: -1 })
            .populate('produto', 'nome precoVenda');
            // Removido .populate('cliente') já que agora é uma string
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar pedidos' });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { cliente, produto, quantidade, total, status, pago, dataEntregue, dataPedido } = req.body;

        // Prepara os dados para atualização direta
        const dadosAtualizados = {
            cliente, // Atualiza a string do nome se necessário
            produto,
            quantidade,
            total,
            status,
            pago,
            dataEntregue,
            dataPedido
        };

        const pedido = await Pedidos.findByIdAndUpdate(
            req.params.id, 
            dadosAtualizados, 
            { new: true, runValidators: true }
        ).populate('produto', 'nome precoVenda');
        
        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }

        res.json(pedido);
    } catch (error) {
        console.error("Erro ao atualizar pedido:", error);
        res.status(400).json({ error: 'Erro ao atualizar pedido' });
    }
};

exports.delete = async (req, res) => {
    try {
        const resultado = await Pedidos.findByIdAndDelete(req.params.id);
        if (!resultado) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }
        res.json({ message: 'Pedido removido com sucesso' });
    } catch (error) {
        res.status(400).json({ error: 'Erro ao remover pedido' });
    }
};