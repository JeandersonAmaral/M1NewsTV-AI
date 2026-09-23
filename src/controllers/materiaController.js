const {
    gerarMateria: gerarMateriaIA,
    regenerarCampo: regenerarCampoIA
} = require("../services/aiService");

const { extrairMateria } =
    require("../services/articleExtractor");

const {
    enviarMateriaParaWordPress,
    obterAutoresPermitidos
} = require("../services/wordpressService");

const { validarUrl } =
    require("../utils/urlValidator");

const logger =
    require("../utils/logger");

// ========================================
// IDENTIFICAR FONTE
// ========================================

function identificarFonte(url) {

    try {

        const dominio =
            new URL(url)
                .hostname
                .replace("www.", "")
                .toLowerCase();

        const fontes = {

            "agenciabrasil.ebc.com.br":
                "Agência Brasil",

            "brasildefato.com.br":
                "Brasil de Fato"

        };

        if (fontes[dominio]) {

            return fontes[dominio];

        }

        return dominio;

    } catch (error) {

        return "Fonte não identificada";

    }

}

// ========================================
// MONTAR CONTEÚDO FINAL
// ========================================

function montarConteudoFinal(
    subtitulo,
    corpoOriginal,
    fonte
) {

    const subtituloHTML =
        `<h1 style="text-align: center;"><strong>${subtitulo}</strong></h1>`;

    const fonteHTML =
        `<p><strong>Fonte: ${fonte}</strong></p>`;

    return [
        subtituloHTML,
        corpoOriginal,
        fonteHTML
    ].join("\n\n");

}

// ========================================
// LISTAR AUTORES
// ========================================

async function listarAutores(req, res) {

    try {

        const autores =
            await obterAutoresPermitidos();

        return res.json({
            sucesso: true,
            autores
        });

    } catch (error) {

        logger.error(
            "Erro ao buscar autores:",
            error
        );

        return res.status(500).json({
            sucesso: false,
            mensagem:
                error.message ||
                "Não foi possível buscar os autores."
        });

    }

}

// ========================================
// GERAR MATÉRIA
// ========================================

async function gerarMateria(req, res) {

    const { url } =
        req.body;

    // ========================================
    // VALIDAR URL
    // ========================================

    if (!url) {

        return res.status(400).json({
            sucesso: false,
            mensagem:
                "A URL da matéria é obrigatória."
        });

    }

    try {

        // ========================================
        // VALIDAR URL CONTRA SSRF
        // ========================================

        validarUrl(url);

        // ========================================
        // 1. EXTRAIR MATÉRIA ORIGINAL
        // ========================================

        logger.info(
            "Extraindo matéria da fonte..."
        );

        const materiaOriginal =
            await extrairMateria(url);

        // ========================================
        // 2. IDENTIFICAR FONTE
        // ========================================

        const fonte =
            identificarFonte(url);

        // ========================================
        // 3. ENVIAR INFORMAÇÕES PARA A IA
        // ========================================

        logger.info(
            "Gerando informações editoriais com IA..."
        );

        const materiaGerada =
            await gerarMateriaIA(
                materiaOriginal.titulo,
                materiaOriginal.texto
            );

        // ========================================
        // 4. MONTAR CORPO FINAL
        // ========================================

        const conteudoFinal =
            montarConteudoFinal(
                materiaGerada.subtitulo,
                materiaOriginal.html,
                fonte
            );

        // ========================================
        // 5. ADICIONAR CONTEÚDO AO RESULTADO
        // ========================================

        materiaGerada.conteudo =
            conteudoFinal;

        // ========================================
        // 5.1 MANTER IMAGEM ORIGINAL
        // ========================================

        materiaGerada.imagem =
            materiaOriginal.imagem || null;

        // ========================================
        // 6. RETORNAR PARA A INTERFACE
        // ========================================

        logger.info(
            `Matéria processada: ${materiaGerada.titulo}`
        );

        return res.json({
            sucesso: true,
            materiaOriginal,
            materiaGerada
        });

    } catch (error) {

        logger.error(
            "Erro ao processar matéria:",
            error
        );

        return res.status(500).json({
            sucesso: false,
            mensagem:
                error.message ||
                "Erro ao processar a matéria."
        });

    }

}

