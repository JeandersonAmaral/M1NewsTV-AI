// ========================================
// TRATAMENTO GLOBAL DE ERROS
// ========================================
//
// Responsável por:
// - Centralizar erros da aplicação
// - Registrar erros no logger
// - Retornar respostas padronizadas
// ========================================

const logger =
    require("../utils/logger");

// ========================================
// ERROR HANDLER
// ========================================

function errorHandler(
    error,
    req,
    res,
    next
) {

    logger.error(
        `Erro na requisição ${req.method} ${req.originalUrl}:`,
        error
    );

    const status =
        error.statusCode ||
        error.status ||
        500;

    return res.status(status).json({

        sucesso: false,

        mensagem:
            error.message ||
            "Erro interno do servidor."

    });

}

module.exports =
    errorHandler;

