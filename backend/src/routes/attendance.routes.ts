import express from "express";
import { uploadAttendance } from "../controllers/attendance.controller"; 
import { uploadExcel } from "../middleware/uploadExcel";

const router = express.Router();

router.post("/upload", uploadExcel.single("file"), uploadAttendance);

export default router;
