// ========================================
// SEO
// ========================================
//
// Responsável por:
// - Atualizar o contador da meta descrição
// - Controlar os campos de SEO
// ========================================

// ========================================
// ELEMENTOS
// ========================================

const fraseChaveInput =
    document.getElementById("frase_chave");

const slugInput =
    document.getElementById("slug");

const metaDescricaoInput =
    document.getElementById("meta_descricao");

const contadorMeta =
    document.getElementById("contadorMeta");

// ========================================
// CONTADOR DA META DESCRIÇÃO
// ========================================

function atualizarContadorMeta() {

    const quantidade =
        metaDescricaoInput.value.length;

    contadorMeta.textContent =
        `${quantidade} caracteres`;

    if (
        quantidade >= 140 &&
        quantidade <= 160
    ) {

        contadorMeta.className =
            "text-xs font-semibold text-emerald-600";

    } else {

        contadorMeta.className =
            "text-xs text-slate-400";

    }

}

// ========================================
// EVENTO DA META DESCRIÇÃO
// ========================================

metaDescricaoInput.addEventListener(
    "input",
    atualizarContadorMeta
);

atualizarContadorMeta();