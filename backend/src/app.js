import express from "express";
import cors from "cors"
import funcionariosRoutes from "./routes/funcionarios.routes.js";

const app = express();
app.use(cors())

app.get("/", (req, res) => {
  res.json({ status: "Servidor local rodando 🚀" })
})

app.use(express.json());

app.use("/funcionarios", funcionariosRoutes);

export default app;
