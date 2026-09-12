// ========================================
// IDENTIFICADOR DE LINKS
// ========================================
//
// Responsável por:
// - Identificar links dentro do editor
// - Exibir o endereço do link
// - Permitir a remoção do link
// - Controlar o identificador visual
// ========================================

function inicializarIdentificadorDeLinks() {

    const editor =
        document.getElementById("editor");

    if (!editor) {
        return;
    }

    // ========================================
    // ESTILO VISUAL DOS LINKS
    // ========================================

    const estilo =
        document.createElement("style");

    estilo.textContent = `

        #editor a {
            color: #dc2626;
            text-decoration: underline;
            text-decoration-thickness: 1px;
            text-underline-offset: 2px;
            cursor: pointer;
        }

        #editor a:hover {
            color: #b91c1c;
        }

        #identificadorLink {
            position: fixed;
            z-index: 9999;
            max-width: 420px;
            padding: 10px 12px;
            border: 1px solid #cbd5e1;
            border-radius: 10px;
            background: #ffffff;
            box-shadow:
                0 10px 25px rgba(15, 23, 42, 0.12);
            font-size: 12px;
            line-height: 1.4;
        }

        #identificadorLinkEndereco {
            display: block;
            max-width: 380px;
            overflow: hidden;
            color: #475569;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        #identificadorLinkRemover {
            margin-top: 8px;
            border: 0;
            padding: 0;
            background: transparent;
            color: #dc2626;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
        }

        #identificadorLinkRemover:hover {
            color: #b91c1c;
        }

    `;

    document.head.appendChild(
        estilo
    );

    // ========================================
    // CRIAR IDENTIFICADOR
    // ========================================

    const identificador =
        document.createElement("div");

    identificador.id =
        "identificadorLink";

    identificador.className =
        "hidden";

    identificador.innerHTML = `

        <span id="identificadorLinkEndereco"></span>

        <button
            type="button"
            id="identificadorLinkRemover"
        >
            Remover link
        </button>

    `;

    identificador.style.display =
        "none";

    document.body.appendChild(
        identificador
    );

    const endereco =
        document.getElementById(
            "identificadorLinkEndereco"
        );

    const remover =
        document.getElementById(
            "identificadorLinkRemover"
        );

    let linkAtual = null;

    let esconderTimeout = null;

    // ========================================
    // MOSTRAR LINK
    // ========================================

    function mostrarLink(link) {

        if (!link) {
            return;
        }

        linkAtual =
            link;

        clearTimeout(
            esconderTimeout
        );

        const href =
            link.getAttribute("href");

        if (!href) {
            return;
        }

        let enderecoCompleto =
            href;

        try {

            enderecoCompleto =
                new URL(
                    href,
                    window.location.href
                ).href;

        } catch (error) {

            // Mantém o endereço original
            // caso não seja uma URL válida.

        }

        endereco.textContent =
            enderecoCompleto;

        const rect =
            link.getBoundingClientRect();

        identificador.style.display =
            "block";

        identificador.style.left =
            `${Math.max(
                10,
                Math.min(
                    rect.left,
                    window.innerWidth - 440
                )
            )}px`;

        identificador.style.top =
            `${rect.bottom + 8}px`;

    }

    // ========================================
    // ESCONDER LINK
    // ========================================

    function esconderLink() {

        esconderTimeout =
            setTimeout(
                () => {

                    if (
                        !identificador.matches(":hover")
                    ) {

                        identificador.style.display =
                            "none";

                        linkAtual =
                            null;

                    }

                },
                150
            );

    }

    // ========================================
    // PASSAR O MOUSE NOS LINKS
    // ========================================

    editor.addEventListener(
        "mouseover",
        event => {

            const link =
                event.target.closest(
                    "a"
                );

            if (
                !link ||
                !editor.contains(link)
            ) {

                return;

            }

            mostrarLink(
                link
            );

        }
    );

    editor.addEventListener(
        "mouseout",
        event => {

            const link =
                event.target.closest(
                    "a"
                );

            if (!link) {
                return;
            }

            if (
                event.relatedTarget &&
                link.contains(
                    event.relatedTarget
                )
            ) {

                return;

            }

            esconderLink();

        }
    );

    // ========================================
    // MANTER IDENTIFICADOR ABERTO
    // ========================================

    identificador.addEventListener(
        "mouseenter",
        () => {

            clearTimeout(
                esconderTimeout
            );

        }
    );

    identificador.addEventListener(
        "mouseleave",
        () => {

            esconderLink();

        }
    );

    // ========================================
    // REMOVER LINK
    // ========================================

    remover.addEventListener(
        "click",
        event => {

            event.preventDefault();
            event.stopPropagation();

            if (!linkAtual) {
                return;
            }

            const link =
                linkAtual;

            const fragmento =
                document.createDocumentFragment();

            while (
                link.firstChild
            ) {

                fragmento.appendChild(
                    link.firstChild
                );

            }

            link.parentNode.replaceChild(
                fragmento,
                link
            );

            identificador.style.display =
                "none";

            linkAtual =
                null;

            editor.focus();

        }
    );

}

inicializarIdentificadorDeLinks();