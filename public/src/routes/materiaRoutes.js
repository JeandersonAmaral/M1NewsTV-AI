const express = require("express");

const {
    gerarMateria,
    criarRascunho,
    testarWordPress
} = require("../controllers/materiaController");

const autenticar = require("../middleware/authMiddleware");

const router = express.Router();

// ========================================
// GERAR MATÉRIA
// ========================================

router.post(
    "/materias",
    autenticar,
    gerarMateria
);

// ========================================
// ENVIAR MATÉRIA PARA RASCUNHO
// ========================================

router.post(
    "/materias/rascunho",
    autenticar,
    criarRascunho
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