// ========================================
// SEO
// ========================================
//
// Responsável por:
// - Atualizar o contador do título
// - Atualizar o contador da meta descrição
// - Controlar os campos de SEO
// ========================================


// ========================================
// ELEMENTOS
// ========================================

const tituloInput =
    document.getElementById("titulo");

const contadorTitulo =
    document.getElementById("contadorTitulo");

const fraseChaveInput =
    document.getElementById("frase_chave");

const slugInput =
    document.getElementById("slug");

const metaDescricaoInput =
    document.getElementById("meta_descricao");

const contadorMeta =
    document.getElementById("contadorMeta");


// ========================================
// LIMITES
// ========================================

const LIMITE_TITULO = 60;

const LIMITE_META_MINIMO = 140;

const LIMITE_META_MAXIMO = 160;


// ========================================
// CONTADOR DO TÍTULO
// ========================================

function atualizarContadorTitulo() {

    if (!tituloInput || !contadorTitulo) {
        return;
    }

    const quantidade =
        tituloInput.value.length;

    contadorTitulo.textContent =
        `${quantidade} / ${LIMITE_TITULO} caracteres`;

    if (
        quantidade === 0 ||
        quantidade > LIMITE_TITULO
    ) {

        contadorTitulo.className =
            "text-xs font-semibold text-red-600";

    } else {

        contadorTitulo.className =
            "text-xs font-semibold text-emerald-600";

    }

}


// ========================================
// CONTADOR DA META DESCRIÇÃO
// ========================================

function atualizarContadorMeta() {

    if (!metaDescricaoInput || !contadorMeta) {
        return;
    }

    const quantidade =
        metaDescricaoInput.value.length;

    contadorMeta.textContent =
        `${quantidade} / ${LIMITE_META_MAXIMO} caracteres`;

    if (
        quantidade >= LIMITE_META_MINIMO &&
        quantidade <= LIMITE_META_MAXIMO
    ) {

        contadorMeta.className =
            "text-xs font-semibold text-emerald-600";

    } else {

        contadorMeta.className =
            "text-xs font-semibold text-red-600";

    }

}


// ========================================
// EVENTOS
// ========================================

if (tituloInput) {

    tituloInput.addEventListener(
        "input",
        atualizarContadorTitulo
    );

}

if (metaDescricaoInput) {

    metaDescricaoInput.addEventListener(
        "input",
        atualizarContadorMeta
    );

}


// ========================================
// ATUALIZAÇÃO INICIAL
// ========================================

atualizarContadorTitulo();

atualizarContadorMeta();
