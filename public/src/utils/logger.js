// ========================================
// LOGGER
// ========================================
const niveis = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
};
// ========================================
// CORES
// ========================================
const cores = {
    reset: "\x1b[0m",

    debug: "\x1b[90m", // Cinza
    info: "\x1b[32m",  // Verde
    warn: "\x1b[33m",  // Amarelo
    error: "\x1b[31m"  // Vermelho
};
// ========================================
// NÍVEL ATUAL
// ========================================
const nivelAtual = (
    process.env.LOG_LEVEL || "info"
).toLowerCase();

const nivelMinimo =
    niveis[nivelAtual] ?? niveis.info;
// ========================================
// FORMATAR DATA
// ========================================
function obterData() {
    return new Date().toLocaleString("pt-BR");
}
// ========================================
// LOGGER
// ========================================
function log(nivel, mensagem, dados = null) {

    if (niveis[nivel] < nivelMinimo) {
        return;
    }

    const cor =
        cores[nivel] || cores.reset;

    const prefixo =
        `[${obterData()}] [${nivel.toUpperCase()}]`;

    const mensagemFormatada =
        `${cor}${prefixo} ${mensagem}${cores.reset}`;

    if (dados !== null) {
        console.log(
            mensagemFormatada,
            dados
        );

        return;
    }

    console.log(
        mensagemFormatada
    );
}
// ========================================
// EXPORTAR
// ========================================
module.exports = {

    debug: (mensagem, dados) =>
        log("debug", mensagem, dados),

    info: (mensagem, dados) =>
        log("info", mensagem, dados),

    warn: (mensagem, dados) =>
        log("warn", mensagem, dados),

    error: (mensagem, dados) =>
        log("error", mensagem, dados)

};