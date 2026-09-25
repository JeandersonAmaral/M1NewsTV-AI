// ========================================
// APLICAÇÃO
// ========================================
//
// Responsável por:
// - Inicializar a aplicação
// - Centralizar o carregamento dos módulos
//
// A lógica de cada funcionalidade está
// separada nos módulos correspondentes.
// ========================================

const urlInput =
    document.getElementById("url");

const gerarButton =
    document.getElementById("gerar");

urlInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            event.preventDefault();

            gerarButton.click();

        }

    }
);

const loading =
    document.getElementById("loading");

const resultado =
    document.getElementById("resultado");

const tituloInput =
    document.getElementById("titulo");

const descricaoInput =
    document.getElementById("descricao");

const subtituloInput =
    document.getElementById("subtitulo");

const editor =
    document.getElementById("editor");

const tagsContainer =
    document.getElementById("tags");

const categoriasContainer =
    document.getElementById("categorias");

const enviarButton =
    document.getElementById("enviar");

const destinoSelect =
    document.getElementById("destino");

// ========================================
// CAMPOS DE SEO
// ========================================

const fraseChaveInput =
    document.getElementById("frase_chave");

const slugInput =
    document.getElementById("slug");

const metaDescricaoInput =
    document.getElementById("meta_descricao");

// ========================================
// BOTÕES DE REGENERAÇÃO
// ========================================

const regenerarTituloButton =
    document.getElementById(
        "regenerarTitulo"
    );

const regenerarDescricaoButton =
    document.getElementById(
        "regenerarDescricao"
    );

const regenerarSubtituloButton =
    document.getElementById(
        "regenerarSubtitulo"
    );

const regenerarFraseChaveButton =
    document.getElementById(
        "regenerarFraseChave"
    );

const regenerarSlugButton =
    document.getElementById(
        "regenerarSlug"
    );

const regenerarMetaDescricaoButton =
    document.getElementById(
        "regenerarMetaDescricao"
    );

// ========================================
// DADOS DA MATÉRIA ORIGINAL
// ========================================

let textoMateriaOriginal = "";

// ========================================
// REGENERAR CAMPO
// ========================================

async function regenerarCampo(
    campo,
    botao,
    obterValor
) {

    if (!botao) {

        return;

    }

    botao.disabled = true;

    const textoOriginal =
        botao.textContent;

    botao.textContent =
        "Gerando...";

    try {

        const materia = {

            titulo:
                tituloInput.value.trim(),

            descricao:
                descricaoInput.value.trim(),

            subtitulo:
                subtituloInput.value.trim(),

            frase_chave:
                fraseChaveInput.value.trim(),

            slug:
                slugInput.value.trim(),

            meta_descricao:
                metaDescricaoInput.value.trim(),

            texto:
                textoMateriaOriginal

        };

        const response =
            await fetchAutenticado(
                "/api/materias/regenerar",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        campo,

                        materia

                    })

                }
            );

        if (!response) {

            return;

        }

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.sucesso
        ) {

            throw new Error(
                data.mensagem ||
                "Erro ao regenerar campo."
            );

        }

        const novoValor =
            data.resultado?.[campo];

        if (!novoValor) {

            throw new Error(
                "A IA não retornou um novo valor."
            );

        }

        obterValor(
            novoValor
        );

    } catch (error) {

        console.error(
            `Erro ao regenerar ${campo}:`,
            error
        );

        alert(
            "Erro ao regenerar:\n\n" +
            error.message
        );

    } finally {

        botao.disabled =
            false;

        botao.textContent =
            textoOriginal;

    }

}

// ========================================
// REGENERAR TÍTULO
// ========================================

if (regenerarTituloButton) {

    regenerarTituloButton.addEventListener(
        "click",
        () => {

            regenerarCampo(
                "titulo",
                regenerarTituloButton,
                novoValor => {

                    tituloInput.value =
                        novoValor;

                    atualizarContadorTitulo();

                }
            );

        }
    );

}

// ========================================
// REGENERAR DESCRIÇÃO
// ========================================

if (regenerarDescricaoButton) {

    regenerarDescricaoButton.addEventListener(
        "click",
        () => {

            regenerarCampo(
                "descricao",
                regenerarDescricaoButton,
                novoValor => {

                    descricaoInput.value =
                        novoValor;

                }
            );

        }
    );

}

// ========================================
// REGENERAR SUBTÍTULO
// ========================================

if (regenerarSubtituloButton) {

    regenerarSubtituloButton.addEventListener(
        "click",
        () => {

            regenerarCampo(
                "subtitulo",
                regenerarSubtituloButton,
                novoValor => {

                    subtituloInput.value =
                        novoValor;

                }
            );

        }
    );

}

