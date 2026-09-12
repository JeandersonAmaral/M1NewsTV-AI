// ========================================
// IMAGEM
// ========================================
//
// Responsável por:
// - Controlar a imagem da matéria
// - Controlar o Alt Text
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
                `Dimensões: ${previewImagem.naturalWidth} × ${previewImagem.naturalHeight} px`;

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

window.definirImagemMateria =
    definirImagemMateria;

window.definirMateriaAltText =
    definirMateriaAltText;

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

