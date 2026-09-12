 // ========================================
// CATEGORIAS
// ========================================
//
// Responsável por:
// - Definir as categorias disponíveis
// - Renderizar os checkboxes
// - Marcar categorias retornadas pela IA
// ========================================

const categorias = [

    {
        nome: "Arte e Cultura",
        filhos: ["Cinema"]
    },

    {
        nome: "Cidadania"
    },

    {
        nome: "Clima"
    },

    {
        nome: "Codemar"
    },

    {
        nome: "Culinária"
    },

    {
        nome: "Destaques"
    },

    {
        nome: "Economia"
    },

    {
        nome: "Educação"
    },

    {
        nome: "Esporte",
        filhos: [
            "Copa do Mundo FIFA 2026"
        ]
    },

    {
        nome: "FaceNews"
    },

    {
        nome: "FLIM"
    },

    {
        nome: "Geral"
    },

    {
        nome: "Internacional"
    },

    {
        nome: "Jovens"
    },

    {
        nome: "Justiça"
    },

    {
        nome: "Maricá"
    },

    {
        nome: "Maricarnaval"
    },

    {
        nome: "Meio Ambiente",
        filhos: [
            "COP30",
            "Ecologia",
            "Sustentabilidade"
        ]
    },

    {
        nome: "Mulher"
    },

    {
        nome: "Política",
        filhos: [
            "Eleições",
            "Eleições 2026"
        ]
    },

    {
        nome: "Saúde",
        filhos: [
            "Coronavírus",
            "Saúde Animal"
        ]
    },

    {
        nome: "Segurança",
        filhos: [
            "Polícia"
        ]
    },

    {
        nome: "Tecnologia"
    },

    {
        nome: "Trânsito"
    },

    {
        nome: "Turismo"
    },

    {
        nome: "Últimas Notícias"
    }

];

// ========================================
// RENDERIZAR CATEGORIAS
// ========================================

function renderizarCategorias() {

    const categoriasContainer =
        document.getElementById("categorias");

    if (!categoriasContainer) {
        return;
    }

    categoriasContainer.innerHTML = "";

    categorias.forEach(
        categoria => {

            criarCheckboxCategoria(
                categoria.nome,
                true
            );

            if (categoria.filhos) {

                categoria.filhos.forEach(
                    filho => {

                        criarCheckboxCategoria(
                            filho,
                            false,
                            categoria.nome
                        );

                    }
                );

            }

        }
    );

}

// ========================================
// CRIAR CHECKBOX DE CATEGORIA
// ========================================

function criarCheckboxCategoria(
    nome,
    principal = false,
    pai = null
) {

    const categoriasContainer =
        document.getElementById("categorias");

    if (!categoriasContainer) {
        return;
    }

    const label =
        document.createElement("label");

    label.className =
        "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50";

    label.innerHTML = `

        <input
            type="checkbox"
            value="${nome}"
            ${principal ? 'data-principal="true"' : ""}
            ${pai ? `data-pai="${pai}"` : ""}
            class="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
        >

        <span>
            ${nome}
        </span>

    `;

    categoriasContainer.appendChild(
        label
    );

}

// ========================================
// MARCAR CATEGORIAS DA IA
// ========================================

function marcarCategorias(categoriasIA) {

    const categoriasContainer =
        document.getElementById("categorias");

    if (!categoriasContainer) {
        return;
    }

    const checkboxes =
        categoriasContainer.querySelectorAll(
            'input[type="checkbox"]'
        );

    checkboxes.forEach(
        checkbox => {

            checkbox.checked =
                categoriasIA.includes(
                    checkbox.value
                );

        }
    );

}

renderizarCategorias();