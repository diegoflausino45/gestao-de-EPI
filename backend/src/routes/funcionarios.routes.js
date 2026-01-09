import { Router } from "express";
import { prisma } from "../../lib/prisma.js";

const router = Router();

/* LISTAR FUNCIONÁRIOS */
router.get("/", async (req, res) => {
  try {
    const funcionarios = await prisma.funcionario.findMany();
    res.json(funcionarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* CRIAR FUNCIONÁRIO */
router.post("/", async (req, res) => {
  try {
    const { nome, cargo, setor } = req.body;

    const funcionario = await prisma.funcionario.create({
      data: {
        nome,
        cargo,
        setor,
        status: "ATIVO"
      },
    });

    res.status(201).json(funcionario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
