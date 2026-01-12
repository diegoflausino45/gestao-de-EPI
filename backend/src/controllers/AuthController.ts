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
}
