// ========================================
// ELEMENTOS
// ========================================

const registerForm =
    document.getElementById("registerForm");

const usernameInput =
    document.getElementById("username");

const senhaInput =
    document.getElementById("senha");

const confirmarSenhaInput =
    document.getElementById("confirmarSenha");

const registerButton =
    document.getElementById("registerButton");

const erro =
    document.getElementById("erro");

// ========================================
// MOSTRAR MENSAGEM
// ========================================

function mostrarMensagem(texto, sucesso = false) {

    erro.textContent = texto;

    erro.classList.remove(
        "hidden",
        "border-red-200",
        "bg-red-50",
        "text-red-600",
        "border-emerald-200",
        "bg-emerald-50",
        "text-emerald-600"
    );

    if (sucesso) {

        erro.classList.add(
            "border-emerald-200",
            "bg-emerald-50",
            "text-emerald-600"
        );

    } else {

        erro.classList.add(
            "border-red-200",
            "bg-red-50",
            "text-red-600"
        );
    }
}

// ========================================
// ESCONDER MENSAGEM
// ========================================

function esconderMensagem() {

    erro.classList.add("hidden");
}

// ========================================
// CADASTRAR
// ========================================

registerForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        // ========================================
        // PEGAR DADOS
        // ========================================

        const username =
            usernameInput.value.trim().toLowerCase();

        const senha =
            senhaInput.value;

        const confirmarSenha =
            confirmarSenhaInput.value;

        // ========================================
        // LIMPAR MENSAGEM ANTERIOR
        // ========================================

        esconderMensagem();

        // ========================================
        // VALIDAÇÕES
        // ========================================

        if (!username) {

            mostrarMensagem(
                "Informe seu usuário."
            );

            usernameInput.focus();

            return;
        }

        if (username.length < 3) {

            mostrarMensagem(
                "O usuário deve ter pelo menos 3 caracteres."
            );

            usernameInput.focus();

            return;
        }

        if (senha.length < 6) {

            mostrarMensagem(
                "A senha deve ter pelo menos 6 caracteres."
            );

            senhaInput.focus();

            return;
        }

        if (senha !== confirmarSenha) {

            mostrarMensagem(
                "As senhas não coincidem."
            );

            confirmarSenhaInput.focus();

            return;
        }

        // ========================================
        // ESTADO DO BOTÃO
        // ========================================

        registerButton.disabled = true;

        registerButton.textContent =
            "Criando conta...";

        try {

            // ========================================
            // ENVIAR PARA O SERVIDOR
            // ========================================

            const response =
                await fetch(
                    "/api/auth/register",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            username,
                            password: senha
                        })
                    }
                );

            // ========================================
            // LER RESPOSTA
            // ========================================

            const data =
                await response.json();

            // ========================================
            // VERIFICAR RESPOSTA
            // ========================================

            if (
                !response.ok ||
                !data.sucesso
            ) {

                throw new Error(
                    data.mensagem ||
                    "Não foi possível criar a conta."
                );
            }

            // ========================================
            // SUCESSO
            // ========================================

            mostrarMensagem(
                "Conta criada com sucesso! Redirecionando para o login...",
                true
            );

            registerButton.textContent =
                "Conta criada ✓";

            // ========================================
            // REDIRECIONAR
            // ========================================

            setTimeout(
                () => {

                    window.location.href =
                        "/login.html";

                },
                1500
            );

        } catch (error) {

            console.error(
                "Erro ao criar conta:",
                error
            );

            mostrarMensagem(
                error.message ||
                "Não foi possível criar a conta."
            );

            // ========================================
            // RESTAURAR BOTÃO
            // ========================================

            registerButton.disabled = false;

            registerButton.textContent =
                "Criar conta";
        }
    }
);