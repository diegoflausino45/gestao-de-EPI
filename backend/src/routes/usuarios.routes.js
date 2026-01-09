import { Router } from "express";
import { prisma } from "../../lib/prisma.js";

const router = Router();

/* LISTAR USUÁRIOS */
router.get("/", async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        nome: true,
        perfil: true,
        ativo: true,
        criadoEm: true
      }
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* BUSCAR USUÁRIO POR ID */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        nome: true,
        perfil: true,
        ativo: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* CRIAR USUÁRIO */
router.post("/", async (req, res) => {
  try {
    const { email, senha, nome, perfil } = req.body;

    if (!email || !senha || !nome) {
      return res.status(400).json({ error: "Email, senha e nome são obrigatórios" });
    }

    const usuario = await prisma.usuario.create({
      data: {
        email,
        senha,
        nome,
        perfil: perfil || "USER"
      },
      select: {
        id: true,
        email: true,
        nome: true,
        perfil: true,
        ativo: true,
        criadoEm: true
      }
    });

    res.status(201).json(usuario);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email já cadastrado" });
    }
    res.status(500).json({ error: error.message });
  }
});

/* ATUALIZAR USUÁRIO */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { email, nome, perfil, ativo } = req.body;

    const usuario = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: {
        ...(email && { email }),
        ...(nome && { nome }),
        ...(perfil && { perfil }),
        ...(ativo !== undefined && { ativo })
      },
      select: {
        id: true,
        email: true,
        nome: true,
        perfil: true,
        ativo: true
      }
    });

    res.json(usuario);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.status(500).json({ error: error.message });
  }
});

/* DELETAR USUÁRIO */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.usuario.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
