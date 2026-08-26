const WORDPRESS_URL = process.env.WORDPRESS_URL;
const WORDPRESS_USER = process.env.WORDPRESS_USER;
const WORDPRESS_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD;

const sharp = require("sharp");

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
// HEADERS JSON
// ========================================

function getJsonHeaders() {

    return {
        "Content-Type": "application/json",
        "Authorization": getAuthHeader()
    };
}

// ========================================
// BUSCAR OU CRIAR TAG
// ========================================

async function obterOuCriarTag(nome) {

    const headers = getJsonHeaders();

    const nomeLimpo = nome.trim();

    if (!nomeLimpo) {
        return null;
    }

    // ========================================
    // 1. BUSCAR PELO NOME
    // ========================================

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

    const tagExistente = tags.find(
        tag =>
            tag.name.toLowerCase() ===
            nomeLimpo.toLowerCase()
    );

    if (tagExistente) {
        return tagExistente.id;
    }

    // ========================================
    // 2. GERAR SLUG
    // ========================================

    const slug = nomeLimpo
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");

    // ========================================
    // 3. BUSCAR PELO SLUG
    // ========================================

    const buscaSlug = await fetch(
        `${WORDPRESS_URL}/wp-json/wp/v2/tags?slug=${encodeURIComponent(slug)}`,
        {
            method: "GET",
            headers
        }
    );

    if (buscaSlug.ok) {

        const tagsSlug =
            await buscaSlug.json();

        if (tagsSlug.length > 0) {
            return tagsSlug[0].id;
        }

    }

    // ========================================
    // 4. CRIAR TAG
    // ========================================

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

    const data =
        await novaTag.json();

    // ========================================
    // 5. TAG JÁ EXISTENTE
    // ========================================

    if (!novaTag.ok) {

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
                "Authorization":
                    getAuthHeader()
            }
        }
    );

    if (!response.ok) {

        throw new Error(
            "Não foi possível buscar a categoria: " +
            nome
        );

    }

    const categorias =
        await response.json();

    const categoria =
        categorias.find(
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
// BAIXAR IMAGEM DA MATÉRIA
// ========================================

async function baixarImagem(url) {

    if (!url) {
        return null;
    }

    console.log(
        "Baixando imagem:",
        url
    );

    try {

        const response =
            await fetch(url);

        if (!response.ok) {

            console.warn(
                "Não foi possível baixar a imagem. Status:",
                response.status
            );

            return null;
        }

        const arrayBuffer =
            await response.arrayBuffer();

        const buffer =
            Buffer.from(arrayBuffer);

        const contentType =
            response.headers.get("content-type") ||
            "image/jpeg";

        // ========================================
        // WEBP
        // ========================================
        // Se já for WebP, NÃO ALTERA A IMAGEM.
        // Mantém o buffer original.
        // ========================================

        if (
            contentType.toLowerCase().includes("image/webp")
        ) {

            console.log(
                "Imagem já está em WebP."
            );

            console.log(
                "Imagem WebP original será enviada sem alterações."
            );

            return {
                buffer,
                contentType: "image/webp",
                extensao: "webp",
                processada: false
            };
        }

        // ========================================
        // OUTROS FORMATOS
        // ========================================
        // Converte para WebP e redimensiona
        // para 1080px de largura mantendo
        // a proporção.
        // ========================================

        console.log(
            "Imagem não é WebP."
        );

        console.log(
            "Convertendo e redimensionando para 1080px de largura..."
        );

        const imagemProcessada =
            await sharp(buffer)
                .resize({
                    width: 1080,
                    height: undefined,
                    fit: "inside",
                    withoutEnlargement: false
                })
                .webp({
                    quality: 85
                })
                .toBuffer();

        // ========================================
        // VERIFICAR DIMENSÕES FINAIS
        // ========================================

        const metadata =
            await sharp(imagemProcessada)
                .metadata();

        console.log(
            "Dimensões finais:",
            `${metadata.width}x${metadata.height}`
        );

        console.log(
            "Formato final: WebP"
        );

        return {
            buffer: imagemProcessada,
            contentType: "image/webp",
            extensao: "webp",
            processada: true,
            largura: metadata.width,
            altura: metadata.height
        };

    } catch (error) {

        console.error(
            "Erro ao baixar/processar imagem:",
            error
        );

        return null;
    }
}

// ========================================
// ENVIAR IMAGEM PARA WORDPRESS
// ========================================

async function enviarImagemParaWordPress(
    imagemUrl,
    titulo,
    tags,
    altTexto
) {

    if (!imagemUrl) {

        console.log(
            "Nenhuma imagem para enviar."
        );

        return null;
    }

    const imagem =
        await baixarImagem(imagemUrl);

    if (!imagem) {
        return null;
    }

    // ========================================
    // DIAGNÓSTICO DO ARQUIVO
    // ========================================

    console.log(
        "Content-Type da imagem:",
        imagem.contentType
    );

    console.log(
        "Extensão da imagem:",
        imagem.extensao
    );

    console.log(
        "Tamanho da imagem:",
        imagem.buffer.length,
        "bytes"
    );

    if (imagem.largura && imagem.altura) {

        console.log(
            "Dimensões da imagem:",
            `${imagem.largura}x${imagem.altura}`
        );

    }

    // ========================================
    // GERAR TEXTO DAS TAGS
    // ========================================

    const tagsTexto =
        Array.isArray(tags)
            ? tags
                .filter(
                    tag =>
                        tag &&
                        typeof tag === "string" &&
                        tag.trim()
                )
                .map(
                    tag =>
                        tag.trim()
                )
                .join(", ")
            : "";

    // ========================================
    // GERAR NOME DO ARQUIVO
    // ========================================

    const nomeArquivo =
        (titulo || "imagem-materia")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-")
            .substring(0, 80);

    const filename =
        `${nomeArquivo || "imagem-materia"}.${imagem.extensao}`;

    console.log(
        "Nome do arquivo:",
        filename
    );

    console.log(
        "Enviando imagem para WordPress:",
        filename
    );

    // ========================================
    // ENVIAR ARQUIVO
    // ========================================

    const response = await fetch(
        `${WORDPRESS_URL}/wp-json/wp/v2/media`,
        {
            method: "POST",

            headers: {

                "Authorization":
                    getAuthHeader(),

                "Content-Type":
                    imagem.contentType,

                "Content-Disposition":
                    `attachment; filename="${filename}"`
            },

            body: imagem.buffer
        }
    );

    // ========================================
    // LER RESPOSTA
    // ========================================

    const responseText =
        await response.text();

    let data;

    try {

        data =
            JSON.parse(responseText);

    } catch (error) {

        console.error(
            "WordPress não retornou JSON ao enviar a imagem."
        );

        console.error(
            "Status HTTP:",
            response.status
        );

        console.error(
            "Content-Type:",
            response.headers.get("content-type") || ""
        );

        console.error(
            "Resposta recebida:",
            responseText.substring(0, 500)
        );

        throw new Error(
            `WordPress retornou uma resposta inválida ao enviar a imagem. Status: ${response.status}`
        );

    }

    // ========================================
    // ERRO NO UPLOAD
    // ========================================

    if (!response.ok) {

        console.error(
            "Erro ao enviar imagem:",
            data
        );

        throw new Error(
            data.message ||
            "Não foi possível enviar a imagem para o WordPress."
        );

    }

    console.log(
        "Imagem enviada com sucesso!"
    );

    console.log(
        "ID da imagem:",
        data.id
    );

    // ========================================
    // ATUALIZAR METADADOS DA IMAGEM
    // ========================================

    // TÍTULO, LEGENDA E DESCRIÇÃO = TAGS
    // ALT = TEXTO GERADO PELA IA

    // ========================================

    console.log(
        "Atualizando metadados da imagem..."
    );

    console.log(
        "Tags utilizadas na imagem:",
        tagsTexto
    );

    console.log(
        "ALT gerado pela IA:",
        altTexto
    );

    const metadados = {

        title:
            tagsTexto || "Imagem da matéria",

        alt_text:
            altTexto || "Imagem da matéria",

        caption:
            tagsTexto || "",

        description:
            tagsTexto || ""
    };

    const atualizar = await fetch(
        `${WORDPRESS_URL}/wp-json/wp/v2/media/${data.id}`,
        {
            method: "POST",

            headers:
                getJsonHeaders(),

            body:
                JSON.stringify(metadados)
        }
    );

    // ========================================
    // LER RESPOSTA DOS METADADOS
    // ========================================

    const atualizarText =
        await atualizar.text();

    let imagemAtualizada;

    try {

        imagemAtualizada =
            JSON.parse(atualizarText);

    } catch (error) {

        console.error(
            "WordPress retornou JSON inválido ao atualizar os metadados."
        );

        console.error(
            "Status HTTP:",
            atualizar.status
        );

        console.error(
            "Resposta:",
            atualizarText.substring(0, 500)
        );

        throw new Error(
            `WordPress retornou uma resposta inválida ao atualizar os metadados. Status: ${atualizar.status}`
        );

    }

    if (!atualizar.ok) {

        console.error(
            "Erro ao atualizar metadados da imagem:",
            imagemAtualizada
        );

        throw new Error(
            imagemAtualizada?.message ||
            "A imagem foi enviada, mas não foi possível atualizar seus metadados."
        );

    }

    console.log(
        "Metadados da imagem atualizados!"
    );

    console.log(
        "Título:",
        tagsTexto
    );

    console.log(
        "ALT:",
        altTexto
    );

    console.log(
        "Legenda:",
        tagsTexto
    );

    console.log(
        "Descrição:",
        tagsTexto
    );

    return imagemAtualizada;
}

// ========================================
// CRIAR RASCUNHO
// ========================================

async function criarRascunho(materia) {

    const headers =
        getJsonHeaders();

    console.log(
        "========================================"
    );

    console.log(
        "Preparando rascunho..."
    );

    console.log(
        "Título:",
        materia.titulo
    );

    console.log(
        "Imagem:",
        materia.imagem
    );

    // ========================================
    // TAGS
    // ========================================

    const tagIds = [];

    if (Array.isArray(materia.tags)) {

        for (const tag of materia.tags) {

            if (!tag || !tag.trim()) {
                continue;
            }

            const id =
                await obterOuCriarTag(
                    tag.trim()
                );

            if (id) {
                tagIds.push(id);
            }

        }
    }

    // ========================================
    // CATEGORIAS
    // ========================================

    const categoriaIds = [];

    if (Array.isArray(materia.categorias)) {

        for (
            const categoria
            of materia.categorias
        ) {

            if (
                !categoria ||
                !categoria.trim()
            ) {
                continue;
            }

            const id =
                await obterCategoria(
                    categoria.trim()
                );

            if (id) {
                categoriaIds.push(id);
            }
        }
    }

    // ========================================
    // IMAGEM DESTACADA
    // ========================================

    let imagemId = null;

    if (materia.imagem) {

        try {

            const imagemWordPress =
                await enviarImagemParaWordPress(
                    materia.imagem,
                    materia.titulo,
                    materia.tags,
                    materia.alt_text
                );

            if (imagemWordPress) {

                imagemId =
                    imagemWordPress.id;
            }

        } catch (error) {

            console.error(
                "Erro ao enviar imagem:",
                error.message
            );

            // Não interrompe a criação do post.
            // O rascunho ainda será criado.
        }
    }

    // ========================================
    // DADOS DO POST
    // ========================================

    const postData = {

        title:
            materia.titulo || "",

        content:
            materia.conteudo || "",

        excerpt:
            materia.descricao || "",

        slug:
            materia.slug || "",

        status:
            "draft",

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

        postData.tags =
            tagIds;
    }

    // ========================================
    // CATEGORIAS
    // ========================================

    if (categoriaIds.length > 0) {

        postData.categories =
            categoriaIds;
    }

    // ========================================
    // IMAGEM DESTACADA
    // ========================================

    if (imagemId) {

        postData.featured_media =
            imagemId;

        console.log(
            "Imagem destacada definida:",
            imagemId
        );
    }

    // ========================================
    // LOGS
    // ========================================

    console.log(
        "Tags:",
        tagIds
    );

    console.log(
        "Categorias:",
        categoriaIds
    );

    console.log(
        "Imagem destacada:",
        imagemId
    );

    console.log(
        "Frase-chave:",
        materia.frase_chave
    );

    console.log(
        "Meta descrição:",
        materia.meta_descricao
    );

    console.log(
        "ALT da imagem:",
        materia.alt_text
    );

    // ========================================
    // ENVIAR POST
    // ========================================

    console.log(
        "Enviando post para WordPress..."
    );

    const response = await fetch(
        `${WORDPRESS_URL}/wp-json/wp/v2/posts`,
        {
            method: "POST",

            headers,

            body:
                JSON.stringify(postData)
        }
    );

    const data =
        await response.json();

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
        "========================================"
    );

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

    console.log(
        "Imagem destacada:",
        imagemId
    );

    console.log(
        "========================================"
    );

    return data;
}

// ========================================
// EXPORTAR
// ========================================

module.exports = {
    criarRascunho
};
