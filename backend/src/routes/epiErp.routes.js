import { Router } from "express";
import { 
  obterEpisDoErp, 
  obterEpiPorCodigo, 
  obterSaldosMultiplos,
  obterEpisPorCategoria 
} from "../services/erpService.js";

const router = Router();

/**
 * GET /epis-erp
 * Lista todos os EPIs/Itens do banco ERP
 */
router.get("/", async (req, res) => {
  try {
    const epis = await obterEpisDoErp();
    res.json({
      sucesso: true,
      total: epis.length,
      dados: epis
    });
  } catch (error) {
    console.error("Erro ao listar EPIs do ERP:", error);
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

/**
 * GET /epis-erp/:codigo
 * Busca EPI específico por código
 */
router.get("/:codigo", async (req, res) => {
  try {
    const { codigo } = req.params;
    
    if (!codigo) {
      return res.status(400).json({
        sucesso: false,
        erro: "Código do item é obrigatório"
      });
    }

    const epi = await obterEpiPorCodigo(codigo);
    
    if (!epi) {
      return res.status(404).json({
        sucesso: false,
        erro: `Item ${codigo} não encontrado no ERP`
      });
    }

    res.json({
      sucesso: true,
      dados: epi
    });
  } catch (error) {
    console.error("Erro ao buscar EPI do ERP:", error);
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

/**
 * POST /epis-erp/saldos
 * Busca saldos de múltiplos itens
 * Body: { codigos: ["COD1", "COD2", "COD3"] }
 */
router.post("/saldos", async (req, res) => {
  try {
    const { codigos } = req.body;
    
    if (!codigos || !Array.isArray(codigos) || codigos.length === 0) {
      return res.status(400).json({
        sucesso: false,
        erro: "Array de códigos é obrigatório"
      });
    }

    const saldos = await obterSaldosMultiplos(codigos);
    
    res.json({
      sucesso: true,
      total: saldos.length,
      dados: saldos
    });
  } catch (error) {
    console.error("Erro ao buscar saldos:", error);
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

/**
 * GET /epis-erp/categoria/:categoria
 * Busca EPIs por categoria
 */
router.get("/categoria/:categoria", async (req, res) => {
  try {
    const { categoria } = req.params;
    
    if (!categoria) {
      return res.status(400).json({
        sucesso: false,
        erro: "Categoria é obrigatória"
      });
    }

    const epis = await obterEpisPorCategoria(categoria);
    
    res.json({
      sucesso: true,
      total: epis.length,
      dados: epis
    });
  } catch (error) {
    console.error("Erro ao buscar EPIs por categoria:", error);
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

export default router;
