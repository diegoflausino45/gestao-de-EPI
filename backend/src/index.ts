import express from "express";
import "dotenv/config";
import { prisma } from "./db/prisma";

// Controllers & Services
import { AuthController } from "./controllers/AuthController";
import { authMiddleware } from "./middlewares/authMiddleware";
import { criarEpi } from "./services/epi.service";
import {
  obterSaldoItem,
  listarSaldosDetalhados,
} from "./services/saldo.service";
import {
  listarItensEPNextsi,
  obterSaldosNextsi,
  checkConnection as checkNextsi,
  closePool,
} from "./services/epi-nextsi.service";

const app = express();
const authController = new AuthController();

// ✅ Configuração de CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(express.json());

// =========================================
// 🔐 ROTAS DE AUTENTICAÇÃO
// =========================================

/**
 * @route POST /api/auth/login
 * @desc Autentica usuário e retorna JWT
 */
app.post("/api/auth/login", authController.login);

/**
 * @route POST /api/auth/register
 * @desc Cria novo usuário (Uso interno/Admin)
 */
app.post("/api/auth/register", authController.register);

/**
 * @route PUT /api/users/profile
 * @desc Atualiza dados do usuário logado
 */
app.put("/api/users/profile", authMiddleware, authController.updateProfile);

/**
 * @route PATCH /api/users/password
 * @desc Altera senha do usuário logado
 */
app.patch("/api/users/password", authMiddleware, authController.updatePassword);

// =========================================
// 📦 ROTAS DE EPIs (INTEGRAÇÃO ERP)
// =========================================

/**
 * @route GET /api/epis
 * @desc Lista todos os EPIs do ERP (G01) combinados com saldo atual (E01)
 */
app.get("/api/epis", async (_req, res, next) => {
  try {
    console.log("🔍 [API] Buscando itens EP do NEXTSI_HOMOLOG...");
    const epis = await listarItensEPNextsi();
    
    // Se não houver itens, retorna array vazio
    if (!epis || epis.length === 0) {
      return res.json([]);
    }

    // Extrair códigos para buscar saldos em lote
    const codigos = epis.map((e: any) => e.G01_CODIGO);
    
    // Buscar saldos
    const saldosDb = await obterSaldosNextsi(codigos);
    
    // Mapear saldos para acesso rápido (Hash Map)
    const saldosMap = Object.fromEntries(
      saldosDb.map((s: any) => [s.E01_ITEM, s.SaldoTotal])
    );

    // Combinar dados: Itens G01 + Saldos E01
    const epicsComSaldo = epis.map((e: any) => ({
      id: e.G01_ID,
      codigo: e.G01_CODIGO,
      nome: e.G01_DESCRICAO,
      tipo: e.G01_TIPO,
      descricao: e.G01_DESCRICAO,
      grupoItem: e.G01_GRUPOITEM,
      um: e.G01_UM,
      fabricante: e.G01_FABRICANTE,
      dataNascimento: e.G01_DTNASC,
      observacoes: e.G01_OBSERVACOES,
      estoqueAtual: saldosMap[e.G01_CODIGO] ?? 0,
      status: (saldosMap[e.G01_CODIGO] ?? 0) <= 0 ? "CRÍTICO" : "OK",
    }));

    console.log(`✅ [API] Retornando ${epicsComSaldo.length} EPIs com saldos`);
    return res.json(epicsComSaldo);

  } catch (err) {
    // Passa erro para o handler central (não usa mais mock)
    next(err);
  }
});

/**
 * @route POST /api/epis
 * @desc Registra um EPI manualmente (Banco Local)
 */
app.post("/api/epis", async (req, res, next) => {
  try {
    const novo = await criarEpi(req.body);
    res.status(201).json(novo);
  } catch (err) {
    next(err);
  }
});

// =========================================
// 💰 ROTAS DE SALDOS
// =========================================

/**
 * @route GET /api/itens/:codigo/saldo-erp
 * @desc Retorna o saldo total de um item específico
 */
app.get("/api/itens/:codigo/saldo-erp", async (req, res, next) => {
  try {
    const codigo = req.params.codigo;
    const saldo = await obterSaldoItem(codigo);
    res.json({ codigo, saldo });
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /api/itens/:codigo/saldo-erp/detalhe
 * @desc Retorna detalhes do saldo (lote, local, série)
 */
app.get("/api/itens/:codigo/saldo-erp/detalhe", async (req, res, next) => {
  try {
    const codigo = req.params.codigo;
    const dados = await listarSaldosDetalhados(codigo);
    res.json({ codigo, dados });
  } catch (err) {
    next(err);
  }
});

/**
 * @route POST /api/itens/saldos-erp
 * @desc Busca saldos em lote para uma lista de códigos
 * @body { codigos: string[] }
 */
app.post("/api/itens/saldos-erp", async (req, res, next) => {
  try {
    const { codigos } = req.body as { codigos: string[] };
    
    if (!Array.isArray(codigos) || codigos.length === 0) {
      return res
        .status(400)
        .json({ message: 'Informe um array "codigos" com ao menos 1 item.' });
    }
    
    // Busca direta no ERP
    const saldosDb = await obterSaldosNextsi(codigos);
    
    const saldos = saldosDb.map((s: any) => ({
      codigo: s.E01_ITEM,
      saldo: s.SaldoTotal || 0,
    }));
    
    return res.json({ saldos });
  } catch (err) {
    next(err);
  }
});

// =========================================
// 🩺 HEALTH CHECK & SYSTEM
// =========================================

/**
 * @route GET /health
 * @desc Verifica status do Banco Local e ERP
 */
app.get("/health", async (_req, res) => {
  // 1. Checagem Local (Prisma)
  let localDb = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    localDb = true;
  } catch (e) {
    console.error("Health Check Falha Local:", e);
  }

  // 2. Checagem ERP (Native Driver)
  const erpDb = await checkNextsi();

  const status = localDb && erpDb ? "ok" : "degraded";

  res.status(status === "ok" ? 200 : 503).json({
    status,
    timestamp: new Date().toISOString(),
    services: {
      database_local: localDb ? "up" : "down",
      database_erp: erpDb ? "up" : "down",
    },
  });
});

// Error Handler Centralizado
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

const PORT = process.env.PORT ?? 4000;
const server = app.listen(PORT, () => console.log(`API EPI rodando na porta ${PORT}`));

// Graceful Shutdown
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