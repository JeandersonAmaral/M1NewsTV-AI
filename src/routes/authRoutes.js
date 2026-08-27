const express = require("express");

const authController = require("../controllers/authController");

const router = express.Router();

// ========================================
// CADASTRAR USUÁRIO
// ========================================

router.post(
    "/register",
    authController.cadastrarUsuario
);

// ========================================
// LOGIN
// ========================================

router.post(
    "/login",
    authController.login
);

module.exports = router;