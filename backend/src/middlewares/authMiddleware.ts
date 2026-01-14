import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_unsafe_change_me";

// Estendendo a tipagem do Request para incluir 'user'
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido." });
  }

  // Formato esperado: "Bearer <token>"
  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({ message: "Token mal formatado." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Anexa os dados do usuário na requisição
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }
}
