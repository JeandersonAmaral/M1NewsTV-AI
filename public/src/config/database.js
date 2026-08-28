const mongoose = require("mongoose");
const logger = require("../utils/logger");

// ========================================
// CONECTAR AO MONGODB
// ========================================

async function conectarMongoDB() {
    try {
        await mongoose.connect(
            process.env.MONGODB_URI
        );

        logger.info(
            "MongoDB conectado com sucesso."
        );
    } catch (error) {
        logger.error(
            "Erro ao conectar ao MongoDB:",
            error.message
        );

        throw error;
    }
}

module.exports = {
    conectarMongoDB
};