// backend/src/routes/export.routes.ts (ฉบับอัปเดต)
import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware";
// ‼️ [1. เพิ่ม] Import ฟังก์ชันใหม่ ‼️
import { 
    exportSurveyResponses, 
    exportApplicants 
} from "../controllers/export.controller";

const router = express.Router();

// (Route เดิม)
// GET /api/export/survey/:eventId
router.get(
    "/survey/:eventId",
    protect,
    adminOnly,
    exportSurveyResponses
);

// ‼️ [2. เพิ่ม] Route ใหม่ ‼️
// GET /api/export/applicants/:eventId
router.get(
    "/applicants/:eventId",
    protect,
    adminOnly,
    exportApplicants
);

export default router;