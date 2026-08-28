const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const erro = document.getElementById("erro");
const togglePassword = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");
// ========================================
// LOGIN
// ========================================
loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const username =
            usernameInput.value.trim();

        const password =
            passwordInput.value;
        // ========================================
        // VALIDAÇÃO
        // ========================================
        if (!username || !password) {

            erro.textContent =
                "Usuário e senha são obrigatórios.";

            erro.classList.remove("hidden");

            return;
        }
        // ========================================
        // ESTADO DO BOTÃO
        // ========================================
        loginButton.disabled = true;

        loginButton.textContent =
            "Entrando...";

        erro.classList.add("hidden");
        // ========================================
        // ENVIAR PARA SERVIDOR
        // ========================================
        try {

            const response =
                await fetch(
                    "/api/auth/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            username,
                            password
                        })
                    }
                );

            const data =
                await response.json();
            // ========================================
            // VERIFICAR RESPOSTA
            // ========================================
            if (!response.ok) {

                throw new Error(
                    data.erro ||
                    "Usuário ou senha inválidos."
                );
            }
            /// ========================================
            // SALVAR AUTENTICAÇÃO
            // ========================================

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "refreshToken",
                data.refreshToken
            );

            localStorage.setItem(
                "usuario",
                JSON.stringify(
                    data.usuario
                )
            );
            // ========================================
            // IR PARA O PAINEL
            // ========================================
            window.location.href = "/";

        } catch (error) {

            console.error(
                "Erro ao realizar login:",
                error
            );

            erro.textContent =
                error.message;

            erro.classList.remove(
                "hidden"
            );

            loginButton.disabled = false;

            loginButton.textContent =
                "Entrar";
        }

    }
);

togglePassword.addEventListener("click", () => {
    const mostrandoSenha =
        passwordInput.type === "text";

    passwordInput.type =
        mostrandoSenha ? "password" : "text";

    togglePassword.setAttribute(
        "aria-label",
        mostrandoSenha
            ? "Mostrar senha"
            : "Ocultar senha"
    );

    if (mostrandoSenha) {
        eyeIcon.innerHTML = `
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
        eyeIcon.innerHTML = `
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19 12 19c.73 0 1.441-.082 2.118-.238M6.228 6.228A10.451 10.451 0 0112 5c4.756 0 8.773 2.662 10.065 7a10.477 10.477 0 01-4.293 5.507M6.228 6.228L3 3m3.228 3.228l3.44 3.44m7.104 7.104L21 21m-4.228-4.228l-3.44-3.44m0 0a3 3 0 10-4.243-4.243m4.243 4.243L9.09 9.09"
            />
        `;
    }
});