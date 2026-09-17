// ========================================
// LIMPAR
// ========================================
//
// Responsável por:
// - Limpar a matéria atual
// - Restaurar os valores padrão
// - Limpar imagem e categorias
// - Restaurar o botão de envio
// - Esconder o resultado
// ========================================


// ========================================
// ELEMENTOS
// ========================================

const limparButton =
    document.getElementById("limpar");


// ========================================
// LIMPAR MATÉRIA
// ========================================

limparButton.addEventListener(
    "click",
    () => {

        if (
            !confirm(
                "Deseja limpar a matéria atual?"
            )
        ) {

            return;

        }


        // ========================================
        // VERIFICAR SE A APLICAÇÃO ESTÁ CARREGADA
        // ========================================

        if (
            typeof urlInput === "undefined" ||
            typeof tituloInput === "undefined" ||
            typeof descricaoInput === "undefined" ||
            typeof subtituloInput === "undefined" ||
            typeof editor === "undefined"
        ) {

            window.location.reload();

            return;

        }


        // ========================================
        // ELEMENTOS DO SEO
        // ========================================

        const campoFraseChave =
            document.getElementById(
                "frase_chave"
            );

        const campoSlug =
            document.getElementById(
                "slug"
            );


        const campoMetaDescricao =
            document.getElementById(
                "meta_descricao"
            );


        // ========================================
        // LIMPAR CAMPOS
        // ========================================

        urlInput.value = "";

        tituloInput.value = "";

        descricaoInput.value = "";

        subtituloInput.value = "";

        editor.innerHTML = "";


        if (campoFraseChave) {

            campoFraseChave.value = "";

        }


        if (campoSlug) {

            campoSlug.value = "";

        }


        if (campoMetaDescricao) {

            campoMetaDescricao.value = "";

        }


        // ========================================
        // LIMPAR TAGS
        // ========================================

        tagsContainer.innerHTML = "";


        // ========================================
        // RESTAURAR AUTOR
        // ========================================

        autorSelect.value = "58";


        // ========================================
        // RESTAURAR DESTINO
        // ========================================

        destinoSelect.value = "publish";


        // ========================================
        // LIMPAR IMAGEM
        // ========================================

        limparImagem();


        // ========================================
        // LIMPAR CATEGORIAS
        // ========================================

        const checkboxes =
            categoriasContainer.querySelectorAll(
                'input[type="checkbox"]'
            );

        checkboxes.forEach(
            checkbox => {

                checkbox.checked =
                    false;

            }
        );


        // ========================================
        // ATUALIZAR CONTADORES
        // ========================================

        if (
            typeof window.atualizarContadorTitulo ===
            "function"
        ) {

            window.atualizarContadorTitulo();

        }


        if (
            typeof window.atualizarContadorMeta ===
            "function"
        ) {

            window.atualizarContadorMeta();

        }


        // ========================================
        // REMOVER LINK DO WORDPRESS
        // ========================================

        const abrirRascunho =
            document.getElementById(
                "abrirRascunho"
            );

        if (abrirRascunho) {

            abrirRascunho.remove();

        }


        // ========================================
        // RESTAURAR BOTÃO
        // ========================================

        enviarButton.disabled =
            false;

        enviarButton.textContent =
            "Enviar";


        enviarButton.classList.remove(
            "bg-emerald-600",
            "hover:bg-emerald-700"
        );


        enviarButton.classList.add(
            "bg-slate-950",
            "hover:bg-slate-800"
        );


        // ========================================
        // ESCONDER RESULTADO
        // ========================================

        resultado.classList.add(
            "hidden"
        );


        // ========================================
        // VOLTAR AO TOPO
        // ========================================

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }
);

