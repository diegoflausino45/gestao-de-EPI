// src/index.ts
import express from "express";
import "dotenv/config";

import { listarEpis, criarEpi } from "./services/epi.service";
import {
  obterSaldoItem,
  listarSaldosDetalhados,
  obterSaldosPorItens,
} from "./services/saldo.service";
import {
  listarItensEPNextsi,
  obterSaldosNextsi,
  obterSaldoDetalheNextsi,
  closePool,
} from "./services/epi-nextsi.service";

import { atualizarEstoqueMinimoNextsi } from "./services/epi-nextsi.service";

const app = express();

// ✅ CORS Configuration
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

// Mock data para teste (remover quando banco estiver configurado)
const epiMockData = [
  {
    id: 1,
    codigo: "080101.00010",
    nome: "MASCARA DE SOLDA ESAB A20",
    tipo: "Proteção Respiratória",
    descricao: "MASCARA DE SOLDA ESAB A20",
    CA: "67890",
    validadeCA: new Date("2027-06-30"),
    vidaUtilMeses: 24,
    fabricante: "Protec",
    estoqueMinimo: 5,
  },
  {
    id: 2,
    codigo: "080102.00020",
    nome: "ÓCULOS DE PROTEÇÃO",
    tipo: "Proteção Visual",
    descricao: "ÓCULOS DE PROTEÇÃO",
    CA: "11234",
    validadeCA: new Date("2025-07-10"),
    vidaUtilMeses: 36,
    fabricante: "3M",
    estoqueMinimo: 20,
  },
  {
    id: 3,
    codigo: "080103.00030",
    nome: "LUVA NITRÍLICA",
    tipo: "Proteção das Mãos",
    descricao: "LUVA NITRÍLICA",
    CA: "99887",
    validadeCA: new Date("2024-12-05"),
    vidaUtilMeses: 12,
    fabricante: "Latex",
    estoqueMinimo: 40,
  },
];

// Exemplo de rotas já existentes
app.get("/api/epis", async (_req, res, next) => {
  try {
    // Tentar carregar do ERP (G01 - itens EP), se falhar, usar mock
    try {
      console.log("🔍 [API] Buscando itens EP do NEXTSI_HOMOLOG...");
      const epis = await listarItensEPNextsi();

      console.log(`✅ [API] Encontrados ${epis?.length || 0} itens EP`);

      // Se não houver itens, retornar mock
      if (!epis || epis.length === 0) {
        console.log("⚠️ Nenhum item EP encontrado no ERP, usando dados mock");
        return res.json(epiMockData);
      }

      // Extrair códigos dos itens (G01_CODIGO)
      const codigos = epis.map((e: any) => e.G01_CODIGO);
      console.log(`🔍 [API] Buscando saldos para ${codigos.length} itens...`);

      // Buscar saldos dos itens
      const saldosDb = await obterSaldosNextsi(codigos);
      console.log(
        `✅ [API] Encontrados saldos para ${saldosDb?.length || 0} itens`
      );

      // Mapear saldos para acesso rápido
      const saldosMap = Object.fromEntries(
        saldosDb.map((s: any) => [s.E01_ITEM, s.SaldoTotal])
      );

      // Combinar dados: itens G01 + saldos E01
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
        // Se o ERP expõe G01_PP como ponto de pedido / estoque mínimo, usa aqui
        estoqueMinimo: Number(e.G01_PP) || 0,
        status:
          (saldosMap[e.G01_CODIGO] ?? 0) <= (Number(e.G01_PP) || 0)
            ? "CRÍTICO"
            : "OK",
      }));

      console.log(
        `✅ [API] Retornando ${epicsComSaldo.length} EPIs com saldos`
      );
      return res.json(epicsComSaldo);
    } catch (dbErr: any) {
      console.error("❌ [API] Erro ao buscar do ERP:");
      console.error(dbErr.message || dbErr);
      console.log("⚠️ Usando dados mock como fallback");
      return res.json(epiMockData);
    }
  } catch (err) {
    next(err);
  }
});

