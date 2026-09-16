// ========================================
// SEO
// ========================================
//
// Responsável por:
// - Atualizar o contador do título
// - Atualizar o contador da meta descrição
// - Controlar os campos de SEO
// ========================================


(() => {

    // ========================================
    // ELEMENTOS
    // ========================================

    const seoTituloInput =
        document.getElementById("titulo");

    const seoContadorTitulo =
        document.getElementById("contadorTitulo");

    const seoFraseChaveInput =
        document.getElementById("frase_chave");

    const seoSlugInput =
        document.getElementById("slug");

    const seoMetaDescricaoInput =
        document.getElementById("meta_descricao");

    const seoContadorMeta =
        document.getElementById("contadorMeta");


    // ========================================
    // LIMITES
    // ========================================

    const SEO_LIMITE_TITULO = 60;

    const SEO_LIMITE_META_MINIMO = 140;

    const SEO_LIMITE_META_MAXIMO = 160;


    // ========================================
    // CONTADOR DO TÍTULO
    // ========================================

    function atualizarContadorTitulo() {

        if (
            !seoTituloInput ||
            !seoContadorTitulo
        ) {

            return;

        }

        const quantidade =
            seoTituloInput.value.length;

        seoContadorTitulo.textContent =
            `${quantidade} / ${SEO_LIMITE_TITULO} caracteres`;

        if (
            quantidade === 0 ||
            quantidade > SEO_LIMITE_TITULO
        ) {

            seoContadorTitulo.className =
                "text-xs font-semibold text-red-600";

        } else {

            seoContadorTitulo.className =
                "text-xs font-semibold text-emerald-600";

        }

    }


    // ========================================
    // CONTADOR DA META DESCRIÇÃO
    // ========================================

    function atualizarContadorMeta() {

        if (
            !seoMetaDescricaoInput ||
            !seoContadorMeta
        ) {

            return;

        }

        const quantidade =
            seoMetaDescricaoInput.value.length;

        seoContadorMeta.textContent =
            `${quantidade} / ${SEO_LIMITE_META_MAXIMO} caracteres`;

        if (
            quantidade >= SEO_LIMITE_META_MINIMO &&
            quantidade <= SEO_LIMITE_META_MAXIMO
        ) {

            seoContadorMeta.className =
                "text-xs font-semibold text-emerald-600";

        } else {

            seoContadorMeta.className =
                "text-xs font-semibold text-red-600";

        }

    }


    // ========================================
    // EVENTOS
    // ========================================

    if (seoTituloInput) {

        seoTituloInput.addEventListener(
            "input",
            atualizarContadorTitulo
        );

    }

    if (seoMetaDescricaoInput) {

        seoMetaDescricaoInput.addEventListener(
            "input",
            atualizarContadorMeta
        );

    }


    // ========================================
    // DISPONIBILIZAR PARA OUTROS MÓDULOS
    // ========================================

    window.atualizarContadorTitulo =
        atualizarContadorTitulo;

    window.atualizarContadorMeta =
        atualizarContadorMeta;


    // ========================================
    // ATUALIZAÇÃO INICIAL
    // ========================================

    atualizarContadorTitulo();

    atualizarContadorMeta();

})();
