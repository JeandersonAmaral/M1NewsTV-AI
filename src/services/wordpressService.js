const WORDPRESS_URL = process.env.WORDPRESS_URL;
const WORDPRESS_USER = process.env.WORDPRESS_USER;
const WORDPRESS_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD;

// ========================================
// AUTENTICAÇÃO
// ========================================

function getAuthHeader() {
    const credentials =
        `${WORDPRESS_USER}:${WORDPRESS_APP_PASSWORD}`;

    return (
        "Basic " +
        Buffer
            .from(credentials)
            .toString("base64")
    );
}

// ========================================
// BUSCAR OU CRIAR TAG
// ========================================

async function obterOuCriarTag(nome) {

    const headers = {
        "Content-Type": "application/json",
        "Authorization": getAuthHeader()
    };

    const nomeLimpo = nome.trim();

    // ------------------------------------
    // 1. BUSCAR PELO NOME
    // ------------------------------------

    const busca = await fetch(
        `${WORDPRESS_URL}/wp-json/wp/v2/tags?search=${encodeURIComponent(nomeLimpo)}&per_page=100`,
        {
            method: "GET",
            headers
        }
    );

    if (!busca.ok) {
        throw new Error(
            "Não foi possível buscar a tag: " +
            nomeLimpo
        );
    }

    const tags = await busca.json();

    let tagExistente = tags.find(
        tag =>
            tag.name.toLowerCase() ===
            nomeLimpo.toLowerCase()
    );

    if (tagExistente) {
        return tagExistente.id;
    }

    // ------------------------------------
    // 2. GERAR SLUG
    // ------------------------------------

    const slug = nomeLimpo
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");

    // ------------------------------------
    // 3. BUSCAR PELO SLUG
    // ------------------------------------

    const buscaSlug = await fetch(
        `${WORDPRESS_URL}/wp-json/wp/v2/tags?slug=${encodeURIComponent(slug)}`,
        {
            method: "GET",
            headers
        }
    );

    if (buscaSlug.ok) {

        const tagsSlug = await buscaSlug.json();

        if (tagsSlug.length > 0) {
            return tagsSlug[0].id;
        }
    }

    // ------------------------------------
    // 4. CRIAR TAG
    // ------------------------------------

    const novaTag = await fetch(
        `${WORDPRESS_URL}/wp-json/wp/v2/tags`,
        {
            method: "POST",
            headers,
            body: JSON.stringify({
                name: nomeLimpo,
                slug
            })
        }
    );

    const data = await novaTag.json();

    // ------------------------------------
    // 5. SE JÁ EXISTIR, BUSCAR NOVAMENTE
    // ------------------------------------

    if (!novaTag.ok) {

        // WordPress pode informar que
        // o termo já existe.

        if (
            data.code === "term_exists" &&
            data.data &&
            data.data.term_id
        ) {
            return data.data.term_id;
        }

        throw new Error(
            data.message ||
            `Não foi possível criar a tag: ${nomeLimpo}`
        );
    }

    return data.id;
}

// ========================================
// BUSCAR CATEGORIA
// ========================================

async function obterCategoria(nome) {

    const response = await fetch(
        `${WORDPRESS_URL}/wp-json/wp/v2/categories?search=${encodeURIComponent(nome)}&per_page=100`,
        {
            method: "GET",
            headers: {
                "Authorization": getAuthHeader()
            }
        }
    );

    if (!response.ok) {
        throw new Error(
            "Não foi possível buscar a categoria: " +
            nome
        );
    }

    const categorias = await response.json();

    const categoria = categorias.find(
        item =>
            item.name.toLowerCase() ===
            nome.toLowerCase()
    );

    if (!categoria) {

        console.warn(
            `Categoria não encontrada no WordPress: ${nome}`
        );

        return null;
    }

    return categoria.id;
}

// ========================================
// CRIAR RASCUNHO
// ========================================

async function criarRascunho(materia) {

    const headers = {
        "Content-Type": "application/json",
        "Authorization": getAuthHeader()
    };

    // ========================================
    // TAGS
    // ========================================

    const tagIds = [];

    if (Array.isArray(materia.tags)) {

        for (const tag of materia.tags) {

            if (!tag || !tag.trim()) {
                continue;
            }

            const id = await obterOuCriarTag(
                tag.trim()
            );

            tagIds.push(id);
        }
    }

    // ========================================
    // CATEGORIAS
    // ========================================

    const categoriaIds = [];

    if (Array.isArray(materia.categorias)) {

        for (const categoria of materia.categorias) {

            if (!categoria || !categoria.trim()) {
                continue;
            }

            const id = await obterCategoria(
                categoria.trim()
            );

            if (id) {
                categoriaIds.push(id);
            }
        }
    }

    // ========================================
    // DADOS DO POST
    // ========================================

    const postData = {

        title: materia.titulo,

        content: materia.conteudo,

        excerpt: materia.descricao || "",

        slug: materia.slug || "",

        status: "draft",

        // ====================================
        // YOAST SEO
        // ====================================

        meta: {

            _yoast_wpseo_focuskw:
                materia.frase_chave || "",

            _yoast_wpseo_metadesc:
                materia.meta_descricao || ""

        }
    };

    // ========================================
    // TAGS
    // ========================================

    if (tagIds.length > 0) {
        postData.tags = tagIds;
    }

    // ========================================
    // CATEGORIAS
    // ========================================

    if (categoriaIds.length > 0) {
        postData.categories = categoriaIds;
    }

    // ========================================
    // ENVIAR PARA WORDPRESS
    // ========================================

    console.log(
        "Enviando post para WordPress..."
    );

    console.log(
        "Frase-chave:",
        materia.frase_chave
    );

    console.log(
        "Meta descrição:",
        materia.meta_descricao
    );

    const response = await fetch(
        `${WORDPRESS_URL}/wp-json/wp/v2/posts`,
        {
            method: "POST",
            headers,
            body: JSON.stringify(postData)
        }
    );

    const data = await response.json();

    // ========================================
    // ERRO
    // ========================================

    if (!response.ok) {

        console.error(
            "Resposta do WordPress:",
            data
        );

        throw new Error(
            data.message ||
            "Não foi possível criar o rascunho no WordPress."
        );
    }

    // ========================================
    // SUCESSO
    // ========================================

    console.log(
        "Rascunho criado com sucesso!"
    );

    console.log(
        "ID:",
        data.id
    );

    console.log(
        "Link:",
        data.link
    );

    return data;
}

// ========================================
// EXPORTAR
// ========================================

module.exports = {
    criarRascunho
};