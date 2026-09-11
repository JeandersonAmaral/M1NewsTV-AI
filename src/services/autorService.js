const AUTORES = {
    CRISTIANO: { id: 57, nome: "Cristiano Magalhães" },
    FRANCISCO: { id: 26, nome: "Francisco Carvalho" },
    JEANDERSON: { id: 48, nome: "Jeanderson Amaral" },
    GABRIELLA: { id: 27, nome: "Gabriella Carvalho" },
    AI: { id: 58, nome: "M1NewsTV AI" },
    M1NEWS: { id: 1, nome: "M1NewsTV" }
};

const AUTORES_PERMITIDOS = Object.values(AUTORES).map(autor => autor.id);

const AUTOR_PADRAO = AUTORES.AI.id;

module.exports = {
    AUTORES,
    AUTORES_PERMITIDOS,
    AUTOR_PADRAO
};