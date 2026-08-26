const urlInput = document.getElementById("url");

const gerarButton = document.getElementById("gerar");

const loading = document.getElementById("loading");

const resultado = document.getElementById("resultado");

const tituloInput = document.getElementById("titulo");

const descricaoInput = document.getElementById("descricao");

const subtituloInput = document.getElementById("subtitulo");

const editor = document.getElementById("editor");

const tagsContainer = document.getElementById("tags");

const categoriasContainer = document.getElementById("categorias");

const fraseChaveInput =
    document.getElementById("frase_chave");

const slugInput =
    document.getElementById("slug");

const metaDescricaoInput =
    document.getElementById("meta_descricao");

const contadorMeta =
    document.getElementById("contadorMeta");

const novaTagInput =
    document.getElementById("novaTag");

const adicionarTagButton =
    document.getElementById("adicionarTag");

const limparButton =
    document.getElementById("limpar");

const enviarButton =
    document.getElementById("enviar");


// ========================================
// CATEGORIAS
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

    categoriasContainer.innerHTML = "";

    categorias.forEach(categoria => {

        criarCheckboxCategoria(
            categoria.nome,
            true
        );

        if (categoria.filhos) {

            categoria.filhos.forEach(filho => {

                criarCheckboxCategoria(
                    filho,
                    false,
                    categoria.nome
                );

            });

        }

    });

}


// ========================================
// CRIAR CHECKBOX DE CATEGORIA
// ========================================

function criarCheckboxCategoria(
    nome,
    principal = false,
    pai = null
) {

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

    categoriasContainer.appendChild(label);

}


// ========================================
// MARCAR CATEGORIAS DA IA
// ========================================

function marcarCategorias(categoriasIA) {

    const checkboxes =
        categoriasContainer.querySelectorAll(
            'input[type="checkbox"]'
        );

    checkboxes.forEach(checkbox => {

        checkbox.checked =
            categoriasIA.includes(
                checkbox.value
            );

    });

}


// ========================================
// TAGS
// ========================================

function renderizarTags(tags) {

    tagsContainer.innerHTML = "";

    tags.forEach(tag => {

        adicionarTagNaTela(tag);

    });

}


function adicionarTagNaTela(tag) {

    const elemento =
        document.createElement("div");

    elemento.className =
        "flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700";

    const texto =
        document.createElement("span");

    texto.textContent = tag;

    const remover =
        document.createElement("button");

    remover.type = "button";

    remover.textContent = "×";

    remover.className =
        "font-bold text-slate-400 hover:text-red-600";

    remover.addEventListener(
        "click",
        () => {

            elemento.remove();

        }
    );

    elemento.appendChild(texto);

    elemento.appendChild(remover);

    tagsContainer.appendChild(elemento);

}


// ========================================
// ADICIONAR TAG
// ========================================

function adicionarNovaTag() {

    const tag =
        novaTagInput.value.trim();

    if (!tag) {
        return;
    }

    adicionarTagNaTela(tag);

    novaTagInput.value = "";

}


adicionarTagButton.addEventListener(
    "click",
    adicionarNovaTag
);


novaTagInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            event.preventDefault();

            adicionarNovaTag();

        }

    }
);


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


metaDescricaoInput.addEventListener(
    "input",
    atualizarContadorMeta
);


// ========================================
// GERAR MATÉRIA
// ========================================

gerarButton.addEventListener(
    "click",
    async () => {

        const url =
            urlInput.value.trim();

        if (!url) {

            alert(
                "Cole a URL de uma matéria."
            );

            urlInput.focus();

            return;

        }

        gerarButton.disabled = true;

        loading.classList.remove(
            "hidden"
        );

        loading.classList.add(
            "flex"
        );

        resultado.classList.add(
            "hidden"
        );

        enviarButton.disabled = false;

        enviarButton.textContent =
            "Enviar para rascunho";

        try {

            const response =
                await fetch(
                    "/api/materias",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            url
                        })
                    }
                );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.sucesso
            ) {

                throw new Error(
                    data.mensagem ||
                    "Erro ao gerar matéria."
                );

            }

            const materia =
                data.materiaGerada;


            // =========================
            // CAMPOS
            // =========================

            tituloInput.value =
                materia.titulo || "";

            descricaoInput.value =
                materia.descricao || "";

            subtituloInput.value =
                materia.subtitulo || "";


            // =========================
            // CONTEÚDO
            // =========================

            editor.innerHTML =
                materia.conteudo || "";


            // =========================
            // SEO
            // =========================

            fraseChaveInput.value =
                materia.frase_chave || "";

            slugInput.value =
                materia.slug || "";

            metaDescricaoInput.value =
                materia.meta_descricao || "";

            atualizarContadorMeta();


            // =========================
            // TAGS
            // =========================

            renderizarTags(
                materia.tags || []
            );


            // =========================
            // CATEGORIAS
            // =========================

            marcarCategorias(
                materia.categorias || []
            );


            // =========================
            // MOSTRAR EDITOR
            // =========================

            resultado.classList.remove(
                "hidden"
            );

            resultado.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });


        } catch (error) {

            console.error(error);

            alert(
                "Erro ao gerar matéria:\n\n" +
                error.message
            );

        } finally {

            gerarButton.disabled =
                false;

            loading.classList.add(
                "hidden"
            );

            loading.classList.remove(
                "flex"
            );

        }

    }
);


// ========================================
// ENVIAR PARA RASCUNHO NO WORDPRESS
// ========================================

