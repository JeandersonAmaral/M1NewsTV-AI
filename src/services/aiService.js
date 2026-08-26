const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


/*
==================================================
NORMALIZAR TÍTULO
==================================================
*/

function normalizarTitulo(texto) {

    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();

}


/*
==================================================
GERAR MATÉRIA
==================================================
*/

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
- meta descrição.

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

Exemplo:

Uma matéria sobre política em Maricá:

[
    "Maricá",
    "Política"
]

Uma matéria sobre eleições em Maricá:

[
    "Maricá",
    "Política",
    "Eleições"
]

Uma matéria sobre Copa do Mundo:

[
    "Esporte",
    "Copa do Mundo FIFA 2026"
]

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
    "meta_descricao": ""
}

========================
MATÉRIA ORIGINAL
========================

Título:

${titulo}

Conteúdo:

${texto}

`;


    /*
    ==================================================
    FUNÇÃO PARA CHAMAR O GEMINI
    ==================================================
    */

    async function chamarGemini(promptAtual) {

        let response;

        const maxTentativas = 3;

        for (
            let tentativa = 1;
            tentativa <= maxTentativas;
            tentativa++
        ) {

            try {

                console.log(
                    `Tentativa ${tentativa}/${maxTentativas} enviando para o Gemini...`
                );

                response = await ai.models.generateContent({

                    model: "gemini-3.6-flash",

                    contents: promptAtual

                });

                console.log(
                    "Gemini respondeu com sucesso."
                );

                return response;

            } catch (error) {

                console.error(
                    `Erro na tentativa ${tentativa}:`,
                    error.status || error.message
                );


                /*
                ==========================================
                RETRY PARA ERRO 503
                ==========================================
                */

                if (
                    error.status === 503 &&
                    tentativa < maxTentativas
                ) {

                    const espera =
                        tentativa * 5000;

                    console.log(
                        `Gemini indisponível. Tentando novamente em ${espera / 1000} segundos...`
                    );

                    await new Promise(
                        resolve =>
                            setTimeout(resolve, espera)
                    );

                } else {

                    throw error;

                }

            }

        }

    }


    /*
    ==================================================
    PRIMEIRA GERAÇÃO
    ==================================================
    */

    const response =
        await chamarGemini(prompt);


    const textoResposta =
        response.text.trim();


    let resultado;


    try {

        resultado =
            JSON.parse(textoResposta);

    } catch (error) {

        console.error(
            "Resposta recebida da IA:"
        );

        console.error(
            textoResposta
        );

        throw new Error(
            "A IA não retornou um JSON válido."
        );

    }


    /*
    ==================================================
    VERIFICAR TÍTULO
    ==================================================
    */

    const tituloOriginalNormalizado =
        normalizarTitulo(titulo);

    const tituloGeradoNormalizado =
        normalizarTitulo(resultado.titulo);


    /*
    ==================================================
    SE O TÍTULO FOR IGUAL,
    PEDIR OUTRO PARA A IA
    ==================================================
    */

    if (
        tituloOriginalNormalizado ===
        tituloGeradoNormalizado
    ) {

        console.log(
            "A IA gerou um título igual ao original."
        );

        console.log(
            "Solicitando um novo título..."
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
            responseNovoTitulo.text.trim();


        let novoTitulo;


        try {

            novoTitulo =
                JSON.parse(
                    textoNovoTitulo
                );

        } catch (error) {

            console.error(
                "Resposta recebida ao solicitar novo título:"
            );

            console.error(
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


        /*
        ==============================================
        SEGUNDA PROTEÇÃO
        ==============================================
        */

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


        console.log(
            "Novo título gerado com sucesso."
        );

    }


    /*
    ==================================================
    GARANTIR QUE NÃO EXISTE CONTEÚDO GERADO PELA IA
    ==================================================
    */

    delete resultado.conteudo;


    /*
    ==================================================
    RETORNAR RESULTADO
    ==================================================
    */

    return resultado;

}


module.exports = {

    gerarMateria

};