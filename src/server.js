require("dotenv").config();
const express = require("express");
const path = require("path");
const materiaRoutes = require("./routes/materiaRoutes");
const logger = require("./utils/logger");
const app = express();
const PORT = 3000;
// ========================================
// CONFIGURAÇÕES
// ========================================
app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "../public")
    )
);
// ========================================
// PÁGINA PRINCIPAL
// ========================================
app.get("/", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "../public/index.html"
        )
    );
});
// ========================================
// ROTAS
// ========================================
app.use(
    "/api",
    materiaRoutes
);
// ========================================
// INICIAR SERVIDOR
// ========================================
app.listen(
    PORT,
    () => {
        logger.info(
            `Servidor rodando em http://localhost:${PORT}`
        );
    }
);

