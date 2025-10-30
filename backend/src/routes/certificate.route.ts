import express from "express";
// 1. ✅ Import Middleware (protect และ adminOnly)
import { protect, adminOnly } from "../middleware/authMiddleware";
import { 
    uploadCertificates, 
    downloadCertificate, 
    getCertificatesByEvent 
} from "../controllers/certificate.controller";
import { uploadCertificate as uploadCertificateMiddleware } from "../middleware/uploadCertificate";

const router = express.Router();

// ✅ Admin อัปโหลดใบประกาศหลายไฟล์
router.post(
    "/upload", 
    protect, // 👈 (ต้องล็อกอิน)
    adminOnly, // 👈 (และต้องเป็น Admin)
    uploadCertificateMiddleware.array("files", 100), 
    uploadCertificates
);

// ✅ User ดาวน์โหลดใบประกาศ
// 2. ‼️ [แก้ไข] เพิ่ม 'protect' middleware ‼️
router.get(
    "/download/:eventId/:userCode", 
    protect, // 👈 (ต้องล็อกอิน)
    downloadCertificate
);

// ✅ ดึงรายชื่อ Certificate ตาม EventId (Admin)
router.get(
    "/event/:eventId", 
    protect, // 👈 (ต้องล็อกอิน)
    adminOnly, // 👈 (และต้องเป็น Admin)
    getCertificatesByEvent
);

export default router;