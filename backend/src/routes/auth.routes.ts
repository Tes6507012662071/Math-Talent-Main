import express from "express";
import { register, login, getCurrentUser } from "../controllers/auth.controller";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getCurrentUser);

export default router;
