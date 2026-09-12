const { GoogleGenAI } = require("@google/genai");
const logger = require("../utils/logger");

const {
    criarPromptMateria,
    criarPromptAltText,
    criarPromptNovoTitulo
} = require("../prompts/materiaPrompts");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// ==================================================
// NORMALIZAR TÍTULO
// ==================================================

function normalizarTitulo(texto) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

// ==================================================
// LIMPAR RESPOSTA JSON DO GEMINI
// ==================================================

function limparJson(texto) {
    let resposta = String(texto || "").trim();

    // Remove possíveis blocos Markdown
    resposta = resposta
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    return resposta;
}

// ==================================================
// GERAR ALT TEXT ESPECÍFICO
// ==================================================

async function gerarAltText(titulo, texto) {

    const promptAlt =
        criarPromptAltText(
            titulo,
            texto
        );

    try {

        logger.info(
            "Gerando ALT text específico..."
        );

        const response =
            await chamarGemini(
                promptAlt
            );

        const altText =
            String(response.text || "")
                .trim()
                .replace(/^["']|["']$/g, "");

        if (!altText) {

            logger.warn(
                "Gemini não retornou ALT text."
            );

            return "";

        }

        logger.info(
            `ALT text gerado: ${altText}`
        );

        return altText;

    } catch (error) {

        logger.error(
            "Erro ao gerar ALT text:",
            error.message
        );

        return "";

    }
}

// ==================================================
// FUNÇÃO PARA CHAMAR O GEMINI
// ==================================================

async function chamarGemini(promptAtual) {

    let response;

    const maxTentativas = 3;

    for (
        let tentativa = 1;
        tentativa <= maxTentativas;
        tentativa++
    ) {

        try {

            logger.info(
                `Enviando para o Gemini (tentativa ${tentativa}/${maxTentativas})...`
            );

            response =
                await ai.models.generateContent({
                    model: "gemini-3.6-flash",
                    contents: promptAtual,
                    config: {
                        responseMimeType: "application/json"
                    }
                });

            logger.info(
                "Gemini respondeu com sucesso."
            );

            return response;

        } catch (error) {

            logger.error(
                `Erro na tentativa ${tentativa}:`,
                error.status || error.message
            );

            // ==========================================
            // RETRY PARA ERRO 503
            // ==========================================

            if (
                error.status === 503 &&
                tentativa < maxTentativas
            ) {

                const espera =
                    tentativa * 5000;

                logger.warn(
                    `Gemini indisponível. Nova tentativa em ${espera / 1000} segundos...`
                );

                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            espera
                        )
                );

            } else {

                throw error;

            }
        }
    }
}

// ==================================================
// GERAR MATÉRIA
// ==================================================

