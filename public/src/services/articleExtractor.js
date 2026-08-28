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

    // ========================================
    // FUNÇÃO AUXILIAR PARA VALIDAR IMAGEM
    // ========================================

    function imagemValida(src) {

        if (!src) {

            return false;

        }

        const valor = src.trim().toLowerCase();

        // Ignorar placeholders, logos e imagens genéricas
        const imagensIgnoradas = [

            "loading_v2.gif",

            "loading.gif",

            "ebc.png",

            "ebc.gif",

            "placeholder",

            "spacer.gif",

            "transparent.gif"

        ];

        return !imagensIgnoradas.some(

            nome => valor.includes(nome)

        );

    }

    // ========================================
    // FUNÇÃO AUXILIAR PARA PEGAR URL DA IMG
    // ========================================

    function obterSrcImagem(img) {

        if (!img) {

            return null;

        }

        // ========================================
        // ATRIBUTOS COM POSSÍVEL URL REAL
        // ========================================

        const atributos = [

            "data-src",

            "data-lazy-src",

            "data-original",

            "data-image",

            "data-url",

            "data-filename",

            "src"

        ];

        for (const atributo of atributos) {

            const src = img.getAttribute(atributo);

            if (imagemValida(src)) {

                return src;

            }

        }

        // ========================================
        // SRCSET
        // ========================================

        const srcset =

            img.getAttribute("srcset") ||

            img.getAttribute("data-srcset");

        if (srcset) {

            const fontes = srcset

                .split(",")

                .map(item => item.trim())

                .filter(Boolean);

            // Pegar a maior imagem disponível
            for (let i = fontes.length - 1; i >= 0; i--) {

                const partes =

                    fontes[i].split(/\s+/);

                const possivelSrc = partes[0];

                if (imagemValida(possivelSrc)) {

                    return possivelSrc;

                }

            }

        }

        return null;

    }

    // ========================================
    // 1. PRIORIZAR CAPA DA MATÉRIA
    // ========================================

    const capa =

        dom.window.document.querySelector(

            ".capa-materia"

        );

    if (capa) {

        // ========================================
        // PROCURAR <source> PRIMEIRO
        // ========================================

        const sources =

            capa.querySelectorAll("source");

        for (const source of sources) {

            const srcset =

                source.getAttribute("srcset") ||

                source.getAttribute("data-srcset");

            if (!srcset) {

                continue;

            }

            const fontes = srcset

                .split(",")

                .map(item => item.trim())

                .filter(Boolean);

            for (let i = fontes.length - 1; i >= 0; i--) {

                const partes =

                    fontes[i].split(/\s+/);

                const src = partes[0];

                if (!imagemValida(src)) {

                    continue;

                }

                try {

                    imagem =

                        new URL(src, url).href;

                    logger.info(

                        "Imagem da capa encontrada no <source>:",

                        imagem

                    );

                    break;

                } catch (error) {

                    continue;

                }

            }

            if (imagem) {

                break;

            }

        }

        // ========================================
        // PROCURAR <img> DENTRO DA CAPA
        // ========================================

        if (!imagem) {

            const imagensCapa =

                capa.querySelectorAll("img");

            for (const img of imagensCapa) {

                const srcCapa =

                    obterSrcImagem(img);

                if (!srcCapa) {

                    continue;

                }

                try {

                    imagem =

                        new URL(srcCapa, url).href;

                    logger.info(

                        "Imagem da capa encontrada:",

                        imagem

                    );

                    break;

                } catch (error) {

                    logger.warn(

                        "URL da capa inválida:",

                        srcCapa

                    );

                }

            }

        }

    }

    // ========================================
    // 2. PROCURAR OUTRAS VARIAÇÕES DA CAPA
    // ========================================

    if (!imagem) {

        const seletoresCapa = [

            ".capa-materia figure img",

            ".capa-materia picture img",

            ".capa-materia source",

            "figure.capa-materia img",

            "[class*='capa-materia'] img",

            "[class*='capa-materia'] picture img"

        ];

        for (const seletor of seletoresCapa) {

            const elemento =

                dom.window.document.querySelector(seletor);

            if (!elemento) {

                continue;

            }

            let src = null;

            if (

                elemento.tagName &&

                elemento.tagName.toLowerCase() === "source"

            ) {

                src =

                    elemento.getAttribute("srcset") ||

                    elemento.getAttribute("data-srcset");

            } else {

                src =

                    obterSrcImagem(elemento);

            }

            if (!src) {

                continue;

            }

            // Se vier srcset, pegar a maior URL
            if (src.includes(",")) {

                const fontes = src

                    .split(",")

                    .map(item => item.trim())

                    .filter(Boolean);

                for (let i = fontes.length - 1; i >= 0; i--) {

                    const possivelSrc =

                        fontes[i].split(/\s+/)[0];

                    if (imagemValida(possivelSrc)) {

                        src = possivelSrc;

                        break;

                    }

                }

            }

            if (!imagemValida(src)) {

                continue;

            }

            try {

                imagem = new URL(src, url).href;

                logger.info(

                    "Imagem da capa encontrada pelo seletor alternativo:",

                    imagem

                );

                break;

            } catch (error) {

                continue;

            }

        }

    }

    // ========================================
    // READABILITY
    // ========================================

    const reader = new Readability(

        dom.window.document

    );

    const article = reader.parse();

    if (!article) {

        throw new Error(

            "Não foi possível identificar o conteúdo principal da matéria."

        );

    }

    // ========================================
    // 3. IMAGEM NO CONTEÚDO
    // SOMENTE SE NÃO ACHOU A CAPA
    // ========================================

    if (!imagem && article.content) {

        const articleDom = new JSDOM(

            article.content,

            {

                url

            }

        );

        const imagens =

            articleDom.window.document.querySelectorAll(

                "img"

            );

        for (const img of imagens) {

            let src = obterSrcImagem(img);

            if (!src) {

                continue;

            }

            try {

                src = new URL(src, url).href;

            } catch (error) {

                continue;

            }

            // Ignorar imagens pequenas
            const largura = parseInt(

                img.getAttribute("width")

            );

            const altura = parseInt(

                img.getAttribute("height")

            );

            if (

                largura &&

                altura &&

                largura < 500

            ) {

                continue;

            }

            if (!imagemValida(src)) {

                continue;

            }

            imagem = src;

            logger.info(

                "Imagem encontrada no conteúdo:",

                imagem

            );

            break;

        }

    }

    // ========================================
    // 4. OPEN GRAPH
    // ========================================

    if (!imagem) {

        const ogImage =

            dom.window.document.querySelector(

                'meta[property="og:image"]'

            );

        if (ogImage) {

            const src =

                ogImage.getAttribute("content");

            if (imagemValida(src)) {

                try {

                    imagem =

                        new URL(src, url).href;

                    logger.info(

                        "Imagem encontrada no Open Graph:",

                        imagem

                    );

                } catch (error) {

                    imagem = null;

                }

            }

        }

    }

    // ========================================
    // 5. TWITTER CARD
    // ========================================

    if (!imagem) {

        const twitterImage =

            dom.window.document.querySelector(

                'meta[name="twitter:image"]'

            );

        if (twitterImage) {

            const src =

                twitterImage.getAttribute("content");

            if (imagemValida(src)) {

                try {

                    imagem =

                        new URL(src, url).href;

                    logger.info(

                        "Imagem encontrada no Twitter Card:",

                        imagem

                    );

                } catch (error) {

                    imagem = null;

                }

            }

        }

    }

    // ========================================
    // TRANSFORMAR URL DA IMAGEM EM ABSOLUTA
    // ========================================

    if (imagem) {

        try {

            imagem =

                new URL(imagem, url).href;

        } catch (error) {

            logger.warn(

                "Não foi possível transformar a URL da imagem:",

                imagem

            );

            imagem = null;

        }

    }

    // ========================================
    // LOG FINAL
    // ========================================

    logger.info(

        "Imagem encontrada:",

        imagem

    );

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

