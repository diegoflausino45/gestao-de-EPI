import express from "express";
import cors from "cors"
import funcionariosRoutes from "./routes/funcionarios.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import setoresRoutes from "./routes/setores.routes.js";
import tiposEpiRoutes from "./routes/tiposEpi.routes.js";
import episRoutes from "./routes/epis.routes.js";
import epiErpRoutes from "./routes/epiErp.routes.js";
import entregasRoutes from "./routes/entregas.routes.js";
import devolucoesRoutes from "./routes/devolucoes.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "Servidor local rodando 🚀" })
})

app.use("/funcionarios", funcionariosRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/setores", setoresRoutes);
app.use("/tipos-epi", tiposEpiRoutes);
app.use("/epis", episRoutes);
app.use("/epis-erp", epiErpRoutes);
app.use("/entregas", entregasRoutes);
app.use("/devolucoes", devolucoesRoutes);

export default app;
