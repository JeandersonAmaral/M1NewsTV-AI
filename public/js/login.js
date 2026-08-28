const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const erro = document.getElementById("erro");
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

