import { Router } from "express";
import { container } from "../../di/container.ts";
import { AuthController } from "../controllers/AuthController.ts";

const router = Router();
const authController = container.resolve(AuthController);

router.post("/login", authController.login.bind(authController));
router.post("/register", authController.register.bind(authController));
router.post("/refresh-token", authController.refreshToken.bind(authController));
router.post("/logout", authController.logout.bind(authController));

export { router as authRoutes };
