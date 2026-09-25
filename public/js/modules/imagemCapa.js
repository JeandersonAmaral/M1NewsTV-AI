// ========================================
// IMAGEM
// ========================================
//
// Responsável por:
// - Controlar a imagem da matéria
// - Controlar os metadados da imagem
// - Exibir o preview da imagem
// - Exibir as dimensões da imagem
// - Disponibilizar a imagem para o modo TESTE
// ========================================

// ========================================
// ELEMENTOS
// ========================================

const previewImagemContainer =
    document.getElementById(
        "previewImagemContainer"
    );

const previewImagem =
    document.getElementById(
        "previewImagem"
    );

const tamanhoImagem =
    document.getElementById(
        "tamanhoImagem"
    );

const imagemTituloInput =
    document.getElementById(
        "imagemTitulo"
    );

const imagemAltTextInput =
    document.getElementById(
        "imagemAltText"
    );

const imagemLegendaInput =
    document.getElementById(
        "imagemLegenda"
    );

const imagemDescricaoInput =
    document.getElementById(
        "imagemDescricao"
    );

// ========================================
// ESTADO DA IMAGEM
// ========================================

let imagemMateria = null;

let materiaAltText = "";

// ========================================
// IMAGEM DA MATÉRIA
// ========================================

function definirImagemMateria(url) {

    imagemMateria =
        url || null;

    atualizarPreviewImagem();

}

// ========================================
// ALT TEXT
// ========================================

function definirMateriaAltText(altText) {

    materiaAltText =
        altText || "";

    if (imagemAltTextInput) {

        imagemAltTextInput.value =
            materiaAltText;

    }

}

// ========================================
// METADADOS DA IMAGEM
// ========================================

function definirMetadadosImagem(
    titulo,
    altText,
    legenda,
    descricao
) {

    if (imagemTituloInput) {

        imagemTituloInput.value =
            titulo || "";

    }

    definirMateriaAltText(
        altText || ""
    );

    if (imagemLegendaInput) {

        imagemLegendaInput.value =
            legenda || "";

    }

    if (imagemDescricaoInput) {

        imagemDescricaoInput.value =
            descricao || "";

    }

}

// ========================================
// OBTER METADADOS DA IMAGEM
// ========================================

function obterMetadadosImagem() {

    return {

        titulo:
            imagemTituloInput
                ?.value
                .trim() || "",

        alt_text:
            imagemAltTextInput
                ?.value
                .trim() || "",

        legenda:
            imagemLegendaInput
                ?.value
                .trim() || "",

        descricao:
            imagemDescricaoInput
                ?.value
                .trim() || ""

    };

}

// ========================================
// ATUALIZAR PREVIEW
// ========================================

function atualizarPreviewImagem() {

    if (
        !previewImagem ||
        !previewImagemContainer ||
        !tamanhoImagem
    ) {
        return;
    }

    if (!imagemMateria) {

        previewImagem.src = "";

        tamanhoImagem.textContent = "";

        previewImagemContainer.classList.add(
            "hidden"
        );

        return;

    }

    previewImagem.src =
        imagemMateria;

    previewImagem.onload =
        () => {

            tamanhoImagem.textContent =
                `Dimensões atuais: ${previewImagem.naturalWidth} × ${previewImagem.naturalHeight} px`;

        };

    previewImagemContainer.classList.remove(
        "hidden"
    );

}

// ========================================
// LIMPAR IMAGEM
// ========================================

function limparImagem() {

    imagemMateria = null;

    materiaAltText = "";

    if (imagemTituloInput) {

        imagemTituloInput.value =
            "";

    }

    if (imagemAltTextInput) {

        imagemAltTextInput.value =
            "";

    }

    if (imagemLegendaInput) {

        imagemLegendaInput.value =
            "";

    }

    if (imagemDescricaoInput) {

        imagemDescricaoInput.value =
            "";

    }

    if (!previewImagem) {
        return;
    }

    previewImagem.src = "";

    if (tamanhoImagem) {

        tamanhoImagem.textContent = "";

    }

    if (previewImagemContainer) {

        previewImagemContainer.classList.add(
            "hidden"
        );

    }

}

// ========================================
// DISPONIBILIZAR IMAGEM PARA O APP
// ========================================

window.obterImagemMateria =
    function () {

        return imagemMateria;

    };

window.obterMateriaAltText =
    function () {

        return materiaAltText;

    };

window.obterMetadadosImagem =
    obterMetadadosImagem;

window.definirImagemMateria =
    definirImagemMateria;

window.definirMateriaAltText =
    definirMateriaAltText;

window.definirMetadadosImagem =
    definirMetadadosImagem;

window.atualizarPreviewImagem =
    atualizarPreviewImagem;

window.limparImagem =
    limparImagem;

// ========================================
// DISPONIBILIZAR IMAGEM PARA MODO TESTE
// ========================================

window.definirImagemMateriaTeste =
    function (url) {

        definirImagemMateria(url);

    };