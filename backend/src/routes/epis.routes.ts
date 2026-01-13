import { Router } from "express";
import {criarEpi, obterSaldoItem, listarSaldosDetalhados,  listarItensEPNextsi, obterSaldosNextsi } from "../services/EpiERP.service.js";
/*Import Anterior
import { listarEpis, criarEpi, obterSaldoItem, 
    listarSaldosDetalhados, obterSaldosPorItens,  listarItensEPNextsi, obterSaldosNextsi, obterSaldoDetalheNextsi } from "../services/EpiERP.service.js";*/

const router = Router();

// Exemplo de rotas já existentes
router.get("/", async (_req, res, next) => {
  try {
    // Tentar carregar do ERP (G01 - itens EP), se falhar, usar mock
    try {
      console.log("🔍 [API] Buscando itens EP do NEXTSI_HOMOLOG...");
      const epis = await listarItensEPNextsi();
      
      console.log(`✅ [API] Encontrados ${epis?.length || 0} itens EP`);
      
      // Se não houver itens, retornar mock
      if (!epis || epis.length === 0) {
        console.log("⚠️ Nenhum item EP encontrado no ERP, usando dados mock");
        return res.json(epis);
      }

      // Extrair códigos dos itens (G01_CODIGO)
      const codigos = epis.map((e: any) => e.G01_CODIGO);
      console.log(`🔍 [API] Buscando saldos para ${codigos.length} itens...`);

      // Buscar saldos dos itens
      const saldosDb = await obterSaldosNextsi(codigos);
      console.log(`✅ [API] Encontrados saldos para ${saldosDb?.length || 0} itens`);
      
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
        estoqueMinimo: 0, // G01 não tem estoqueMinimo, pode ser adicionado depois
        status:
          (saldosMap[e.G01_CODIGO] ?? 0) <= 0 ? "CRÍTICO" : "OK",
      }));

      console.log(`✅ [API] Retornando ${epicsComSaldo.length} EPIs com saldos`);
      return res.json(epicsComSaldo);
    } catch (dbErr: any) {
      console.error("❌ [API] Erro ao buscar do ERP:");
      console.error(dbErr.message || dbErr);
      console.log("⚠️ Usando dados mock como fallback");
      return res.json(dbErr);
    }
  } catch (err) {
    next(err);
  }
});

router.post("/epis", async (req, res, next) => {
  try {
    const novo = await criarEpi(req.body);
    res.status(201).json(novo);
  } catch (err) {
    next(err);
  }
});

// Saldo total de um item (GET)
router.get("/itens/:codigo/saldo-erp", async (req, res, next) => {
  try {
    const codigo = req.params.codigo;
    const saldo = await obterSaldoItem(codigo);
    res.json({ codigo, saldo });
  } catch (err) {
    next(err);
  }
});

// (Opcional) Detalhes por local/lote/série (GET)
router.get("/itens/:codigo/saldo-erp/detalhe", async (req, res, next) => {
  try {
    const codigo = req.params.codigo;
    const dados = await listarSaldosDetalhados(codigo);
    res.json({ codigo, dados });
  } catch (err) {
    next(err);
  }
});

// ✅ NOVA ROTA: saldos em lote (POST) - Usa ERP
router.post("/itens/saldos-erp", async (req, res, next) => {
  try {
    const { codigos } = req.body as { codigos: string[] };
    if (!Array.isArray(codigos) || codigos.length === 0) {
      return res
        .status(400)
        .json({ message: 'Informe um array "codigos" com ao menos 1 item.' });
    }
    
    // Tentar carregar do ERP (E01), se falhar, usar mock
    try {
      const saldosDb = await obterSaldosItensERP(codigos);
      
      // Converter resultado para formato esperado
      const saldos = saldosDb.map((s) => ({
        codigo: s.E01_ITEM,
        saldo: s.SaldoTotal || 0,
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

export default router;