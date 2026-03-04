import { Router } from "express";
import { login, refresh, logout } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema, refreshTokenSchema } from "../schemas/user";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshTokenSchema), refresh);
router.post("/logout", logout);

export default router;
