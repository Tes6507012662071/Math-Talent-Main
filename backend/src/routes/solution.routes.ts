// backend/src/routes/solution.routes.ts (ฉบับแก้ไข)
import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware";
import { 
    uploadSolution, 
    getAllSolutions,
    getSolutionById 
} from "../controllers/solution.controller";

// 1. ‼️ [เพิ่ม] Import Multer Middleware ที่สร้างใหม่ ‼️
import { uploadSolutionFile } from "../middleware/uploadSolution";

const router = express.Router();

router.get("/", getAllSolutions); 
router.get("/:id", getSolutionById); 

// POST /api/solutions/upload
router.post(
    "/upload",
    protect,
    adminOnly,
    // 2. ‼️ [เพิ่ม] เรียกใช้ Multer ก่อน Controller ‼️
    // (ชื่อ 'file' ต้องตรงกับที่ Frontend ใช้: formData.append("file", solutionFile))
    uploadSolutionFile.single("file"), 
    uploadSolution
);

export default router;