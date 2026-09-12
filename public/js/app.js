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
            // IMAGEM ORIGINAL
            // ========================================

            definirImagemMateria(
                data.materiaOriginal?.imagem ||
                null
            );

            // ========================================
            // ALT TEXT
            // ========================================

            definirMateriaAltText(
                materia.alt_text || ""
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

atualizarContadorMeta();