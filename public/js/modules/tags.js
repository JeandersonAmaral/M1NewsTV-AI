 // ========================================
// TAGS
// ========================================
//
// Responsável por:
// - Renderizar tags
// - Adicionar novas tags
// - Remover tags
// ========================================

// ========================================
// RENDERIZAR TAGS
// ========================================

function renderizarTags(tags) {

    const tagsContainer =
        document.getElementById("tags");

    if (!tagsContainer) {
        return;
    }

    tagsContainer.innerHTML = "";

    tags.forEach(
        tag => {

            adicionarTagNaTela(tag);

        }
    );

}

// ========================================
// ADICIONAR TAG NA TELA
// ========================================

function adicionarTagNaTela(tag) {

    const tagsContainer =
        document.getElementById("tags");

    if (!tagsContainer) {
        return;
    }

    const elemento =
        document.createElement("div");

    elemento.className =
        "flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700";

    const texto =
        document.createElement("span");

    texto.textContent =
        tag;

    const remover =
        document.createElement("button");

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

// ========================================
// ADICIONAR NOVA TAG
// ========================================

function adicionarNovaTag() {

    const novaTagInput =
        document.getElementById("novaTag");

    if (!novaTagInput) {
        return;
    }

    const tag =
        novaTagInput.value.trim();

    if (!tag) {
        return;
    }

    adicionarTagNaTela(tag);

    novaTagInput.value = "";

}

const adicionarTagButton =
    document.getElementById("adicionarTag");

const novaTagInput =
    document.getElementById("novaTag");

if (adicionarTagButton) {

    adicionarTagButton.addEventListener(
        "click",
        adicionarNovaTag
    );

}

if (novaTagInput) {

    novaTagInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                adicionarNovaTag();

            }

        }
    );

}