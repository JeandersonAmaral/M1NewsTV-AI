const { JSDOM } = require("jsdom");
const { Readability } = require("@mozilla/readability");
const logger = require("../utils/logger");

async function extrairMateria(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Não foi possível acessar a página. Status: ${response.status}`
        );
    }

    const html = await response.text();

    const dom = new JSDOM(html, {
        url
    });

    // ========================================
    // IDENTIFICAR IMAGEM PRINCIPAL
    // ========================================

    let imagem = null;

    // 1. Open Graph
    const ogImage = dom.window.document.querySelector(
        'meta[property="og:image"]'
    );

    if (ogImage) {
        imagem = ogImage.getAttribute("content");
    }

    // 2. Twitter Card
    if (!imagem) {
        const twitterImage = dom.window.document.querySelector(
            'meta[name="twitter:image"]'
        );

        if (twitterImage) {
            imagem = twitterImage.getAttribute("content");
        }
    }

    // ========================================
    // READABILITY
    // ========================================

    const reader = new Readability(dom.window.document);

    const article = reader.parse();

    if (!article) {
        throw new Error(
            "Não foi possível identificar o conteúdo principal da matéria."
        );
    }

    // ========================================
    // TENTAR ENCONTRAR IMAGEM NO CONTEÚDO
    // ========================================

    if (!imagem && article.content) {
        const articleDom = new JSDOM(article.content, {
            url
        });

        const primeiraImagem =
            articleDom.window.document.querySelector("img");

        if (primeiraImagem) {
            imagem = primeiraImagem.getAttribute("src");
        }
    }

    // ========================================
    // TRANSFORMAR URL DA IMAGEM EM ABSOLUTA
    // ========================================

    if (imagem) {
        try {
            imagem = new URL(imagem, url).href;
        } catch (error) {
            logger.warn(
                "Não foi possível transformar a URL da imagem:",
                imagem
            );

            imagem = null;
        }
    }

    logger.info("Imagem encontrada:", imagem);

    // ========================================
    // RETORNAR MATÉRIA
    // ========================================

    return {
        titulo: article.title,
        texto: article.textContent,
        html: article.content,
        imagem,
        url
    };
}

module.exports = {
    extrairMateria
};
