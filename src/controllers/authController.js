const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ========================================
// CADASTRAR USUÁRIO
// ========================================

async function cadastrarUsuario(req, res) {
    try {
        const { username, password } = req.body;

        // ========================================
        // VALIDAÇÃO
        // ========================================

        if (!username || !password) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Usuário e senha são obrigatórios."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "A senha deve ter pelo menos 6 caracteres."
            });
        }

        // ========================================
        // VERIFICAR SE USUÁRIO JÁ EXISTE
        // ========================================

        const usuarioExistente = await User.findOne({
            username: username.toLowerCase().trim()
        });

        if (usuarioExistente) {
            return res.status(409).json({
                sucesso: false,
                mensagem: "Este usuário já está cadastrado."
            });
        }

        // ========================================
        // CRIPTOGRAFAR SENHA
        // ========================================

        const passwordHash = await bcrypt.hash(password, 10);

        // ========================================
        // CRIAR USUÁRIO
        // ========================================

        const usuario = await User.create({
            username: username.toLowerCase().trim(),
            passwordHash
        });

        // ========================================
        // RESPOSTA
        // ========================================

        return res.status(201).json({
            sucesso: true,
            mensagem: "Usuário cadastrado com sucesso.",
            usuario: {
                id: usuario._id,
                username: usuario.username,
                role: usuario.role
            }
        });

    } catch (error) {
        console.error(
            "Erro ao cadastrar usuário:",
            error
        );

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro interno ao cadastrar usuário."
        });
    }
}

// ========================================
// LOGIN
// ========================================

async function login(req, res) {
    try {
        const { username, password } = req.body;

        // ========================================
        // VALIDAÇÃO
        // ========================================

        if (!username || !password) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Usuário e senha são obrigatórios."
            });
        }

        // ========================================
        // BUSCAR USUÁRIO
        // ========================================

        const usuario = await User.findOne({
            username: username.toLowerCase().trim()
        });

        if (!usuario) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "Usuário ou senha inválidos."
            });
        }

        // ========================================
        // VERIFICAR SENHA
        // ========================================

        const senhaValida = await bcrypt.compare(
            password,
            usuario.passwordHash
        );

        if (!senhaValida) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "Usuário ou senha inválidos."
            });
        }

        // ========================================
        // GERAR TOKEN
        // ========================================

        const token = jwt.sign(
            {
                id: usuario._id,
                username: usuario.username,
                role: usuario.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "8h"
            }
        );

        // ========================================
        // RESPOSTA
        // ========================================

        return res.json({
            sucesso: true,
            mensagem: "Login realizado com sucesso.",
            token,
            usuario: {
                id: usuario._id,
                username: usuario.username,
                role: usuario.role
            }
        });

    } catch (error) {
        console.error(
            "Erro no login:",
            error
        );

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro interno ao realizar login."
        });
    }
}

// ========================================
// EXPORTAR
// ========================================

module.exports = {
    cadastrarUsuario,
    login
};