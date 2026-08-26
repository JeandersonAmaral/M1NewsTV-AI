const { gerarMateria: gerarMateriaIA } = require("../services/aiService");
const { extrairMateria } = require("../services/articleExtractor");
const { criarRascunho: criarRascunhoWordPress } = require("../services/wordpressService");
const { validarUrl } = require("../utils/urlValidator");
const logger = require("../utils/logger");
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
// GERAR MATÉRIA
// ========================================
async function gerarMateria(req, res) {
    const { url } = req.body;

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
// ENVIAR MATÉRIA PARA RASCUNHO
// ========================================
async function criarRascunho(req, res) {
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
        alt_text
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
    // CRIAR RASCUNHO
    // ========================================
    try {

        logger.info(
            `Enviando matéria para o WordPress: ${titulo}`
        );

        const resultado =
            await criarRascunhoWordPress({
                titulo,
                conteudo,
                descricao,
                slug,
                tags,
                categorias,
                frase_chave,
                meta_descricao,
                imagem,
                alt_text
            });
        // ========================================
        // RETORNAR PARA O FRONTEND
        // ========================================
        logger.info(
            `Rascunho criado no WordPress: ID ${resultado.id}`
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
            "Erro ao criar rascunho:",
            error
        );

        return res.status(500).json({
            sucesso: false,
            mensagem:
                error.message ||
                "Não foi possível criar o rascunho no WordPress."
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
            await criarRascunhoWordPress({
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
    criarRascunho,
    testarWordPress
};

