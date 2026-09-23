const express = require("express");

const {

    gerarMateria,

    regenerarCampo,

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
// REGENERAR CAMPO INDIVIDUAL
// ========================================

router.post(

    "/materias/regenerar",

    autenticar,

    regenerarCampo

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