// src/app.ts
import express from "express";
import episRoutes from "./routes/epis.routes.js"
import healthRoutes from "./routes/health.routes.js"

const app = express();
app.use(express.json());
// CORS (pode ficar aqui)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.get("/", (req, res) => {
  res.json({ status: "Servidor local rodando 🚀" })
})

//Rotas
app.use("/epis", episRoutes)
app.use("/health", healthRoutes)

export default app;
