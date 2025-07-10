import express from "express";
import multer from "multer";
import { uploadSlip } from "../controllers/registrationController";
import authMiddleware from "../middleware/authMid";


const router = express.Router();

// ตั้งค่าการเก็บไฟล์ด้วย multer (เก็บใน local สำหรับ demo)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/slips/"); // สร้างโฟลเดอร์นี้ไว้
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// ✅ อัปโหลด slip
router.post("/upload-slip/:id", authMiddleware, upload.single("slip"), uploadSlip);

export default router;
