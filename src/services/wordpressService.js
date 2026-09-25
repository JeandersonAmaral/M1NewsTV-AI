const WORDPRESS_URL = process.env.WORDPRESS_URL;
const WORDPRESS_USER = process.env.WORDPRESS_USER;
const WORDPRESS_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD;

const sharp = require("sharp");
const logger = require("../utils/logger");

const {
    AUTORES_PERMITIDOS,
    AUTOR_PADRAO
} = require("./autorService");

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
// BUSCAR AUTORES PERMITIDOS
// ========================================

async function obterAutoresPermitidos() {

    const headers =
        getJsonHeaders();

    const idsPermitidos =
        AUTORES_PERMITIDOS.join(",");

    const response = await fetch(
        `${WORDPRESS_URL}/wp-json/wp/v2/users?include=${idsPermitidos}&per_page=100`,
        {
            method: "GET",
            headers
        }
    );

    if (!response.ok) {

        const erro =
            await response.text();

        logger.error(
            "Erro ao buscar autores no WordPress:",
            erro
        );

        throw new Error(
            "Não foi possível buscar os autores no WordPress."
        );
    }

    const usuarios =
        await response.json();

    const autores =
        AUTORES_PERMITIDOS
            .map(id =>
                usuarios.find(
                    usuario =>
                        usuario.id === id
                )
            )
            .filter(Boolean)
            .map(usuario => ({
                id: usuario.id,
                name: usuario.name
            }));

    return autores;
}

// ========================================
// VALIDAR AUTOR
// ========================================

function validarAutor(autorId) {
    const id =
        Number(autorId);

    if (!Number.isInteger(id)) {
        throw new Error(
            "Autor inválido."
        );
    }

    if (!AUTORES_PERMITIDOS.includes(id)) {
        throw new Error(
            "O autor selecionado não está autorizado."
        );
    }

    return id;
}

// ========================================
// BUSCAR OU CRIAR TAG
// ========================================

async function obterOuCriarTag(nome) {

    const headers =
        getJsonHeaders();

    const nomeLimpo =
        nome.trim();

    if (!nomeLimpo) {
        return null;
    }

    // ========================================
    // BUSCAR PELO NOME
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

    const tags =
        await busca.json();

    const tagExistente =
        tags.find(
            tag =>
                tag.name.toLowerCase() ===
                nomeLimpo.toLowerCase()
        );

    if (tagExistente) {
        return tagExistente.id;
    }

    // ========================================
    // GERAR SLUG
    // ========================================

    const slug =
        nomeLimpo
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-");

    // ========================================
    // BUSCAR PELO SLUG
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
    // CRIAR TAG
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
    // TAG JÁ EXISTENTE
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

        logger.warn(
            `Categoria não encontrada no WordPress: ${nome}`
        );

        return null;
    }

    return categoria.id;
}

// ========================================
// BAIXAR E PROCESSAR IMAGEM
// ========================================

