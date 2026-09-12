// ========================================
// AUTENTICAÇÃO
// ========================================
//
// Responsável por:
// - Recuperar o token de autenticação
// - Redirecionar usuário não autenticado
// - Encerrar sessão
// - Renovar o token
// - Realizar requisições autenticadas
// - Renovar o token automaticamente
// ========================================


// ========================================
// TOKEN
// ========================================

let token =
    localStorage.getItem("token");


// ========================================
// VERIFICAR AUTENTICAÇÃO
// ========================================

if (!token) {

    window.location.href =
        "/login.html";

}


// ========================================
// SAIR
// ========================================

function sair() {

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("usuario");

    window.location.href =
        "/login.html";

}


// ========================================
// BOTÃO SAIR
// ========================================

const sairButton =
    document.getElementById("sair");

if (sairButton) {

    sairButton.addEventListener(
        "click",
        sair
    );

}


// ========================================
// RENOVAR TOKEN
// ========================================

async function renovarToken() {

    const refreshToken =
        localStorage.getItem(
            "refreshToken"
        );

    if (!refreshToken) {

        sair();

        return;

    }

    try {

        const response =
            await fetch(
                "/api/auth/refresh",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        refreshToken
                    })
                }
            );

        if (!response.ok) {

            throw new Error(
                "Não foi possível renovar a sessão."
            );

        }

        const data =
            await response.json();

        if (!data.token) {

            throw new Error(
                "Token de acesso não recebido."
            );

        }

        token =
            data.token;

        localStorage.setItem(
            "token",
            data.token
        );

        if (data.refreshToken) {

            localStorage.setItem(
                "refreshToken",
                data.refreshToken
            );

        }

        return data.token;

    } catch (error) {

        console.error(
            "Erro ao renovar token:",
            error
        );

        sair();

    }

}


// ========================================
// FETCH AUTENTICADO
// ========================================

async function fetchAutenticado(
    url,
    opcoes = {}
) {

    const configuracao = {
        ...opcoes,

        headers: {
            ...(opcoes.headers || {}),
            Authorization:
                `Bearer ${token}`
        }
    };


    let response =
        await fetch(
            url,
            configuracao
        );


    // ========================================
    // TOKEN EXPIRADO
    // ========================================

    if (response.status === 401) {

        const novoToken =
            await renovarToken();

        if (!novoToken) {

            return response;

        }

        configuracao.headers.Authorization =
            `Bearer ${novoToken}`;

        response =
            await fetch(
                url,
                configuracao
            );

    }


    return response;

}


// ========================================
// RENOVAÇÃO AUTOMÁTICA
// ========================================

let intervaloRefresh =
    setInterval(
        async () => {

            const novoToken =
                await renovarToken();

            if (novoToken) {

                token =
                    novoToken;

            }

        },
        10 * 60 * 1000
    );