// ========================================
// REGENERAR FRASE-CHAVE
// ========================================

if (regenerarFraseChaveButton) {

    regenerarFraseChaveButton.addEventListener(
        "click",
        () => {

            regenerarCampo(
                "frase_chave",
                regenerarFraseChaveButton,
                novoValor => {

                    fraseChaveInput.value =
                        novoValor;

                }
            );

        }
    );

}

// ========================================
// REGENERAR SLUG
// ========================================

if (regenerarSlugButton) {

    regenerarSlugButton.addEventListener(
        "click",
        () => {

            regenerarCampo(
                "slug",
                regenerarSlugButton,
                novoValor => {

                    slugInput.value =
                        novoValor;

                }
            );

        }
    );

}

// ========================================
// REGENERAR META DESCRIÇÃO
// ========================================

if (regenerarMetaDescricaoButton) {

    regenerarMetaDescricaoButton.addEventListener(
        "click",
        () => {

            regenerarCampo(
                "meta_descricao",
                regenerarMetaDescricaoButton,
                novoValor => {

                    metaDescricaoInput.value =
                        novoValor;

                    atualizarContadorMeta();

                }
            );

        }
    );

}

// ========================================
// GERAR MATÉRIA
// ========================================

gerarButton.addEventListener(
    "click",
    async () => {

        const url =
            urlInput.value.trim();

        if (!url) {

            alert(
                "Cole a URL de uma matéria."
            );

            urlInput.focus();

            return;

        }

        gerarButton.disabled =
            true;

        loading.classList.remove(
            "hidden"
        );

        loading.classList.add(
            "flex"
        );

        resultado.classList.add(
            "hidden"
        );

        // ========================================
        // LIMPAR DADOS DA MATÉRIA ANTERIOR
        // ========================================

        limparImagem();

        textoMateriaOriginal = "";

        // ========================================
        // LIMPAR PREVIEW
        // ========================================

        enviarButton.disabled =
            false;

        enviarButton.textContent =
            "Enviar";

        try {

            const response =
                await fetchAutenticado(
                    "/api/materias",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            url
                        })

                    }
                );

            if (!response) {

                return;

            }

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.sucesso
            ) {

                throw new Error(
                    data.mensagem ||
                    "Erro ao gerar matéria."
                );

            }

            const materia =
                data.materiaGerada;

            // ========================================
            // TEXTO ORIGINAL
            // ========================================

            textoMateriaOriginal =
                data.materiaOriginal?.texto ||
                "";

            // ========================================
            // IMAGEM ORIGINAL
            // ========================================

            definirImagemMateria(
                data.materiaOriginal?.imagem ||
                null
            );

            // ========================================
            // METADADOS DA IMAGEM
            // ========================================

            const tagsImagem =
                Array.isArray(materia.tags)
                    ? materia.tags.join(", ")
                    : "";

            definirMetadadosImagem(
                tagsImagem,
                materia.alt_text || "",
                tagsImagem,
                tagsImagem
            );

            // ========================================
            // CAMPOS
            // ========================================

            tituloInput.value =
                materia.titulo || "";

            descricaoInput.value =
                materia.descricao || "";

            subtituloInput.value =
                materia.subtitulo || "";

            // ========================================
            // CONTEÚDO
            // ========================================

            editor.innerHTML =
                materia.conteudo || "";

            // ========================================
            // SEO
            // ========================================

            fraseChaveInput.value =
                materia.frase_chave || "";

            slugInput.value =
                materia.slug || "";

            metaDescricaoInput.value =
                materia.meta_descricao || "";

            atualizarContadorTitulo();

            atualizarContadorMeta();

            // ========================================
            // TAGS
            // ========================================

            renderizarTags(
                materia.tags || []
            );

            // ========================================
            // CATEGORIAS
            // ========================================

            marcarCategorias(
                materia.categorias || []
            );

            // ========================================
            // MOSTRAR RESULTADO
            // ========================================

            resultado.classList.remove(
                "hidden"
            );

            resultado.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        } catch (error) {

            console.error(
                "Erro ao gerar matéria:",
                error
            );

            alert(
                "Erro ao gerar matéria:\n\n" +
                error.message
            );

        } finally {

            gerarButton.disabled =
                false;

            loading.classList.add(
                "hidden"
            );

            loading.classList.remove(
                "flex"
            );

        }

    }
);

atualizarContadorTitulo();

atualizarContadorMeta();