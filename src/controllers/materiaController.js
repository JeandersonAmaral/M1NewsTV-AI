const { gerarMateria: gerarMateriaIA } =
    require("../services/aiService");

const { extrairMateria } =
    require("../services/articleExtractor");

const { criarRascunho: criarRascunhoWordPress } =
    require("../services/wordpressService");

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

    console.log(
        "URL recebida:",
        url
    );

    try {

        // ========================================
        // 1. EXTRAIR MATÉRIA ORIGINAL
        // ========================================

        const materiaOriginal =
            await extrairMateria(url);

        console.log(
            "Título encontrado:",
            materiaOriginal.titulo
        );

        console.log(
            "Imagem encontrada:",
            materiaOriginal.imagem || "Nenhuma"
        );

        // ========================================
        // 2. IDENTIFICAR FONTE
        // ========================================

        const fonte =
            identificarFonte(url);

        console.log(
            "Fonte identificada:",
            fonte
        );

        // ========================================
        // 3. ENVIAR INFORMAÇÕES PARA A IA
        // ========================================

        console.log(
            "Enviando informações para a IA..."
        );

        const materiaGerada =
            await gerarMateriaIA(
                materiaOriginal.titulo,
                materiaOriginal.texto
            );

        console.log(
            "Informações geradas pela IA."
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

        console.log(
            "Imagem mantida para o frontend:",
            materiaGerada.imagem || "Nenhuma"
        );

        // ========================================
        // 6. RETORNAR PARA A INTERFACE
        // ========================================

        return res.json({

            sucesso: true,

            materiaOriginal,

            materiaGerada

        });

    } catch (error) {

        console.error(
            "Erro:",
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

        imagem

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

    console.log(
        "========================================"
    );

    console.log(
        "Enviando matéria para o WordPress..."
    );

    console.log(
        "Título:",
        titulo
    );

    console.log(
        "Slug:",
        slug
    );

    console.log(
        "Tags:",
        tags
    );

    console.log(
        "Categorias:",
        categorias
    );

    console.log(
        "Imagem recebida:",
        imagem || "Nenhuma"
    );

    // ========================================
    // CRIAR RASCUNHO
    // ========================================

    try {

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

                imagem

            });

        // ========================================
        // RESULTADO
        // ========================================

        console.log(
            "Rascunho criado com sucesso!"
        );

        console.log(
            "ID:",
            resultado.id
        );

        console.log(
            "Link:",
            resultado.link
        );

        console.log(
            "Status:",
            resultado.status
        );

        console.log(
            "========================================"
        );

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

        console.error(
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

        console.error(error);

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

