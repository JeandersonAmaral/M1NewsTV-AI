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

        urlInput.value = "";

        tituloInput.value = "";

        descricaoInput.value = "";

        subtituloInput.value = "";

        editor.innerHTML = "";

        fraseChaveInput.value = "";

        slugInput.value = "";

        metaDescricaoInput.value = "";

        tagsContainer.innerHTML = "";

        autorSelect.value = "58";

        destinoSelect.value = "draft";

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
        // LIMPAR META
        // ========================================

        atualizarContadorMeta();

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