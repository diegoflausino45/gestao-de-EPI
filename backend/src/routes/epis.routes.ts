// IMPORTAÇÕES DE DEPENDÊNCIAS E SERVIÇOS
import { Router } from "express";
import {
  criarEpi,
  obterSaldoItem,
  listarSaldosDetalhados,
  listarItensEPNextsi,
  obterSaldosNextsi,
  atualizarEstoqueMinimoNextsi,
} from "../services/EpiERP.service.js";

// CRIAÇÃO DO ROUTER, DEFINIÇÃO DAS ROTAS
const router = Router();

// Lista todos os EPIs com saldos atuais (GET /)
router.get("/", async (_req, res, next) => {
  try {
    {
      // Log de busca de itens EP -- Desativado para reduzir log
      /*console.log("🔍 [API] Buscando itens EP do NEXTSI_HOMOLOG...");*/
    }
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
    const epicsComSaldo = epis.map((e: any) => {
      const estoqueAtual = saldosMap[e.G01_CODIGO] ?? 0;
      const estoqueMinimo =
        e.G01_PP !== undefined && e.G01_PP !== null ? Number(e.G01_PP) : 0;

      // Status é CRÍTICO se estoque atual < estoque mínimo
      const status = estoqueAtual < estoqueMinimo ? "CRÍTICO" : "OK";

      return {
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
        estoqueMinimo,
        estoqueAtual,
        status,
      };
    });

    // Retorna lista de EPIs com saldos no log do servidor -- Desativado para reduzir log
    {
      /*console.log(`✅ [API] Retornando ${epicsComSaldo.length} EPIs com saldos`);*/
    }
    return res.json(epicsComSaldo);
  } catch (err) {
    // Passa erro para o handler central (não usa mais mock)
    next(err);
  }
});

// Cria um novo EPI (POST /)
router.post("/", async (req, res, next) => {
  try {
    const novo = await criarEpi(req.body);
    res.status(201).json(novo);
  } catch (err) {
    next(err);
  }
});

// Consulta saldo de um item específico (GET /:codigo/saldo)
router.get("/:codigo/saldo", async (req, res, next) => {
  try {
    const codigo = req.params.codigo;
    const saldo = await obterSaldoItem(codigo);
    res.json({ codigo, saldo });
  } catch (err) {
    next(err);
  }
});

// Detalhes de saldo por Local/Lote/Série (GET /:codigo/saldo/detalhe)
router.get("/:codigo/saldo/detalhe", async (req, res, next) => {
  try {
    const codigo = req.params.codigo;
    const dados = await listarSaldosDetalhados(codigo);
    res.json({ codigo, dados });
  } catch (err) {
    next(err);
  }
});

// Consulta de saldos em lote via NEXTSI (POST /api/epis/saldos-erp)
router.post("/saldos-erp", async (req, res, next) => {
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

// Atualiza estoque mínimo (G01_PP) no NEXTSI (atenção: requer permissão de escrita no DB NEXTSI)
router.put("/:codigo/estoque-minimo", async (req, res, next) => {
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
      const status = (saldoAtual ?? 0) < valor ? "CRÍTICO" : "OK";
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

export default router;
