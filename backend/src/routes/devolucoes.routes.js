import { Router } from "express";
import { prisma } from "../../lib/prisma.js";

const router = Router();

/* LISTAR DEVOLUÇÕES */
router.get("/", async (req, res) => {
  try {
    const devolucoes = await prisma.devolucao.findMany({
      include: {
        funcionario: true,
        epi: true
      }
    });
    res.json(devolucoes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* BUSCAR DEVOLUÇÃO POR ID */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const devolucao = await prisma.devolucao.findUnique({
      where: { id: parseInt(id) },
      include: {
        funcionario: true,
        epi: {
          include: { tipoEPI: true }
        }
      }
    });

    if (!devolucao) {
      return res.status(404).json({ error: "Devolução não encontrada" });
    }

    res.json(devolucao);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* LISTAR DEVOLUÇÕES POR FUNCIONÁRIO */
router.get("/funcionario/:funcionarioId", async (req, res) => {
  try {
    const { funcionarioId } = req.params;
    const devolucoes = await prisma.devolucao.findMany({
      where: { funcionarioId: parseInt(funcionarioId) },
      include: {
        epi: {
          include: { tipoEPI: true }
        }
      }
    });

    res.json(devolucoes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* CRIAR DEVOLUÇÃO */
router.post("/", async (req, res) => {
  try {
    const { funcionarioId, epiId, quantidade, motivo, condicao } = req.body;

    if (!funcionarioId || !epiId || !quantidade) {
      return res.status(400).json({ error: "FuncionarioId, epiId e quantidade são obrigatórios" });
    }

    if (quantidade <= 0) {
      return res.status(400).json({ error: "Quantidade deve ser maior que 0" });
    }

    const devolucao = await prisma.devolucao.create({
      data: {
        funcionarioId: parseInt(funcionarioId),
        epiId: parseInt(epiId),
        quantidade: parseInt(quantidade),
        motivo,
        condicao
      },
      include: {
        funcionario: true,
        epi: true
      }
    });

    await prisma.ePI.update({
      where: { id: parseInt(epiId) },
      data: { estoqueAtual: { increment: quantidade } }
    });

    res.status(201).json(devolucao);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(400).json({ error: "Funcionário ou EPI não encontrado" });
    }
    res.status(500).json({ error: error.message });
  }
});

/* ATUALIZAR DEVOLUÇÃO */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantidade, motivo, condicao } = req.body;

    const devolucao = await prisma.devolucao.update({
      where: { id: parseInt(id) },
      data: {
        ...(quantidade !== undefined && { quantidade: parseInt(quantidade) }),
        ...(motivo && { motivo }),
        ...(condicao && { condicao })
      },
      include: {
        funcionario: true,
        epi: true
      }
    });

    res.json(devolucao);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Devolução não encontrada" });
    }
    res.status(500).json({ error: error.message });
  }
});

/* DELETAR DEVOLUÇÃO */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const devolucao = await prisma.devolucao.findUnique({
      where: { id: parseInt(id) }
    });

    if (!devolucao) {
      return res.status(404).json({ error: "Devolução não encontrada" });
    }

    await prisma.devolucao.delete({
      where: { id: parseInt(id) }
    });

    await prisma.ePI.update({
      where: { id: devolucao.epiId },
      data: { estoqueAtual: { decrement: devolucao.quantidade } }
    });

    res.json({ message: "Devolução deletada e estoque ajustado com sucesso" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Devolução não encontrada" });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
