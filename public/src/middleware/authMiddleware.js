const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

// ========================================
// VERIFICAR AUTENTICAÇÃO
// ========================================

function autenticar(req, res, next) {

    try {

        // ========================================
        // PEGAR TOKEN DO HEADER
        // ========================================

        const authorization =
            req.headers.authorization;

        if (!authorization) {

            return res.status(401).json({
                erro: "Token de autenticação não informado."
            });

        }

        // ========================================
        // VERIFICAR FORMATO
        // ========================================

        const partes =
            authorization.split(" ");

        if (
            partes.length !== 2 ||
            partes[0] !== "Bearer"
        ) {

            return res.status(401).json({
                erro: "Formato do token inválido."
            });

        }

        const token = partes[1];

        // ========================================
        // VALIDAR TOKEN
        // ========================================

        const usuario =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        // ========================================
        // DISPONIBILIZAR USUÁRIO NA REQUISIÇÃO
        // ========================================

        req.usuario = usuario;

        // ========================================
        // CONTINUAR
        // ========================================

        next();

    } catch (error) {

        logger.error(
            "Erro na autenticação:",
            error.message
        );

        return res.status(401).json({
            erro: "Token inválido ou expirado."
        });

    }

}

module.exports = autenticar;