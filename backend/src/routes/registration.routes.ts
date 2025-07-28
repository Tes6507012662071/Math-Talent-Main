import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import multer from "multer";
import { uploadSlip, getMyEvents } from "../controllers/registration.controller";

const upload = multer({ dest: "uploads/slips" });
const router = express.Router();

console.log("Registration routes loaded");

router.get("/myevents", authMiddleware, getMyEvents);      // ดึงข้อมูล registration ของ user นี้
router.post("/upload-slip/:id", authMiddleware, upload.single("slip"), uploadSlip);


export default router;
