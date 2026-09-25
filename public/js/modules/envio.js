// ========================================
// ENVIO PARA O WORDPRESS
// ========================================
//
// Responsável por:
// - Coletar os dados atuais da matéria
// - Coletar tags e categorias
// - Validar os dados
// - Confirmar rascunho ou publicação
// - Enviar a matéria para o WordPress
// - Exibir o resultado do envio
// ========================================

// ========================================
// ELEMENTO
// ========================================

const botaoEnvio =
    document.getElementById("enviar");

// ========================================
// ENVIAR PARA O WORDPRESS
// ========================================

botaoEnvio.addEventListener(
    "click",
    async () => {

        // ========================================
        // PEGAR DADOS ATUAIS
        // ========================================

        const titulo =
            tituloInput.value.trim();

        const descricao =
            descricaoInput.value.trim();

        const subtitulo =
            subtituloInput.value.trim();

        const conteudo =
            editor.innerHTML.trim();

        const slug =
            document.getElementById("slug").value.trim();

        const frase_chave =
            document.getElementById("frase_chave").value.trim();

        const meta_descricao =
            document
                .getElementById("meta_descricao")
                .value
                .trim();

        const autorId =
            Number(autorSelect.value);

        const destino =
            destinoSelect.value;

        // ========================================
        // METADADOS DA IMAGEM
        // ========================================

        const metadadosImagem =
            obterMetadadosImagem();

        // ========================================
        // PEGAR TAGS
        // ========================================

        const tags =
            Array.from(
                tagsContainer.querySelectorAll(
                    "span"
                )
            )
                .map(
                    elemento =>
                        elemento.textContent.trim()
                )
                .filter(
                    tag =>
                        tag.length > 0
                );

        // ========================================
        // PEGAR CATEGORIAS
        // ========================================

        const categoriasSelecionadas =
            Array.from(
                categoriasContainer.querySelectorAll(
                    'input[type="checkbox"]:checked'
                )
            )
                .map(
                    checkbox =>
                        checkbox.value
                );

        // ========================================
        // VALIDAÇÃO
        // ========================================

        if (!titulo) {

            alert(
                "O título da matéria é obrigatório."
            );

            tituloInput.focus();

            return;

        }

        if (!conteudo) {

            alert(
                "O conteúdo da matéria está vazio."
            );

            editor.focus();

            return;

        }

        // ========================================
        // CONFIRMAÇÃO
        // ========================================

        const confirmar = confirm(
            destino === "publish"
                ? "Deseja publicar esta matéria no WordPress?"
                : "Deseja enviar esta matéria para o WordPress como rascunho?"
        );

        if (!confirmar) {
            return;
        }

        // ========================================
        // ESTADO DO BOTÃO
        // ========================================

        botaoEnvio.disabled =
            true;

        const textoOriginal =
            botaoEnvio.textContent;

        botaoEnvio.textContent =
            "Enviando...";

        try {

            const response =
                await fetchAutenticado(
                    "/api/materias/rascunho",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            titulo,

                            descricao,

                            subtitulo,

                            conteudo,

                            slug,

                            frase_chave,

                            meta_descricao,

                            autorId,

                            destino,

                            tags,

                            categorias:
                                categoriasSelecionadas,

                            imagem:
                                obterImagemMateria() ||
                                null,

                            imagem_titulo:
                                metadadosImagem.titulo,

                            alt_text:
                                metadadosImagem.alt_text,

                            imagem_legenda:
                                metadadosImagem.legenda,

                            imagem_descricao:
                                metadadosImagem.descricao

                        })

                    }
                );

            if (!response) {

                return;

            }

            const data =
                await response.json();

            // ========================================
            // VERIFICAR RESPOSTA
            // ========================================

            if (
                !response.ok ||
                !data.sucesso
            ) {

                throw new Error(
                    data.mensagem ||
                    "Erro ao enviar a matéria."
                );

            }

            // ========================================
            // SUCESSO
            // ========================================

            const foiPublicado =
                destino === "publish";

            botaoEnvio.textContent =
                foiPublicado
                    ? "Post publicado ✓"
                    : "Rascunho criado ✓";

            botaoEnvio.classList.remove(
                "bg-slate-950",
                "hover:bg-slate-800",
                "dark:bg-white",
                "dark:hover:bg-gray-200"
            );

            botaoEnvio.classList.add(
                "bg-emerald-600",
                "hover:bg-emerald-700"
            );

            // ========================================
            // LINK PARA O WORDPRESS
            // ========================================

            const linkExistente =
                document.getElementById(
                    "abrirRascunho"
                );

            if (linkExistente) {

                linkExistente.remove();

            }

            const abrirRascunho =
                document.createElement(
                    "a"
                );

            abrirRascunho.id =
                "abrirRascunho";

            abrirRascunho.href =
                data.link;

            abrirRascunho.target =
                "_blank";

            abrirRascunho.rel =
                "noopener noreferrer";

            abrirRascunho.textContent =
                foiPublicado
                    ? "Abrir post no WordPress →"
                    : "Abrir rascunho no WordPress →";

            abrirRascunho.className =
                "inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50";

            botaoEnvio.parentElement.appendChild(
                abrirRascunho
            );

            // ========================================
            // MENSAGEM
            // ========================================

            alert(
                foiPublicado
                    ? `Post publicado com sucesso!\n\nID: ${data.id}`
                    : `Rascunho criado com sucesso!\n\nID: ${data.id}`
            );

        } catch (error) {

            console.error(
                "Erro ao enviar matéria:",
                error
            );

            alert(
                "Não foi possível enviar a matéria para o WordPress.\n\n" +
                error.message
            );

            botaoEnvio.disabled =
                false;

            botaoEnvio.textContent =
                textoOriginal;

        }

    }
);

