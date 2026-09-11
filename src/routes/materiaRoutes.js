const express = require("express");

const {

    gerarMateria,

    enviarMateria,

    testarWordPress,

    listarAutores

} = require("../controllers/materiaController");

const autenticar =
    require("../middleware/authMiddleware");

const router =
    express.Router();

// ========================================
// GERAR MATÉRIA
// ========================================

router.post(

    "/materias",

    autenticar,

    gerarMateria

);

// ========================================
// ENVIAR MATÉRIA
// ========================================

router.post(

    "/materias/rascunho",

    autenticar,

    enviarMateria

);

// ========================================
// AUTORES PERMITIDOS
// ========================================

router.get(

    "/autores",

    autenticar,

    listarAutores

);

// ========================================
// TESTE WORDPRESS
// ========================================

router.get(

    "/teste-wordpress",

    autenticar,

    testarWordPress

);

module.exports = router;
