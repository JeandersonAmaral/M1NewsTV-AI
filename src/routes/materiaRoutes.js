const express = require("express");

const {
    gerarMateria,
    criarRascunho,
    testarWordPress
} = require("../controllers/materiaController");

const router = express.Router();

// ========================================
// GERAR MATÉRIA
// ========================================

router.post(
    "/materias",
    gerarMateria
);

// ========================================
// ENVIAR MATÉRIA PARA RASCUNHO
// ========================================

router.post(
    "/materias/rascunho",
    criarRascunho
);

// ========================================
// TESTE WORDPRESS
// ========================================

router.get(
    "/teste-wordpress",
    testarWordPress
);

module.exports = router;

