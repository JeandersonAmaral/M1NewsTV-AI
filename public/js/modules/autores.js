// ========================================
// AUTORES
// ========================================
//
// Responsável por:
// - Carregar os autores permitidos
// - Preencher o campo de seleção de autor
// ========================================

// ========================================
// ELEMENTOS
// ========================================

const autorSelect =
    document.getElementById("autor");

// ========================================
// CARREGAR AUTORES
// ========================================

async function carregarAutores() {

    if (!autorSelect) {
        return;
    }

    try {

        const response =
            await fetchAutenticado(
                "/api/autores"
            );

        if (!response) {
            return;
        }

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.sucesso
        ) {

            throw new Error(
                data.mensagem ||
                "Não foi possível carregar os autores."
            );

        }

        if (
            !Array.isArray(data.autores)
        ) {

            throw new Error(
                "O servidor não retornou uma lista de autores válida."
            );

        }

        autorSelect.innerHTML = "";

        data.autores.forEach(
            autor => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    autor.id;

                option.textContent =
                    autor.name;

                if (
                    Number(autor.id) === 58
                ) {

                    option.selected =
                        true;

                }

                autorSelect.appendChild(
                    option
                );

            }
        );

        if (
            data.autores.length === 0
        ) {

            console.warn(
                "Nenhum autor permitido foi retornado pelo WordPress."
            );

            autorSelect.innerHTML =
                '<option value="58">M1NewsTV AI</option>';

        }

    } catch (error) {

        console.error(
            "Erro ao carregar autores:",
            error
        );

        autorSelect.innerHTML =
            '<option value="58">M1NewsTV AI</option>';

    }

}

carregarAutores();