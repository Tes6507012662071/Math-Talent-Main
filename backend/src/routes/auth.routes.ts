import express from "express";
import { 
    register, 
    loginUser, 
    getCurrentUser, 
    updateUserProfile 
} from "../controllers/auth.controller";
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post("/register", register);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser); 
router.patch("/profile", protect, updateUserProfile);
// ---

export default router;