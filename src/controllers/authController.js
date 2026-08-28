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
        // DADOS DO USUÁRIO
        // ========================================

        const payload = {
            id: usuario._id,
            username: usuario.username,
            role: usuario.role
        };

        // ========================================
        // GERAR ACCESS TOKEN
        // ========================================

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {
                expiresIn: "15m"
            }
        );

        // ========================================
        // GERAR REFRESH TOKEN
        // ========================================

        const refreshToken = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {
                expiresIn: "3h"
            }
        );

        // ========================================
        // RESPOSTA
        // ========================================

        return res.json({
            sucesso: true,
            mensagem: "Login realizado com sucesso.",
            token,
            refreshToken,
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
// RENOVAR ACCESS TOKEN
// ========================================

async function refresh(req, res) {
    try {
        const { refreshToken } = req.body;

        // ========================================
        // VERIFICAR SE REFRESH TOKEN EXISTE
        // ========================================

        if (!refreshToken) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "Refresh token não informado."
            });
        }

        // ========================================
        // VALIDAR REFRESH TOKEN
        // ========================================

        const usuario = jwt.verify(
            refreshToken,
            process.env.JWT_SECRET
        );

        // ========================================
        // GERAR NOVO ACCESS TOKEN
        // ========================================

        const token = jwt.sign(
            {
                id: usuario.id,
                username: usuario.username,
                role: usuario.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "15m"
            }
        );

        // ========================================
        // RESPONDER
        // ========================================

        return res.json({
            sucesso: true,
            token
        });
    } catch (error) {
        console.error(
            "Erro ao renovar token:",
            error.message
        );

        return res.status(401).json({
            sucesso: false,
            mensagem: "Refresh token inválido ou expirado."
        });
    }
}

// ========================================
// LOGOUT
// ========================================

async function logout(req, res) {
    try {
        return res.json({
            sucesso: true,
            mensagem: "Logout realizado com sucesso."
        });
    } catch (error) {
        console.error(
            "Erro ao realizar logout:",
            error
        );

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro interno ao realizar logout."
        });
    }
}

// ========================================
// EXPORTAR
// ========================================

module.exports = {
    cadastrarUsuario,
    login,
    refresh,
    logout
};