const { JSDOM } = require("jsdom");
const { Readability } = require("@mozilla/readability");

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

    const reader = new Readability(dom.window.document);

    const article = reader.parse();

    if (!article) {
        throw new Error(
            "Não foi possível identificar o conteúdo principal da matéria."
        );
    }

    return {
        titulo: article.title,
        texto: article.textContent,
        html: article.content,
        url
    };
}

module.exports = {
    extrairMateria
};