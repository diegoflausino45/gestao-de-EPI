// IMPORTAÇÕES DE DEPENDÊNCIAS E SERVIÇOS
import { Router } from "express";
import { prisma } from "../db/prisma.js";
import {
  checkConnection as checkNextsi
} from "../services/EpiERP.service.js";

// CRIAÇÃO DO ROUTER, DEFINIÇÃO DAS ROTAS
const router = Router();

// Simple Health Check Endpoint (GET /) - Retorna { ok: true }
router.get("/", (_req, res) => res.json({ ok: true }));

// Health Check Endpoint (GET /) - Verifica status do banco local e ERP
router.get("/", async (_req, res) => {
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

export default router;
