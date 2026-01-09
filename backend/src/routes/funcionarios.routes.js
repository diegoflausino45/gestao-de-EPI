import { Router } from "express";
import { prisma } from "../../lib/prisma.js";

const router = Router();

/* LISTAR FUNCIONÁRIOS */
router.get("/", async (req, res) => {
  try {
    const funcionarios = await prisma.funcionario.findMany({
      include: {
        setor: true,
        _count: {
          select: { entregas: true, devolucoes: true }
        }
      }
    });
    res.json(funcionarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* BUSCAR FUNCIONÁRIO POR ID */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const funcionario = await prisma.funcionario.findUnique({
      where: { id: parseInt(id) },
      include: {
        setor: true,
        entregas: {
          include: { epi: true }
        },
        devolucoes: {
          include: { epi: true }
        }
      }
    });

    if (!funcionario) {
      return res.status(404).json({ error: "Funcionário não encontrado" });
    }

    res.json(funcionario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* CRIAR FUNCIONÁRIO */
router.post("/", async (req, res) => {
  try {
    const { nome, email, cargo, setorId, status } = req.body;

    if (!nome || !cargo || !setorId) {
      return res.status(400).json({ error: "Nome, cargo e setorId são obrigatórios" });
    }

    const funcionario = await prisma.funcionario.create({
      data: {
        nome,
        email,
        cargo,
        setorId: parseInt(setorId),
        status: status || "ATIVO"
      },
      include: {
        setor: true
      }
    });

    res.status(201).json(funcionario);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email já cadastrado" });
    }
    if (error.code === "P2025") {
      return res.status(400).json({ error: "Setor não encontrado" });
    }
    res.status(500).json({ error: error.message });
  }
});

/* ATUALIZAR FUNCIONÁRIO */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, cargo, setorId, ativo, status } = req.body;

    const funcionario = await prisma.funcionario.update({
      where: { id: parseInt(id) },
      data: {
        ...(nome && { nome }),
        ...(email && { email }),
        ...(cargo && { cargo }),
        ...(setorId && { setorId: parseInt(setorId) }),
        ...(ativo !== undefined && { ativo }),
        ...(status && { status })
      },
      include: {
        setor: true
      }
    });

    res.json(funcionario);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Funcionário não encontrado" });
    }
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email já cadastrado" });
    }
    res.status(500).json({ error: error.message });
  }
});

/* DELETAR FUNCIONÁRIO */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.funcionario.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: "Funcionário deletado com sucesso" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Funcionário não encontrado" });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
