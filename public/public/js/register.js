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

function configurarOlhoSenha(inputId, buttonId, iconId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    const icon = document.getElementById(iconId);

    button.addEventListener("click", () => {
        const mostrandoSenha = input.type === "text";

        input.type = mostrandoSenha
            ? "password"
            : "text";

        button.setAttribute(
            "aria-label",
            mostrandoSenha
                ? "Mostrar senha"
                : "Ocultar senha"
        );

        if (mostrandoSenha) {
            icon.innerHTML = `
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 5 12 5c4.64 0 8.577 2.51 9.964 6.678.054.16.054.332 0 .644C20.577 16.49 16.64 19 12 19c-4.64 0-8.577-2.51-9.964-6.678z"
                />
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
            `;
        } else {
            icon.innerHTML = `
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19 12 19c.73 0 1.441-.082 2.118-.238M6.228 6.228A10.451 10.451 0 0112 5c4.756 0 8.773 2.662 10.065 7a10.477 10.477 0 01-4.293 5.507M6.228 6.228L3 3m3.228 3.228l3.44 3.44m7.104 7.104L21 21m-4.228-4.228l-3.44-3.44m0 0a3 3 0 10-4.243-4.243m4.243 4.243L9.09 9.09"
                />
            `;
        }
    });
}

configurarOlhoSenha(
    "senha",
    "toggleSenha",
    "eyeSenha"
);

configurarOlhoSenha(
    "confirmarSenha",
    "toggleConfirmarSenha",
    "eyeConfirmarSenha"
);