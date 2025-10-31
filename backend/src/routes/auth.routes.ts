import express from "express";
// 1. ‼️ [แก้ไข] Import ฟังก์ชันใหม่ (updateUserProfile) ‼️
import { 
    register, 
    loginUser, 
    getCurrentUser, 
    updateUserProfile // 👈 (เพิ่ม)
} from "../controllers/auth.controller";
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post("/register", register);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser); // (ดึงข้อมูล Profile ปัจจุบัน)

// --- ‼️ [เพิ่ม Route ใหม่] ‼️ ---
// (ใช้สำหรับ "บันทึก" ข้อมูล Profile ที่แก้ไข)
// (PATCH /api/auth/profile)
router.patch("/profile", protect, updateUserProfile);
// ---

export default router;