// IMPORTS DE DEPENDÊNCIAS E ROTAS
import express from "express";
import authRoutes from "./routes/auth.routes.js"
import episRoutes from "./routes/epis.routes.js"
import healthRoutes from "./routes/health.routes.js"

// CRIAÇÃO DO APP EXPRESS
const app = express();

// ✅ Middleware para parsear JSON
app.use(express.json());

// ✅ Configuração de CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ROTA RAIZ - Teste de funcionamento do servidor
app.get("/", (req, res) => {
  res.json({ status: "Servidor local rodando 🚀" })
})

// ROTAS DO APP 
app.use("/auth", authRoutes)
app.use("/epis", episRoutes)
app.use("/health", healthRoutes)

export default app;
