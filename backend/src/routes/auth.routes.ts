import express from "express";
import { register, loginUser, getCurrentUser } from "../controllers/auth.controller";
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post("/register", register);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser);

export default router;
