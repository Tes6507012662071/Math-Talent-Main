// routes/attendance.routes.ts
import express from "express";
import { uploadAttendance } from "../controllers/attendance.controller"; // 👈 ใช้ชื่อเดียวกับ controller
import { uploadExcel } from "../middleware/uploadExcel";

const router = express.Router();

// ✅ endpoint /upload
router.post("/upload", uploadExcel.single("file"), uploadAttendance);

export default router;
