const net = require("net");

function validarUrl(url) {
    if (!url || typeof url !== "string") {
        throw new Error("URL inválida.");
    }

    let parsed;

    try {
        parsed = new URL(url);
    } catch (error) {
        throw new Error("URL inválida.");
    }

    // ========================================
    // PROTOCOLO
    // ========================================

    if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error(
            "Apenas URLs HTTP e HTTPS são permitidas."
        );
    }

    // ========================================
    // HOSTNAME
    // ========================================

    const hostname = parsed.hostname
        .toLowerCase()
        .replace(/\.$/, "");

    if (!hostname) {
        throw new Error("URL sem domínio válido.");
    }

    // ========================================
    // LOCALHOST
    // ========================================

    if (
        hostname === "localhost" ||
        hostname.endsWith(".localhost")
    ) {
        throw new Error(
            "URLs para localhost não são permitidas."
        );
    }

    // ========================================
    // IP DIRETO
    // ========================================

    if (net.isIP(hostname)) {

        // IPv4
        if (net.isIPv4(hostname)) {

            const partes = hostname
                .split(".")
                .map(Number);

            const [a, b] = partes;

            // 127.0.0.0/8
            if (a === 127) {
                throw new Error(
                    "IPs internos não são permitidos."
                );
            }

            // 10.0.0.0/8
            if (a === 10) {
                throw new Error(
                    "IPs internos não são permitidos."
                );
            }

            // 172.16.0.0/12
            if (
                a === 172 &&
                b >= 16 &&
                b <= 31
            ) {
                throw new Error(
                    "IPs internos não são permitidos."
                );
            }

            // 192.168.0.0/16
            if (
                a === 192 &&
                b === 168
            ) {
                throw new Error(
                    "IPs internos não são permitidos."
                );
            }

            // 169.254.0.0/16
            if (
                a === 169 &&
                b === 254
            ) {
                throw new Error(
                    "IPs internos não são permitidos."
                );
            }

            // 0.0.0.0/8
            if (a === 0) {
                throw new Error(
                    "IPs internos não são permitidos."
                );
            }
        }

        // IPv6
        if (net.isIPv6(hostname)) {

            const ipv6 = hostname.toLowerCase();

            // ::1
            if (ipv6 === "::1") {
                throw new Error(
                    "IPs internos não são permitidos."
                );
            }

            // IPv6 link-local
            if (
                ipv6.startsWith("fe8") ||
                ipv6.startsWith("fe9") ||
                ipv6.startsWith("fea") ||
                ipv6.startsWith("feb")
            ) {
                throw new Error(
                    "IPs internos não são permitidos."
                );
            }

            // IPv6 privado/unique local
            if (ipv6.startsWith("fc") || ipv6.startsWith("fd")) {
                throw new Error(
                    "IPs internos não são permitidos."
                );
            }
        }
    }

    return parsed;
}

module.exports = {
    validarUrl
};