app.post("/api/epis", async (req, res, next) => {
  try {
    const novo = await criarEpi(req.body);
    res.status(201).json(novo);
  } catch (err) {
    next(err);
  }
});

// Saldo total de um item (GET)
app.get("/api/itens/:codigo/saldo-erp", async (req, res, next) => {
  try {
    const codigo = req.params.codigo;
    const saldo = await obterSaldoItem(codigo);
    res.json({ codigo, saldo });
  } catch (err) {
    next(err);
  }
});

// (Opcional) Detalhes por local/lote/série (GET)
app.get("/api/itens/:codigo/saldo-erp/detalhe", async (req, res, next) => {
  try {
    const codigo = req.params.codigo;
    const dados = await listarSaldosDetalhados(codigo);
    res.json({ codigo, dados });
  } catch (err) {
    next(err);
  }
});

// ✅ NOVA ROTA: saldos em lote (POST) - Usa ERP
app.post("/api/itens/saldos-erp", async (req, res, next) => {
  try {
    const { codigos } = req.body as { codigos: string[] };
    if (!Array.isArray(codigos) || codigos.length === 0) {
      return res
        .status(400)
        .json({ message: 'Informe um array "codigos" com ao menos 1 item.' });
    }

    // Tentar carregar do ERP (E01), se falhar, usar mock
    try {
      // Tenta obter saldos via Prisma (sinônimo dbo.erp_SaldoItens)
      const saldosDb = await obterSaldosPorItens(codigos);

      // Converter resultado para formato esperado
      const saldos = (saldosDb || []).map((s: any) => ({
        codigo: s.codigo ?? s.E01_ITEM,
        saldo: s.saldo ?? s.SaldoTotal ?? 0,
      }));

      return res.json({ saldos });
    } catch (dbErr) {
      console.log("⚠️ Banco de dados ERP não acessível, usando saldos mock");
      console.error(dbErr.message);

      // Dados mock de saldos
      const saldosMock = {
        "080101.00010": 80,
        "080102.00020": 45,
        "080103.00030": 35,
      };

      const saldos = codigos.map((codigo) => ({
        codigo,
        saldo: saldosMock[codigo as keyof typeof saldosMock] ?? 0,
      }));

      return res.json({ saldos });
    }
  } catch (err) {
    next(err);
  }
});

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

// Error handler central
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
const server = app.listen(PORT, () =>
  console.log(`API EPI rodando na porta ${PORT}`)
);

// Graceful shutdown
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

// Atualiza estoque mínimo (G01_PP) no NEXTSI (atenção: requer permissão de escrita no DB NEXTSI)
app.put("/api/itens/:codigo/estoque-minimo", async (req, res, next) => {
  try {
    const codigo = req.params.codigo;
    const { estoqueMinimo } = req.body as { estoqueMinimo: string | number };

    if (estoqueMinimo === undefined || estoqueMinimo === null) {
      return res
        .status(400)
        .json({ message: "Informe 'estoqueMinimo' no body." });
    }

    // validação simples e conversão para number (DECIMAL)
    const valor = Number(estoqueMinimo);
    if (!isFinite(valor) || valor < 0) {
      return res.status(400).json({ message: "estoqueMinimo inválido" });
    }

    await atualizarEstoqueMinimoNextsi(codigo, valor);

    // Recalcula saldo atual para esse item e determina status
    try {
      const saldoAtual = await obterSaldoItem(codigo);
      const status = (saldoAtual ?? 0) <= valor ? "CRÍTICO" : "OK";
      return res.json({
        codigo,
        estoqueMinimo: valor,
        estoqueAtual: saldoAtual,
        status,
      });
    } catch (errSaldo) {
      // Se não for possível calcular o saldo, retorna pelo menos o estoqueMinimo
      console.error("Erro ao recalcular saldo após atualização:", errSaldo);
      return res.json({ codigo, estoqueMinimo: valor });
    }
  } catch (err) {
    next(err);
  }
});