async function baixarImagem(url) {

    if (!url) {
        return null;
    }

    try {

        const response =
            await fetch(url);

        if (!response.ok) {

            logger.warn(
                `Não foi possível baixar a imagem. Status: ${response.status}`
            );

            return null;
        }

        const arrayBuffer =
            await response.arrayBuffer();

        const buffer =
            Buffer.from(arrayBuffer);

        const metadataOriginal =
            await sharp(buffer).metadata();

        if (
            !metadataOriginal.width ||
            !metadataOriginal.height
        ) {
            throw new Error(
                "Não foi possível identificar as dimensões da imagem."
            );
        }

        const imagemOrientada =
            sharp(buffer).rotate();

        const metadataOrientada =
            await imagemOrientada.metadata();

        if (
            !metadataOrientada.width ||
            !metadataOrientada.height
        ) {
            throw new Error(
                "Não foi possível identificar as dimensões da imagem orientada."
            );
        }

        const imagemProcessada =
            await imagemOrientada
                .resize({
                    width: 1080,
                    withoutEnlargement: false,
                    fit: "inside"
                })
                .webp({
                    quality: 90
                })
                .toBuffer();

        const metadataFinal =
            await sharp(imagemProcessada).metadata();

        logger.info(
            `Imagem processada: ${metadataOriginal.width}x${metadataOriginal.height} → ${metadataFinal.width}x${metadataFinal.height}`
        );

        return {
            buffer: imagemProcessada,
            contentType: "image/webp",
            extensao: "webp",
            processada: true,
            largura: metadataFinal.width,
            altura: metadataFinal.height
        };

    } catch (error) {

        logger.error(
            "Erro ao baixar/processar imagem:",
            error.message
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
    altTexto,
    tituloImagem,
    legendaImagem,
    descricaoImagem
) {

    if (!imagemUrl) {
        return null;
    }

    const imagem =
        await baixarImagem(imagemUrl);

    if (!imagem) {

        logger.error(
            "Não foi possível baixar/processar a imagem."
        );

        return null;
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

        logger.error(
            `WordPress retornou resposta inválida ao enviar a imagem. Status: ${response.status}`
        );

        throw new Error(
            `WordPress retornou uma resposta inválida ao enviar a imagem. Status: ${response.status}`
        );
    }

    // ========================================
    // ERRO NO UPLOAD
    // ========================================

    if (!response.ok) {

        logger.error(
            `WordPress recusou o upload da imagem. HTTP ${response.status}`
        );

        logger.error(
            "Resposta do WordPress:",
            data
        );

        throw new Error(
            data.message ||
            `WordPress recusou o upload da imagem. HTTP ${response.status}`
        );
    }

    logger.info(
        `Imagem enviada para o WordPress: ${filename} (ID ${data.id})`
    );

    // ========================================
    // ATUALIZAR METADADOS DA IMAGEM
    // ========================================

    const metadados = {

        title:
            tituloImagem !== undefined
                ? tituloImagem
                : (
                    tagsTexto ||
                    "Imagem da matéria"
                ),

        alt_text:
            altTexto !== undefined
                ? altTexto
                : "Imagem da matéria",

        caption:
            legendaImagem !== undefined
                ? legendaImagem
                : (
                    tagsTexto ||
                    ""
                ),

        description:
            descricaoImagem !== undefined
                ? descricaoImagem
                : (
                    tagsTexto ||
                    ""
                )
    };

    const atualizar =
        await fetch(
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

        logger.error(
            `WordPress retornou resposta inválida ao atualizar metadados. Status: ${atualizar.status}`
        );

        throw new Error(
            `WordPress retornou uma resposta inválida ao atualizar os metadados. Status: ${atualizar.status}`
        );
    }

    if (!atualizar.ok) {

        logger.error(
            "Erro ao atualizar metadados da imagem:",
            imagemAtualizada
        );

        throw new Error(
            imagemAtualizada?.message ||
            "A imagem foi enviada, mas não foi possível atualizar seus metadados."
        );
    }

    return imagemAtualizada;
}

// ========================================
// CRIAR MATÉRIA 
// ========================================

async function enviarMateriaParaWordPress(materia) {

    const headers =
        getJsonHeaders();

    const autorId =
        validarAutor(
            materia.autorId ?? AUTOR_PADRAO
        );

    const destino =
        materia.destino === "publish"
            ? "publish"
            : "draft";

    logger.info(
        destino === "publish"
            ? `Publicando post: ${materia.titulo}`
            : `Criando rascunho: ${materia.titulo}`
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
                    materia.alt_text,
                    materia.imagem_titulo,
                    materia.imagem_legenda,
                    materia.imagem_descricao
                );

            if (imagemWordPress) {

                imagemId =
                    imagemWordPress.id;

                logger.info(
                    `Imagem destacada enviada. ID: ${imagemId}`
                );
            }

        } catch (error) {

            logger.error(
                "Erro ao enviar imagem:",
                error.message
            );

            // O post continua sendo criado.
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
            destino,

        author:
            autorId,

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
    }

    // ========================================
    // ENVIAR POST
    // ========================================

    const response =
        await fetch(
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

        logger.error(
            destino === "publish"
                ? "WordPress recusou a publicação do post:"
                : "WordPress recusou a criação do rascunho:",
            data
        );

        throw new Error(
            data.message ||
            (
                destino === "publish"
                    ? "Não foi possível publicar o post no WordPress."
                    : "Não foi possível criar o rascunho no WordPress."
            )
        );
    }

    // ========================================
    // SUCESSO
    // ========================================

    logger.info(
        destino === "publish"
            ? `Post publicado com sucesso. ID ${data.id}`
            : `Rascunho criado com sucesso. ID ${data.id}`
    );

    return data;
}


// ========================================
// EXPORTAR
// ========================================

module.exports = {
    enviarMateriaParaWordPress,
    baixarImagem,
    obterAutoresPermitidos
};
