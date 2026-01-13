import { Request, Response, NextFunction } from "express";
import { prisma } from "../db/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Segredo do JWT (Deve estar no .env)
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_unsafe_change_me";

export class AuthController {
  
  // Login de Usuário
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
      }

      // 1. Buscar usuário
      const user = await prisma.usuario.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({ message: "Credenciais inválidas." });
      }

      // 2. Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user.senha);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Credenciais inválidas." });
      }

      if (!user.ativo) {
        return res.status(403).json({ message: "Usuário inativo." });
      }

      // 3. Gerar Token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "8h" } // Token válido por 8 horas (turno de trabalho)
      );

      // 4. Retornar dados (sem a senha)
      return res.json({
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          role: user.role,
        },
        token,
      });

    } catch (error) {
      next(error);
    }
  }

  // Registro de Usuário (Para criar os primeiros admins ou via painel admin)
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { nome, email, password, role } = req.body;

      if (!nome || !email || !password) {
        return res.status(400).json({ message: "Nome, email e senha são obrigatórios." });
      }

      // 1. Verificar duplicidade
      const existingUser = await prisma.usuario.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({ message: "E-mail já cadastrado." });
      }

      // 2. Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // 3. Criar usuário
      const newUser = await prisma.usuario.create({
        data: {
          nome,
          email,
          senha: hashedPassword,
          role: role || "user", // Default "user" se não especificado
        },
      });

      // Retornar sucesso (sem a senha)
      return res.status(201).json({
        id: newUser.id,
        nome: newUser.nome,
        email: newUser.email,
        role: newUser.role,
      });

    } catch (error) {
      next(error);
    }
  }

  // Atualizar Perfil do Usuário Logado
  async updateProfile(req: any, res: Response, next: NextFunction) {
    try {
      const { nome, email } = req.body;
      const userId = req.user.id;

      if (!nome || !email) {
        return res.status(400).json({ message: "Nome e e-mail são obrigatórios." });
      }

      // Verificar se o email já está em uso por outro usuário
      const emailConflict = await prisma.usuario.findFirst({
        where: {
          email,
          id: { not: userId }
        }
      });

      if (emailConflict) {
        return res.status(409).json({ message: "E-mail já está em uso." });
      }

      const updatedUser = await prisma.usuario.update({
        where: { id: userId },
        data: { nome, email },
        select: {
          id: true,
          nome: true,
          email: true,
          role: true,
        }
      });

      return res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  // Alterar Senha do Usuário Logado
  async updatePassword(req: any, res: Response, next: NextFunction) {
    try {
      const { senhaAtual, novaSenha } = req.body;
      const userId = Number(req.user?.id);

      if (!userId || !senhaAtual || !novaSenha) {
        return res.status(400).json({ message: "Dados incompletos para alteração de senha." });
      }

      // 1. Buscar usuário para validar a senha atual
      const user = await prisma.usuario.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }

      // 2. Verificar senha atual
      const isPasswordValid = await bcrypt.compare(senhaAtual, user.senha);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "A senha atual informada está incorreta." });
      }

      // 3. Hash da nova senha e salvar
      const hashedNewPassword = await bcrypt.hash(novaSenha, 10);

      await prisma.usuario.update({
        where: { id: userId },
        data: { senha: hashedNewPassword },
      });

      return res.json({ message: "Senha atualizada com sucesso." });
    } catch (error) {
      next(error);
    }
  }
}
