import { Router } from "express";
import { prisma } from "../../lib/prisma.js";

const router = Router();

/* LISTAR TIPOS DE EPI */
router.get("/", async (req, res) => {
  try {
    const tipos = await prisma.tipoEPI.findMany({
      include: {
        _count: {
          select: { epis: true }
        }
      }
    });
    res.json(tipos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* BUSCAR TIPO DE EPI POR ID */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const tipo = await prisma.tipoEPI.findUnique({
      where: { id: parseInt(id) },
      include: {
        epis: true
      }
    });

    if (!tipo) {
      return res.status(404).json({ error: "Tipo de EPI não encontrado" });
    }

    res.json(tipo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* CRIAR TIPO DE EPI */
router.post("/", async (req, res) => {
  try {
    const { nome, descricao, categoria } = req.body;

    if (!nome || !categoria) {
      return res.status(400).json({ error: "Nome e categoria são obrigatórios" });
    }

    const tipo = await prisma.tipoEPI.create({
      data: {
        nome,
        descricao,
        categoria
      }
    });

    res.status(201).json(tipo);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Tipo de EPI com esse nome já existe" });
    }
    res.status(500).json({ error: error.message });
  }
});

/* ATUALIZAR TIPO DE EPI */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, categoria, ativo } = req.body;

    const tipo = await prisma.tipoEPI.update({
      where: { id: parseInt(id) },
      data: {
        ...(nome && { nome }),
        ...(descricao && { descricao }),
        ...(categoria && { categoria }),
        ...(ativo !== undefined && { ativo })
      }
    });

    res.json(tipo);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Tipo de EPI não encontrado" });
    }
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Tipo de EPI com esse nome já existe" });
    }
    res.status(500).json({ error: error.message });
  }
});

/* DELETAR TIPO DE EPI */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const epiCount = await prisma.ePI.count({
      where: { tipoEPIId: parseInt(id) }
    });

    if (epiCount > 0) {
      return res.status(400).json({ 
        error: "Não é possível deletar tipo de EPI com EPIs associados" 
      });
    }

    await prisma.tipoEPI.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: "Tipo de EPI deletado com sucesso" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Tipo de EPI não encontrado" });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
