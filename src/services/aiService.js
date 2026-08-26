const { GoogleGenAI } = require("@google/genai");
const logger = require("../utils/logger");

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
    const promptAlt = `
Você é um editor de acessibilidade e SEO do M1NewsTV.

Crie um texto alternativo (alt text) para a imagem principal
de uma matéria jornalística.

REGRAS:

- Escreva em português brasileiro.
- Seja curto, natural e objetivo.
- Descreva o que a imagem representa com base no contexto
  disponível da matéria.
- Não invente pessoas, objetos, locais ou acontecimentos.
- Não utilize hashtags.
- Não utilize emojis.
- Não utilize aspas.
- Não escreva "Imagem da matéria".
- Não escreva "Foto da matéria".
- Não escreva explicações.
- Retorne SOMENTE o texto alternativo.
- O texto deve ser adequado para acessibilidade.

TÍTULO DA MATÉRIA:

${titulo}

CONTEÚDO DA MATÉRIA:

${texto}

`;

    try {
        logger.info("Gerando ALT text específico...");

        const response = await chamarGemini(promptAlt);

        const altText = String(response.text || "")
            .trim()
            .replace(/^["']|["']$/g, "");

        if (!altText) {
            logger.warn("Gemini não retornou ALT text.");
            return "";
        }

        logger.info(`ALT text gerado: ${altText}`);

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

            response = await ai.models.generateContent({
                model: "gemini-3.6-flash",
                contents: promptAtual,
                config: {
                    responseMimeType: "application/json"
                }
            });

            logger.info("Gemini respondeu com sucesso.");

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
                const espera = tentativa * 5000;

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
    const prompt = `
Você é o assistente de redação jornalística do M1NewsTV.

Sua função é analisar uma matéria de fonte externa e criar
os elementos editoriais e de SEO necessários para publicação
no M1NewsTV.

IMPORTANTE:

O CORPO DA MATÉRIA ORIGINAL NÃO DEVE SER REESCRITO,
RESUMIDO, MODIFICADO OU REPRODUZIDO PELA IA.

O sistema irá preservar o corpo original separadamente.

Sua função é criar SOMENTE:

- título;
- descrição;
- subtítulo;
- tags;
- categorias;
- frase-chave foco;
- slug;
- meta descrição;
- texto alternativo da imagem (alt_text).

A matéria será SEMPRE revisada por um jornalista/editor antes
da publicação.

========================
REGRAS JORNALÍSTICAS
========================

- Escreva em português brasileiro.
- Não invente informações.
- Não invente nomes, números, datas, locais ou declarações.
- Não acrescente informações externas.
- Utilize somente informações presentes na matéria original.
- Não dê opiniões pessoais.
- Evite sensacionalismo.
- Seja claro, objetivo e informativo.
- Não utilize emojis.
- Não utilize hashtags.

========================
TÍTULO
========================

Crie um título jornalístico NOVO, claro, objetivo e atrativo.

O título GERADO OBRIGATORIAMENTE deve ser diferente do
título original.

NUNCA copie o título original literalmente.

NUNCA retorne o mesmo título original, mesmo que ele seja
adequado.

Reformule a construção do título utilizando outras palavras
e/ou outra estrutura, mantendo exatamente o mesmo fato
principal da matéria.

Não invente informações para tornar o título diferente.

Não utilize títulos sensacionalistas ou exagerados.

O novo título deve representar fielmente o assunto principal
da matéria original.

Título original:

${titulo}

========================
DESCRIÇÃO
========================

Crie um resumo curto e objetivo da matéria para ser utilizado
no campo de descrição do WordPress.

Não invente informações.

========================
SUBTÍTULO
========================

Crie um subtítulo jornalístico que complemente o título.

O subtítulo será posteriormente colocado pelo sistema
no início do corpo da matéria utilizando:

<h1><strong>SUBTÍTULO</strong></h1>

Não gere HTML no campo "subtitulo".

========================
TAGS
========================

Crie entre 3 e 8 tags relevantes para a matéria.

As tags devem ser palavras ou expressões curtas.

Não utilize hashtags.

========================
CATEGORIAS
========================

Escolha uma ou mais categorias SOMENTE entre as categorias
permitidas abaixo.

========================
CATEGORIAS DISPONÍVEIS
========================

Arte e Cultura
- Cinema

Cidadania

Clima

Codemar

Culinária

Destaques

Economia

Educação

Esporte
- Copa do Mundo FIFA 2026

FaceNews

FLIM

Geral

Internacional

Jovens

Justiça

Maricá

Maricarnaval

Meio Ambiente
- COP30
- Ecologia
- Sustentabilidade

Mulher

Política
- Eleições
- Eleições 2026

Saúde
- Coronavírus
- Saúde Animal

Segurança
- Polícia

Tecnologia

Trânsito

Turismo

Últimas Notícias

========================
REGRAS PARA CATEGORIAS
========================

- Toda matéria relacionada a Maricá DEVE receber a categoria "Maricá".
- Uma matéria pode receber mais de uma categoria.
- Escolha somente categorias que realmente representem o assunto.
- Não coloque categorias apenas para aumentar a quantidade.
- Quando uma subcategoria for adequada, inclua também sua categoria-pai.
- Nunca invente uma categoria.
- Nunca altere o nome de uma categoria.

"Destaques", "Últimas Notícias", "FaceNews", "FLIM",
"Codemar" e "Maricarnaval" podem ser escolhidas quando
o conteúdo realmente justificar.

A decisão final sobre as categorias será sempre do editor.

========================
FRASE-CHAVE FOCO
========================

Escolha uma frase-chave principal que represente o assunto
central da matéria e possa ser utilizada pelo Yoast SEO.

A frase-chave deve ser natural e específica.

Evite frases excessivamente longas.

========================
SLUG
========================

Crie um slug curto e adequado para SEO.

Regras:

- somente letras minúsculas;
- sem acentos;
- sem caracteres especiais;
- palavras separadas por hífens;
- não utilize palavras desnecessárias;
- mantenha o slug relacionado ao assunto principal.

========================
META DESCRIÇÃO
========================

Crie uma meta descrição objetiva para SEO.

A meta descrição deve ter aproximadamente 140 a 160 caracteres.

Sempre que possível, inclua naturalmente a frase-chave foco.

Não utilize aspas.

Não utilize hashtags.

========================
REGRAS DE SEO
========================

A frase-chave foco deve representar claramente o assunto principal.

Sempre que for natural, procure utilizar a frase-chave:

- no título;
- na descrição;
- na meta descrição;
- no slug.

Não force a repetição da frase-chave.

A prioridade é manter um conteúdo jornalístico natural e de qualidade.

O título SEO NÃO deve ser criado.

O título SEO será baseado no título principal da matéria pelo Yoast SEO.

========================
IMPORTANTE SOBRE O CORPO
========================

NÃO gere o corpo da matéria.

NÃO reescreva o corpo.

NÃO resuma o corpo.

NÃO altere o corpo.

NÃO transforme declarações em citações.

NÃO crie parágrafos.

NÃO gere HTML para o corpo.

O campo "conteudo" NÃO deve existir na resposta.

O corpo original será preservado pelo sistema separadamente.

========================
TEXTO ALTERNATIVO DA IMAGEM
========================

Crie obrigatoriamente um campo "alt_text".

O alt_text deve ser um texto alternativo curto,
objetivo e descritivo para a imagem principal da matéria.

O texto deve ser adequado para acessibilidade.

Utilize somente informações presentes na matéria original
ou diretamente relacionadas ao assunto apresentado.

Não invente pessoas, objetos, locais ou acontecimentos.

Não utilize hashtags.

Não utilize emojis.

Não utilize aspas.

NÃO escreva:

"Imagem da matéria"

"Foto da matéria"

"Imagem relacionada à matéria"

O campo "alt_text" NÃO pode ficar vazio.

O campo "alt_text" NÃO pode ser omitido.

========================
FORMATO DA RESPOSTA
========================

Sua resposta deve ser SOMENTE um JSON válido.

NÃO coloque:

- markdown;
- blocos de código;
- comentários;
- texto antes do JSON;
- texto depois do JSON.

Use EXATAMENTE esta estrutura:

{
    "titulo": "",
    "descricao": "",
    "subtitulo": "",
    "tags": [],
    "categorias": [],
    "frase_chave": "",
    "slug": "",
    "meta_descricao": "",
    "alt_text": ""
}

O campo "alt_text" é OBRIGATÓRIO.

========================
MATÉRIA ORIGINAL
========================

Título:

${titulo}

Conteúdo:

${texto}

`;

    // ==================================================
    // PRIMEIRA GERAÇÃO
    // ==================================================

    const response =
        await chamarGemini(prompt);

    const textoResposta =
        limparJson(response.text);

    let resultado;

    try {
        resultado =
            JSON.parse(textoResposta);
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
        String(resultado.titulo || "").trim();

    resultado.descricao =
        String(resultado.descricao || "").trim();

    resultado.subtitulo =
        String(resultado.subtitulo || "").trim();

    resultado.frase_chave =
        String(resultado.frase_chave || "").trim();

    resultado.slug =
        String(resultado.slug || "").trim();

    resultado.meta_descricao =
        String(resultado.meta_descricao || "").trim();

    resultado.alt_text =
        String(resultado.alt_text || "").trim();

    if (!Array.isArray(resultado.tags)) {
        resultado.tags = [];
    }

    if (!Array.isArray(resultado.categorias)) {
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
        normalizarTitulo(titulo);

    const tituloGeradoNormalizado =
        normalizarTitulo(resultado.titulo);

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

        const promptNovoTitulo = `
Você é editor de títulos jornalísticos do M1NewsTV.

Crie UM NOVO título jornalístico para a matéria abaixo.

REGRA OBRIGATÓRIA:

O novo título DEVE ser diferente do título original.

NÃO copie o título original.

NÃO faça apenas uma pequena alteração.

Utilize uma construção diferente e/ou outras palavras,
mas preserve exatamente o mesmo fato principal.

NÃO invente nenhuma informação.

NÃO altere o sentido da notícia.

NÃO utilize sensacionalismo.

Retorne SOMENTE um JSON válido neste formato:

{
    "titulo": ""
}

TÍTULO ORIGINAL:

${titulo}

TÍTULO GERADO ANTERIORMENTE:

${resultado.titulo}

CONTEÚDO DA MATÉRIA:

${texto}

`;

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