enviarButton.addEventListener(
    "click",
    async () => {

        // =========================
        // PEGAR DADOS ATUAIS
        // =========================

        const titulo =
            tituloInput.value.trim();

        const descricao =
            descricaoInput.value.trim();

        const subtitulo =
            subtituloInput.value.trim();

        const conteudo =
            editor.innerHTML.trim();

        const slug =
            slugInput.value.trim();

        const frase_chave =
            fraseChaveInput.value.trim();

        const meta_descricao =
            metaDescricaoInput.value.trim();


        // =========================
        // PEGAR TAGS
        // =========================

        const tags =
            Array.from(
                tagsContainer.querySelectorAll("span")
            )
            .map(
                elemento =>
                    elemento.textContent.trim()
            )
            .filter(
                tag => tag.length > 0
            );


        // =========================
        // PEGAR CATEGORIAS
        // =========================

        const categoriasSelecionadas =
            Array.from(
                categoriasContainer.querySelectorAll(
                    'input[type="checkbox"]:checked'
                )
            )
            .map(
                checkbox =>
                    checkbox.value
            );


        // =========================
        // VALIDAÇÃO
        // =========================

        if (!titulo) {

            alert(
                "O título da matéria é obrigatório."
            );

            tituloInput.focus();

            return;

        }

        if (!conteudo) {

            alert(
                "O conteúdo da matéria está vazio."
            );

            editor.focus();

            return;

        }


        // =========================
        // CONFIRMAÇÃO
        // =========================

        const confirmar =
            confirm(
                "Deseja enviar esta matéria para o WordPress como rascunho?"
            );

        if (!confirmar) {
            return;
        }


        // =========================
        // ESTADO DO BOTÃO
        // =========================

        enviarButton.disabled = true;

        const textoOriginal =
            enviarButton.textContent;

        enviarButton.textContent =
            "Enviando...";


        try {

            console.log(
                "Enviando matéria para o WordPress..."
            );

            console.log(
                "Tags:",
                tags
            );

            console.log(
                "Categorias:",
                categoriasSelecionadas
            );


            // =========================
            // ENVIAR PARA SERVIDOR
            // =========================

            const response =
                await fetch(
                    "/api/materias/rascunho",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            titulo,

                            descricao,

                            subtitulo,

                            conteudo,

                            slug,

                            frase_chave,

                            meta_descricao,

                            tags,

                            categorias:
                                categoriasSelecionadas

                        })

                    }
                );


            const data =
                await response.json();


            // =========================
            // VERIFICAR RESPOSTA
            // =========================

            if (
                !response.ok ||
                !data.sucesso
            ) {

                throw new Error(
                    data.mensagem ||
                    "Erro ao criar o rascunho."
                );

            }


            // =========================
            // SUCESSO
            // =========================

            console.log(
                "Rascunho criado:",
                data
            );

            enviarButton.textContent =
                "Rascunho criado ✓";

            enviarButton.classList.remove(
                "bg-slate-950",
                "hover:bg-slate-800"
            );

            enviarButton.classList.add(
                "bg-emerald-600",
                "hover:bg-emerald-700"
            );


            // =========================
            // LINK PARA O RASCUNHO
            // =========================

            const linkExistente =
                document.getElementById(
                    "abrirRascunho"
                );

            if (linkExistente) {
                linkExistente.remove();
            }


            const abrirRascunho =
                document.createElement("a");

            abrirRascunho.id =
                "abrirRascunho";

            abrirRascunho.href =
                data.link;

            abrirRascunho.target =
                "_blank";

            abrirRascunho.rel =
                "noopener noreferrer";

            abrirRascunho.textContent =
                "Abrir rascunho no WordPress →";

            abrirRascunho.className =
                "inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50";


            enviarButton.parentElement.appendChild(
                abrirRascunho
            );


            // =========================
            // MENSAGEM
            // =========================

            alert(
                `Rascunho criado com sucesso!\n\n` +
                `ID: ${data.id}`
            );


        } catch (error) {

            console.error(
                "Erro ao enviar rascunho:",
                error
            );

            alert(
                "Não foi possível enviar a matéria para o WordPress.\n\n" +
                error.message
            );

            enviarButton.disabled = false;

            enviarButton.textContent =
                textoOriginal;

        }

    }
);


// ========================================
// LIMPAR
// ========================================

limparButton.addEventListener(
    "click",
    () => {

        if (
            !confirm(
                "Deseja limpar a matéria atual?"
            )
        ) {
            return;
        }


        urlInput.value = "";

        tituloInput.value = "";

        descricaoInput.value = "";

        subtituloInput.value = "";

        editor.innerHTML = "";

        fraseChaveInput.value = "";

        slugInput.value = "";

        metaDescricaoInput.value = "";

        tagsContainer.innerHTML = "";


        // =========================
        // LIMPAR CATEGORIAS
        // =========================

        const checkboxes =
            categoriasContainer.querySelectorAll(
                'input[type="checkbox"]'
            );

        checkboxes.forEach(
            checkbox => {

                checkbox.checked = false;

            }
        );


        // =========================
        // LIMPAR META
        // =========================

        atualizarContadorMeta();


        // =========================
        // REMOVER LINK DO RASCUNHO
        // =========================

        const abrirRascunho =
            document.getElementById(
                "abrirRascunho"
            );

        if (abrirRascunho) {
            abrirRascunho.remove();
        }


        // =========================
        // RESTAURAR BOTÃO
        // =========================

        enviarButton.disabled = false;

        enviarButton.textContent =
            "Enviar para rascunho";

        enviarButton.classList.remove(
            "bg-emerald-600",
            "hover:bg-emerald-700"
        );

        enviarButton.classList.add(
            "bg-slate-950",
            "hover:bg-slate-800"
        );


        // =========================
        // ESCONDER RESULTADO
        // =========================

        resultado.classList.add(
            "hidden"
        );


        // =========================
        // VOLTAR AO TOPO
        // =========================

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


// ========================================
// INICIALIZAÇÃO
// ========================================

renderizarCategorias();

atualizarContadorMeta();