// ========================================
// TEMA
// ========================================
//
// Responsável por:
//
// - Alternar entre modo claro e escuro
// - Salvar a preferência do usuário
// - Restaurar o tema ao carregar a página
//
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // ELEMENTOS
    // ========================================

    const botaoTema =
        document.getElementById("alternarTema");

    const iconeTema =
        document.getElementById("iconeTema");

    if (!botaoTema || !iconeTema) {
        return;
    }

    // ========================================
    // CONFIGURAÇÕES
    // ========================================

    const CHAVE_TEMA =
        "m1news-tema";

    // ========================================
    // APLICAR TEMA
    // ========================================

    function aplicarTema(tema) {

        const modoEscuro =
            tema === "dark";

        document.documentElement.classList.toggle(
            "dark",
            modoEscuro
        );

        botaoTema.setAttribute(
            "aria-label",
            modoEscuro
                ? "Ativar modo claro"
                : "Ativar modo escuro"
        );

        botaoTema.setAttribute(
            "title",
            modoEscuro
                ? "Ativar modo claro"
                : "Ativar modo escuro"
        );

    }

    // ========================================
    // OBTER TEMA INICIAL
    // ========================================

    function obterTemaInicial() {

        const temaSalvo =
            localStorage.getItem(
                CHAVE_TEMA
            );

        if (
            temaSalvo === "dark" ||
            temaSalvo === "light"
        ) {
            return temaSalvo;
        }

        return "light";

    }

    // ========================================
    // ALTERNAR TEMA
    // ========================================

    botaoTema.addEventListener(
        "click",
        () => {

            const temaAtual =
                document.documentElement.classList.contains("dark")
                    ? "dark"
                    : "light";

            const novoTema =
                temaAtual === "dark"
                    ? "light"
                    : "dark";

            localStorage.setItem(
                CHAVE_TEMA,
                novoTema
            );

            aplicarTema(
                novoTema
            );

        }
    );

    // ========================================
    // INICIALIZAR
    // ========================================

    aplicarTema(
        obterTemaInicial()
    );

});