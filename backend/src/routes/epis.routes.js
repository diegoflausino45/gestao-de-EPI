import { Router } from "express";
import { prisma } from "../../lib/prisma.js";

const router = Router();

/* LISTAR EPIs */
router.get("/", async (req, res) => {
  try {
    const epis = await prisma.ePI.findMany({
      include: {
        tipoEPI: true,
        _count: {
          select: { entregas: true, devolucoes: true }
        }
      }
    });
    res.json(epis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* BUSCAR EPI POR ID */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const epi = await prisma.ePI.findUnique({
      where: { id: parseInt(id) },
      include: {
        tipoEPI: true,
        entregas: {
          include: { funcionario: true }
        },
        devolucoes: {
          include: { funcionario: true }
        }
      }
    });

    if (!epi) {
      return res.status(404).json({ error: "EPI não encontrado" });
    }

    res.json(epi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* CRIAR EPI */
router.post("/", async (req, res) => {
  try {
    const { nome, tipoEPIId, ca, validadeCA, estoqueAtual, estoqueMinimo } = req.body;

    if (!nome || !tipoEPIId) {
      return res.status(400).json({ error: "Nome e tipoEPIId são obrigatórios" });
    }

    const epi = await prisma.ePI.create({
      data: {
        nome,
        tipoEPIId: parseInt(tipoEPIId),
        ca,
        validadeCA: validadeCA ? new Date(validadeCA) : null,
        estoqueAtual: estoqueAtual || 0,
        estoqueMinimo: estoqueMinimo || 5
      },
      include: {
        tipoEPI: true
      }
    });

    res.status(201).json(epi);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(400).json({ error: "Tipo de EPI não encontrado" });
    }
    res.status(500).json({ error: error.message });
  }
});

/* ATUALIZAR EPI */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, tipoEPIId, ca, validadeCA, estoqueAtual, estoqueMinimo, status, ativo } = req.body;

    const epi = await prisma.ePI.update({
      where: { id: parseInt(id) },
      data: {
        ...(nome && { nome }),
        ...(tipoEPIId && { tipoEPIId: parseInt(tipoEPIId) }),
        ...(ca && { ca }),
        ...(validadeCA && { validadeCA: new Date(validadeCA) }),
        ...(estoqueAtual !== undefined && { estoqueAtual }),
        ...(estoqueMinimo !== undefined && { estoqueMinimo }),
        ...(status && { status }),
        ...(ativo !== undefined && { ativo })
      },
      include: {
        tipoEPI: true
      }
    });

    res.json(epi);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "EPI não encontrado" });
    }
    res.status(500).json({ error: error.message });
  }
});

/* DELETAR EPI */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.ePI.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: "EPI deletado com sucesso" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "EPI não encontrado" });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
