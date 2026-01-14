// IMPORTS DE DEPENDÊNCIAS E CONFIGURAÇÕES
import "dotenv/config";
import express from "express"
import app from "./app.js";
import {closePool} from "./services/EpiERP.service.js";


// MIDDLEWARE GLOBAL DE TRATAMENTO DE ERROS
 app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("🔥 Unhandled Error:", err);
    res.status(err.statusCode || 500).json({
      message: err.message || "Internal Server Error",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
);

// INICIALIZAÇÃO DO SERVIDOR HTTP 
const PORT = process.env.PORT ?? 4000;
const server = app.listen(PORT, () =>
  console.log(`API EPI rodando na porta ${PORT}`)
);

// GRACEFUL SHUTDOWN ON SIGNALS 
process.on("SIGTERM", async () => {
  console.log("📡 SIGTERM recebido, encerrando gracefully...");
  await closePool();
  server.close(() => {
    console.log("✅ Servidor encerrado");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("📡 SIGINT recebido, encerrando gracefully...");
  await closePool();
  server.close(() => {
    console.log("✅ Servidor encerrado");
    process.exit(0);
  });
});