// ========================================
// REGENERAR CAMPO INDIVIDUAL
// ========================================

async function regenerarCampo(req, res) {

    const {
        campo,
        materia
    } = req.body;

    // ========================================
    // VALIDAR CAMPO
    // ========================================

    if (!campo) {

        return res.status(400).json({

            sucesso: false,

            mensagem:
                "O campo para regeneração é obrigatório."

        });

    }

    // ========================================
    // VALIDAR MATÉRIA
    // ========================================

    if (
        !materia ||
        typeof materia !== "object"
    ) {

        return res.status(400).json({

            sucesso: false,

            mensagem:
                "Os dados da matéria são obrigatórios."

        });

    }

    try {

        logger.info(
            `Solicitada regeneração do campo: ${campo}`
        );

        // ========================================
        // REGENERAR CAMPO
        // ========================================

        const resultado =
            await regenerarCampoIA(
                campo,
                materia
            );

        // ========================================
        // RETORNAR RESULTADO
        // ========================================

        return res.json({

            sucesso: true,

            campo,

            resultado

        });

    } catch (error) {

        logger.error(
            `Erro ao regenerar campo ${campo}:`,
            error
        );

        return res.status(500).json({

            sucesso: false,

            mensagem:
                error.message ||
                "Não foi possível regenerar o campo."

        });

    }

}

// ========================================
// ENVIAR MATÉRIA PARA WORDPRESS
// ========================================

async function enviarMateria(req, res) {

    const {
        titulo,
        conteudo,
        descricao,
        slug,
        tags,
        categorias,
        frase_chave,
        meta_descricao,
        imagem,
        alt_text,
        autorId,
        destino
    } = req.body;

    // ========================================
    // VALIDAR CAMPOS
    // ========================================

    if (!titulo) {

        return res.status(400).json({
            sucesso: false,
            mensagem:
                "O título da matéria é obrigatório."
        });

    }

    if (!conteudo) {

        return res.status(400).json({
            sucesso: false,
            mensagem:
                "O conteúdo da matéria está vazio."
        });

    }

    // ========================================
    // ENVIAR MATÉRIA
    // ========================================

    try {

        logger.info(
            `Enviando matéria para o WordPress: ${titulo}`
        );

        const resultado =
            await enviarMateriaParaWordPress({

                titulo,
                conteudo,
                descricao,
                slug,
                tags,
                categorias,
                frase_chave,
                meta_descricao,
                imagem,
                alt_text,
                autorId,
                destino

            });

        // ========================================
        // RETORNAR PARA O FRONTEND
        // ========================================

        return res.json({

            sucesso: true,

            id:
                resultado.id,

            link:
                resultado.link,

            status:
                resultado.status

        });

    } catch (error) {

        logger.error(
            "Erro ao enviar matéria:",
            error
        );

        return res.status(500).json({

            sucesso: false,

            mensagem:
                error.message ||
                "Não foi possível enviar a matéria para o WordPress."

        });

    }

}

// ========================================
// TESTE WORDPRESS
// ========================================

async function testarWordPress(req, res) {

    try {

        logger.info(
            "Executando teste de integração com WordPress..."
        );

        const resultado =
            await enviarMateriaParaWordPress({

                titulo:
                    "Teste M1NewsTV AI",

                conteudo:
                    "<p>Este é um rascunho de teste criado pelo M1NewsTV AI.</p>",

                descricao:
                    "Rascunho de teste da integração com o WordPress.",

                slug:
                    "teste-m1newstv-ai"

            });

        logger.info(
            `Teste do WordPress concluído: ID ${resultado.id}`
        );

        return res.json({

            sucesso: true,

            id:
                resultado.id,

            link:
                resultado.link,

            status:
                resultado.status

        });

    } catch (error) {

        logger.error(
            "Erro no teste do WordPress:",
            error
        );

        return res.status(500).json({

            sucesso: false,

            mensagem:
                error.message

        });

    }

}

// ========================================
// EXPORTAR
// ========================================

module.exports = {

    gerarMateria,

    regenerarCampo,

    enviarMateria,

    testarWordPress,

    listarAutores

};