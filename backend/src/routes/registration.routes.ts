// routes/registrationRoutes.ts
import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import multer from "multer";
import Registration from "../models/Registration";

const upload = multer({ dest: "uploads/slips" });
const router = express.Router();

router.get("/myevents", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.id; // 👈 ควรใช้ .user.id ไม่ใช่ .userId
    const registrations = await Registration.find({ user: userId }).populate("event");
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// ✅ อัปเดต: Upload slip โดยใช้ eventId + userId
router.post("/upload-slip/:id", authMiddleware, upload.single("slip"), async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = (req as any).user.id; // มาจาก authMiddleware
    const filePath = req.file?.path;

    if (!filePath) {
      return res.status(400).json({ message: "ไม่พบไฟล์ที่อัปโหลด" });
    }

    const registration = await Registration.findOneAndUpdate(
      { event: eventId, user: userId },
      { slipUrl: filePath, status: "pending" }, // หรือจะใช้ "slip_uploaded" ก็ได้
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({ message: "ไม่พบข้อมูลการสมัครที่ตรงกับ event นี้" });
    }

    res.json({ message: "อัปโหลดสลิปสำเร็จ", registration });
  } catch (err) {
    console.error("Upload slip error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

export default router;
