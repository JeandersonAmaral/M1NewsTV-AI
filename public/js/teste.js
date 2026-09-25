// ========================================
// MODO TESTE - M1NewsTV AI
// ========================================
//
// Digite TESTE na caixa de URL e clique em GERAR.
//
// Quando "TESTE" for usado:
// - NÃO chama /api/materias
// - NÃO chama Gemini
// - NÃO processa nenhuma URL
// - NÃO publica automaticamente no WordPress
// - Carrega uma imagem aleatória para testar
//   o fluxo de imagem
//
// Para remover o modo teste:
// - Apague este arquivo
// - Remova a linha do teste.js no HTML
// ========================================

(function () {

    "use strict";

    // ========================================
    // GERAR URL DE IMAGEM ALEATÓRIA
    // ========================================

    function gerarImagemTeste() {

        const numero =
            Math.floor(
                Math.random() * 1000000
            );

        return `https://picsum.photos/seed/m1newstv-${numero}/1200/800`;

    }


    // ========================================
    // BAIXAR IMAGEM E TRANSFORMAR EM FILE
    // ========================================

    async function baixarImagemTeste() {

        const imagemUrl =
            gerarImagemTeste();

        console.log(
            "[TESTE] URL da imagem:",
            imagemUrl
        );

        const response =
            await fetch(imagemUrl);

        if (!response.ok) {

            throw new Error(
                "Não foi possível baixar a imagem de teste."
            );

        }

        const blob =
            await response.blob();

        const extensao =
            blob.type === "image/png"
                ? "png"
                : "jpg";

        const arquivo =
            new File(
                [blob],
                `m1newstv-teste-${Date.now()}.${extensao}`,
                {
                    type:
                        blob.type || "image/jpeg"
                }
            );

        return {
            arquivo,
            url: imagemUrl
        };

    }


    // ========================================
    // COLOCAR FILE NO INPUT DE IMAGEM
    // ========================================

    function colocarArquivoNoInput(arquivo) {

        const inputs =
            document.querySelectorAll(
                'input[type="file"]'
            );

        if (!inputs.length) {

            console.warn(
                "[TESTE] Nenhum input[type=file] encontrado."
            );

            return false;

        }

        // Tenta encontrar o input relacionado
        // à imagem.

        let inputImagem = null;

        inputs.forEach(
            input => {

                const id =
                    (
                        input.id || ""
                    ).toLowerCase();

                const name =
                    (
                        input.name || ""
                    ).toLowerCase();

                const accept =
                    (
                        input.accept || ""
                    ).toLowerCase();

                if (
                    id.includes("imagem") ||
                    id.includes("image") ||
                    name.includes("imagem") ||
                    name.includes("image") ||
                    accept.includes("image")
                ) {

                    inputImagem = input;

                }

            }
        );

        // Se não encontrou um específico,
        // usa o primeiro input de arquivo.

        if (!inputImagem) {

            inputImagem =
                inputs[0];

        }

        try {

            const dataTransfer =
                new DataTransfer();

            dataTransfer.items.add(
                arquivo
            );

            inputImagem.files =
                dataTransfer.files;

            // Dispara os eventos normalmente
            // utilizados pela interface.

            inputImagem.dispatchEvent(
                new Event(
                    "change",
                    {
                        bubbles: true
                    }
                )
            );

            inputImagem.dispatchEvent(
                new Event(
                    "input",
                    {
                        bubbles: true
                    }
                )
            );

            console.log(
                "[TESTE] Imagem colocada no input:",
                inputImagem
            );

            console.log(
                "[TESTE] Arquivo:",
                arquivo.name
            );

            console.log(
                "[TESTE] Tamanho:",
                arquivo.size,
                "bytes"
            );

            console.log(
                "[TESTE] Tipo:",
                arquivo.type
            );

            return true;

        } catch (error) {

            console.error(
                "[TESTE] Erro ao colocar imagem no input:",
                error
            );

            return false;

        }

    }


    // ========================================
    // MOSTRAR PREVIEW
    // ========================================

    function mostrarPreviewImagem(
        arquivo
    ) {

        const url =
            URL.createObjectURL(
                arquivo
            );

        // Procura uma área de preview existente.

        const previewExistente =
            document.querySelector(
                "#previewImagem, " +
                "#imagemPreview, " +
                "[data-imagem-preview]"
            );

        if (previewExistente) {

            if (
                previewExistente.tagName === "IMG"
            ) {

                previewExistente.src =
                    url;

                previewExistente.alt =
                    "Imagem ilustrativa para teste do M1NewsTV AI";

            } else {

                previewExistente.innerHTML = `
                    <img
                        src="${url}"
                        alt="Imagem ilustrativa para teste do M1NewsTV AI"
                        class="max-w-full rounded-xl object-cover"
                    >
                `;

            }

            return;

        }


        // Se a interface não possuir uma área
        // específica, cria uma automaticamente.

        const resultado =
            document.getElementById(
                "resultado"
            );

        if (!resultado) {

            return;

        }

        let area =
            document.getElementById(
                "previewImagemTeste"
            );

        if (!area) {

            area =
                document.createElement(
                    "div"
                );

            area.id =
                "previewImagemTeste";

            area.className =
                "mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4";

            resultado.prepend(
                area
            );

        }

        area.innerHTML = `
            <div class="mb-2 text-sm font-semibold text-slate-700">
                Imagem de teste
            </div>

            <img
                src="${url}"
                alt="Imagem ilustrativa para teste do M1NewsTV AI"
                class="w-full max-w-3xl rounded-xl object-cover"
            >

            <div class="mt-2 text-xs text-slate-500">
                Arquivo:
                ${arquivo.name}
                ·
                ${(arquivo.size / 1024).toFixed(1)} KB
            </div>
        `;

    }


    // ========================================
    // MODO TESTE
    // ========================================

    async function iniciarModoTeste() {

        const urlInput =
            document.getElementById("url");

        const gerarButton =
            document.getElementById("gerar");

        if (!urlInput || !gerarButton) {

            console.warn(
                "[TESTE] Elementos #url ou #gerar não encontrados."
            );

            return;

        }


        // ========================================
        // MATÉRIA FICTÍCIA
        // ========================================

        const materiaTeste = {

            titulo:
                "Maricá anuncia novas ações para melhorar a mobilidade urbana",

            descricao:
                "Novas medidas serão adotadas para melhorar a mobilidade urbana e beneficiar moradores de diferentes regiões de Maricá.",

            subtitulo:
                "Novas medidas serão implementadas em diferentes regiões da cidade",

            conteudo: `
                <h1>
                    <strong>
                        Novas medidas serão implementadas em diferentes regiões da cidade
                    </strong>
                </h1>

                <p>
                    Este é um conteúdo fictício utilizado exclusivamente
                    para testar a interface do M1NewsTV AI.
                </p>

                <p>
                    A matéria de teste permite verificar os campos de título,
                    descrição, subtítulo, conteúdo, tags, categorias e
                    <a href="https://m1newstv.com">
                        SEO.
                    </a>
                </p>

                <p>
                    O sistema não realizou nenhuma requisição à inteligência
                    artificial para gerar este conteúdo.
                </p>

                <p>
                    <strong>Fonte:</strong> M1NewsTV AI — TESTE
                </p>
            `,

            tags: [
                "Maricá",
                "Mobilidade",
                "Trânsito"
            ],

            categorias: [
                "Maricá",
                "Trânsito"
            ],

            frase_chave:
                "mobilidade em Maricá",

            slug:
                "marica-anuncia-novas-acoes-mobilidade-urbana",

            meta_descricao:
                "Maricá anuncia novas ações para melhorar a mobilidade urbana e beneficiar moradores de diferentes regiões da cidade.",

            alt_text:
                "Imagem ilustrativa de mobilidade urbana em Maricá"

        };


        // ========================================
        // INTERCEPTAR GERAR
        // ========================================

        gerarButton.addEventListener(
            "click",
            async function (event) {

                const valor =
                    urlInput.value.trim();

                if (
                    valor.toUpperCase() !== "TESTE"
                ) {

                    return;

                }

                event.preventDefault();

                event.stopImmediatePropagation();


                console.log(
                    "========================================"
                );

                console.log(
                    "[TESTE] Modo de teste ativado."
                );

                console.log(
                    "[TESTE] Nenhuma requisição à IA foi realizada."
                );

                console.log(
                    "[TESTE] Nenhuma matéria real foi processada."
                );

                console.log(
                    "========================================"
                );


                // ========================================
                // ELEMENTOS
                // ========================================

                const resultado =
                    document.getElementById(
                        "resultado"
                    );

                const tituloInput =
                    document.getElementById(
                        "titulo"
                    );

                const descricaoInput =
                    document.getElementById(
                        "descricao"
                    );

                const subtituloInput =
                    document.getElementById(
                        "subtitulo"
                    );

                const editor =
                    document.getElementById(
                        "editor"
                    );

                const tagsContainer =
                    document.getElementById(
                        "tags"
                    );

                const categoriasContainer =
                    document.getElementById(
                        "categorias"
                    );

                const fraseChaveInput =
                    document.getElementById(
                        "frase_chave"
                    );

                const slugInput =
                    document.getElementById(
                        "slug"
                    );

                const metaDescricaoInput =
                    document.getElementById(
                        "meta_descricao"
                    );

                const contadorMeta =
                    document.getElementById(
                        "contadorMeta"
                    );


                // ========================================
                // TÍTULO
                // ========================================

                if (tituloInput) {

                    tituloInput.value =
                        materiaTeste.titulo;

                }


                // ========================================
                // DESCRIÇÃO
                // ========================================

                if (descricaoInput) {

                    descricaoInput.value =
                        materiaTeste.descricao;

                }


                // ========================================
                // SUBTÍTULO
                // ========================================

                if (subtituloInput) {

                    subtituloInput.value =
                        materiaTeste.subtitulo;

                }


                // ========================================
                // CONTEÚDO
                // ========================================

                if (editor) {

                    editor.innerHTML =
                        materiaTeste.conteudo;

                }


                // ========================================
                // SEO
                // ========================================

                if (fraseChaveInput) {

                    fraseChaveInput.value =
                        materiaTeste.frase_chave;

                }

                if (slugInput) {

                    slugInput.value =
                        materiaTeste.slug;

                }

                if (metaDescricaoInput) {

                    metaDescricaoInput.value =
                        materiaTeste.meta_descricao;

                }

                if (
                    contadorMeta &&
                    metaDescricaoInput
                ) {

                    contadorMeta.textContent =
                        `${metaDescricaoInput.value.length} caracteres`;

                }


                // ========================================
                // TAGS
                // ========================================

                if (tagsContainer) {

                    tagsContainer.innerHTML =
                        "";

                    materiaTeste.tags.forEach(
                        tag => {

                            const elemento =
                                document.createElement(
                                    "div"
                                );

                            elemento.className =
                                "flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700";

                            const texto =
                                document.createElement(
                                    "span"
                                );

                            texto.textContent =
                                tag;

                            const remover =
                                document.createElement(
                                    "button"
                                );

                            remover.type =
                                "button";

                            remover.textContent =
                                "×";

                            remover.className =
                                "font-bold text-slate-400 hover:text-red-600";

                            remover.addEventListener(
                                "click",
                                () => {

                                    elemento.remove();

                                }
                            );

                            elemento.appendChild(
                                texto
                            );

                            elemento.appendChild(
                                remover
                            );

                            tagsContainer.appendChild(
                                elemento
                            );

                        }
                    );

                }


                // ========================================
                // CATEGORIAS
                // ========================================

                if (categoriasContainer) {

                    const checkboxes =
                        categoriasContainer.querySelectorAll(
                            'input[type="checkbox"]'
                        );

                    checkboxes.forEach(
                        checkbox => {

                            checkbox.checked =
                                materiaTeste.categorias.includes(
                                    checkbox.value
                                );

                        }
                    );

                }


                // ========================================
                // ALT TEXT
                // ========================================

                window.materiaAltTextTeste =
                    materiaTeste.alt_text;

                console.log(
                    "[TESTE] Alt text:",
                    materiaTeste.alt_text
                );


                // ========================================
                // IMAGEM
                // ========================================

                try {

                    console.log(
                        "[TESTE] Buscando imagem aleatória..."
                    );

                    const imagem =
                        await baixarImagemTeste();

                    console.log(
                        "[TESTE] Imagem encontrada:",
                        imagem.url
                    );

                    // ========================================
                    // DEFINIR IMAGEM NO APP.JS
                    // ========================================

                    if (
                        typeof window.definirImagemMateriaTeste ===
                        "function"
                    ) {

                        window.definirImagemMateriaTeste(
                            imagem.url
                        );

                    } else {

                        console.warn(
                            "[TESTE] Função de imagem do modo teste não encontrada."
                        );

                    }

                    // ========================================
                    // DEFINIR METADADOS DA IMAGEM
                    // ========================================

                    const tagsImagem =
                        materiaTeste.tags.join(", ");

                    if (
                        typeof window.definirMetadadosImagem ===
                        "function"
                    ) {

                        window.definirMetadadosImagem(
                            "Maricá - Mobilidade urbana",
                            materiaTeste.alt_text,
                            "Maricá, Rio de Janeiro",
                            `Imagem ilustrativa utilizada para representar mobilidade urbana em Maricá. Tags relacionadas: ${tagsImagem}.`
                        );

                        console.log(
                            "[TESTE] Metadados da imagem preenchidos."
                        );

                    } else {

                        console.warn(
                            "[TESTE] Função definirMetadadosImagem não encontrada."
                        );

                    }

                    // ========================================
                    // GUARDAR PARA TESTE
                    // ========================================

                    window.imagemTesteUrl =
                        imagem.url;

                    window.imagemTeste =
                        imagem.arquivo;

                    // ========================================
                    // PREVIEW
                    // ========================================

                    previewImagem.src =
                        imagem.url;

                    previewImagemContainer.classList.remove(
                        "hidden"
                    );

                    previewImagem.onload = () => {

                        tamanhoImagem.textContent =
                            `Dimensões: ${previewImagem.naturalWidth} × ${previewImagem.naturalHeight} px`;

                    };

                    console.log(
                        "[TESTE] Imagem pronta para envio."
                    );

                } catch (error) {

                    console.error(
                        "[TESTE] Erro ao carregar imagem de teste:",
                        error
                    );

                }


                // ========================================
                // AUTOR
                // ========================================

                const autorSelect =
                    document.getElementById(
                        "autor"
                    );

                if (autorSelect) {

                    console.log(
                        "[TESTE] Autor selecionado:",
                        autorSelect.value
                    );

                    console.log(
                        "[TESTE] Nome do autor:",
                        autorSelect.selectedOptions[0]
                            ?.textContent
                    );

                }


                // ========================================
                // MOSTRAR RESULTADO
                // ========================================

                if (resultado) {

                    resultado.classList.remove(
                        "hidden"
                    );

                    resultado.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }


                console.log(
                    "[TESTE] Matéria de teste carregada."
                );

                console.log(
                    "[TESTE] Imagem de teste carregada."
                );

            },
            true
        );


        console.log(
            "[TESTE] Modo de teste disponível."
        );

        console.log(
            '[TESTE] Digite "TESTE" na caixa de URL e clique em GERAR.'
        );

    }


    // ========================================
    // INICIALIZAÇÃO
    // ========================================

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            iniciarModoTeste
        );

    } else {

        iniciarModoTeste();

    }

})();