async function gerarMateria(titulo, texto) {

    const prompt =
        criarPromptMateria(
            titulo,
            texto
        );

    // ==================================================
    // PRIMEIRA GERAÇÃO
    // ==================================================

    const response =
        await chamarGemini(
            prompt
        );

    const textoResposta =
        limparJson(
            response.text
        );

    let resultado;

    try {

        resultado =
            JSON.parse(
                textoResposta
            );

    } catch (error) {

        logger.error(
            "A IA não retornou um JSON válido.",
            textoResposta
        );

        throw new Error(
            "A IA não retornou um JSON válido."
        );

    }

    // ==================================================
    // GARANTIR E NORMALIZAR CAMPOS
    // ==================================================

    resultado.titulo =
        String(
            resultado.titulo || ""
        ).trim();

    resultado.descricao =
        String(
            resultado.descricao || ""
        ).trim();

    resultado.subtitulo =
        String(
            resultado.subtitulo || ""
        ).trim();

    resultado.frase_chave =
        String(
            resultado.frase_chave || ""
        ).trim();

    resultado.slug =
        String(
            resultado.slug || ""
        ).trim();

    resultado.meta_descricao =
        String(
            resultado.meta_descricao || ""
        ).trim();

    resultado.alt_text =
        String(
            resultado.alt_text || ""
        ).trim();

    if (
        !Array.isArray(
            resultado.tags
        )
    ) {

        resultado.tags = [];

    }

    if (
        !Array.isArray(
            resultado.categorias
        )
    ) {

        resultado.categorias = [];

    }

    // ==================================================
    // VERIFICAR ALT TEXT
    // ==================================================

    logger.info(
        `ALT recebido na primeira geração: ${resultado.alt_text || "Nenhum"}`
    );

    // ==================================================
    // SE A IA NÃO GEROU ALT,
    // FAZER UMA SEGUNDA CHAMADA
    // ==================================================

    if (!resultado.alt_text) {

        logger.warn(
            "ALT text não foi gerado na primeira resposta. Solicitando novamente..."
        );

        resultado.alt_text =
            await gerarAltText(
                resultado.titulo || titulo,
                texto
            );

        logger.info(
            `ALT após segunda tentativa: ${resultado.alt_text || "Nenhum"}`
        );

    }

    // ==================================================
    // ÚLTIMO FALLBACK
    // ==================================================

    if (!resultado.alt_text) {

        logger.warn(
            "Não foi possível gerar ALT text pela IA. Utilizando fallback."
        );

        resultado.alt_text =
            resultado.titulo ||
            titulo ||
            "Imagem relacionada à notícia";

    }

    // ==================================================
    // VERIFICAR TÍTULO
    // ==================================================

    const tituloOriginalNormalizado =
        normalizarTitulo(
            titulo
        );

    const tituloGeradoNormalizado =
        normalizarTitulo(
            resultado.titulo
        );

    // ==================================================
    // SE O TÍTULO FOR IGUAL,
    // PEDIR OUTRO PARA A IA
    // ==================================================

    if (
        tituloOriginalNormalizado ===
        tituloGeradoNormalizado
    ) {

        logger.warn(
            "A IA gerou um título igual ao original. Solicitando um novo título..."
        );

        const promptNovoTitulo =
            criarPromptNovoTitulo(
                titulo,
                resultado.titulo,
                texto
            );

        const responseNovoTitulo =
            await chamarGemini(
                promptNovoTitulo
            );

        const textoNovoTitulo =
            limparJson(
                responseNovoTitulo.text
            );

        let novoTitulo;

        try {

            novoTitulo =
                JSON.parse(
                    textoNovoTitulo
                );

        } catch (error) {

            logger.error(
                "A IA não retornou um novo título válido.",
                textoNovoTitulo
            );

            throw new Error(
                "A IA não retornou um novo título válido."
            );

        }

        const novoTituloNormalizado =
            normalizarTitulo(
                novoTitulo.titulo
            );

        // ==============================================
        // SEGUNDA PROTEÇÃO
        // ==============================================

        if (
            novoTituloNormalizado ===
            tituloOriginalNormalizado
        ) {

            throw new Error(
                "A IA não conseguiu gerar um título diferente do título original."
            );

        }

        resultado.titulo =
            novoTitulo.titulo;

        logger.info(
            `Novo título gerado: ${resultado.titulo}`
        );

    }

    // ==================================================
    // GARANTIR QUE NÃO EXISTE CONTEÚDO GERADO PELA IA
    // ==================================================

    delete resultado.conteudo;

    // ==================================================
    // GARANTIR ALT TEXT NOVAMENTE
    // ==================================================

    if (
        !resultado.alt_text ||
        resultado.alt_text.trim().length === 0
    ) {

        resultado.alt_text =
            resultado.titulo ||
            titulo ||
            "Imagem relacionada à notícia";

    }

    // ==================================================
    // LOG FINAL
    // ==================================================

    logger.info(
        `Matéria processada pela IA: ${resultado.titulo}`
    );

    logger.info(
        `Tags: ${resultado.tags.join(", ")}`
    );

    logger.info(
        `Categorias: ${resultado.categorias.join(", ")}`
    );

    logger.info(
        `Frase-chave: ${resultado.frase_chave}`
    );

    logger.info(
        `Meta descrição: ${resultado.meta_descricao}`
    );

    logger.info(
        `ALT text: ${resultado.alt_text}`
    );

    // ==================================================
    // RETORNAR RESULTADO
    // ==================================================

    return resultado;
}

// ==================================================
// EXPORTAR
// ==================================================

module.exports = {
    gerarMateria
};