import { Router } from "express";
// Controllers & Services
import { AuthController } from "../controllers/AuthController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";


const router = Router();


const authController = new AuthController();
// =========================================
// 🔐 ROTAS DE AUTENTICAÇÃO
// =========================================

/**
 * @route POST /auth/login
 * @desc Autentica usuário e retorna JWT
 */
router.post("/login", authController.login);

/**
 * @route POST /auth/register
 * @desc Cria novo usuário (Uso interno/Admin)
 */
router.post("/register", authController.register);

/**
 * @route PUT /users/profile
 * @desc Atualiza dados do usuário logado
 */
router.put("/users/profile", authMiddleware, authController.updateProfile);

/**
 * @route PATCH /users/password
 * @desc Altera senha do usuário logado
 */
router.patch("/users/password", authMiddleware, authController.updatePassword);

export default router