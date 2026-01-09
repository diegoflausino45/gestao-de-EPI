import { Router } from "express";
import { prisma } from "../../lib/prisma.js";

const router = Router();

/* LISTAR SETORES */
router.get("/", async (req, res) => {
  try {
    const setores = await prisma.setor.findMany({
      include: {
        _count: {
          select: { funcionarios: true }
        }
      }
    });
    res.json(setores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* BUSCAR SETOR POR ID */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const setor = await prisma.setor.findUnique({
      where: { id: parseInt(id) },
      include: {
        funcionarios: true,
        _count: {
          select: { funcionarios: true }
        }
      }
    });

    if (!setor) {
      return res.status(404).json({ error: "Setor não encontrado" });
    }

    res.json(setor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* CRIAR SETOR */
router.post("/", async (req, res) => {
  try {
    const { nome, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    const setor = await prisma.setor.create({
      data: {
        nome,
        descricao
      }
    });

    res.status(201).json(setor);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Setor com esse nome já existe" });
    }
    res.status(500).json({ error: error.message });
  }
});

/* ATUALIZAR SETOR */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao } = req.body;

    const setor = await prisma.setor.update({
      where: { id: parseInt(id) },
      data: {
        ...(nome && { nome }),
        ...(descricao && { descricao })
      }
    });

    res.json(setor);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Setor não encontrado" });
    }
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Setor com esse nome já existe" });
    }
    res.status(500).json({ error: error.message });
  }
});

/* DELETAR SETOR */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const funcionariosCount = await prisma.funcionario.count({
      where: { setorId: parseInt(id) }
    });

    if (funcionariosCount > 0) {
      return res.status(400).json({ 
        error: "Não é possível deletar setor com funcionários associados" 
      });
    }

    await prisma.setor.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: "Setor deletado com sucesso" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Setor não encontrado" });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
