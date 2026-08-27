const mongoose = require("mongoose");

// ========================================
// CONECTAR AO MONGODB
// ========================================

async function conectarMongoDB() {
    try {
        await mongoose.connect(
            process.env.MONGODB_URI
        );

        console.log(
            "MongoDB conectado com sucesso."
        );
    } catch (error) {
        console.error(
            "Erro ao conectar ao MongoDB:",
            error.message
        );

        throw error;
    }
}

module.exports = {
    conectarMongoDB
};