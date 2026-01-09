import { Router } from "express";
import { prisma } from "../../lib/prisma.js";

const router = Router();

/* LISTAR ENTREGAS */
router.get("/", async (req, res) => {
  try {
    const entregas = await prisma.entrega.findMany({
      include: {
        funcionario: true,
        epi: true
      }
    });
    res.json(entregas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* BUSCAR ENTREGA POR ID */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const entrega = await prisma.entrega.findUnique({
      where: { id: parseInt(id) },
      include: {
        funcionario: true,
        epi: {
          include: { tipoEPI: true }
        }
      }
    });

    if (!entrega) {
      return res.status(404).json({ error: "Entrega não encontrada" });
    }

    res.json(entrega);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* LISTAR ENTREGAS POR FUNCIONÁRIO */
router.get("/funcionario/:funcionarioId", async (req, res) => {
  try {
    const { funcionarioId } = req.params;
    const entregas = await prisma.entrega.findMany({
      where: { funcionarioId: parseInt(funcionarioId) },
      include: {
        epi: {
          include: { tipoEPI: true }
        }
      }
    });

    res.json(entregas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* CRIAR ENTREGA */
router.post("/", async (req, res) => {
  try {
    const { funcionarioId, epiId, quantidade, observacoes } = req.body;

    if (!funcionarioId || !epiId || !quantidade) {
      return res.status(400).json({ error: "FuncionarioId, epiId e quantidade são obrigatórios" });
    }

    if (quantidade <= 0) {
      return res.status(400).json({ error: "Quantidade deve ser maior que 0" });
    }

    const epi = await prisma.ePI.findUnique({
      where: { id: parseInt(epiId) }
    });

    if (!epi || epi.estoqueAtual < quantidade) {
      return res.status(400).json({ error: "Estoque insuficiente" });
    }

    const entrega = await prisma.entrega.create({
      data: {
        funcionarioId: parseInt(funcionarioId),
        epiId: parseInt(epiId),
        quantidade: parseInt(quantidade),
        observacoes
      },
      include: {
        funcionario: true,
        epi: true
      }
    });

    await prisma.ePI.update({
      where: { id: parseInt(epiId) },
      data: { estoqueAtual: { decrement: quantidade } }
    });

    res.status(201).json(entrega);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(400).json({ error: "Funcionário ou EPI não encontrado" });
    }
    res.status(500).json({ error: error.message });
  }
});

/* ATUALIZAR ENTREGA */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantidade, observacoes } = req.body;

    const entrega = await prisma.entrega.update({
      where: { id: parseInt(id) },
      data: {
        ...(quantidade !== undefined && { quantidade: parseInt(quantidade) }),
        ...(observacoes && { observacoes })
      },
      include: {
        funcionario: true,
        epi: true
      }
    });

    res.json(entrega);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Entrega não encontrada" });
    }
    res.status(500).json({ error: error.message });
  }
});

/* DELETAR ENTREGA */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const entrega = await prisma.entrega.findUnique({
      where: { id: parseInt(id) }
    });

    if (!entrega) {
      return res.status(404).json({ error: "Entrega não encontrada" });
    }

    await prisma.entrega.delete({
      where: { id: parseInt(id) }
    });

    await prisma.ePI.update({
      where: { id: entrega.epiId },
      data: { estoqueAtual: { increment: entrega.quantidade } }
    });

    res.json({ message: "Entrega deletada e estoque restaurado com sucesso" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Entrega não encontrada" });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
