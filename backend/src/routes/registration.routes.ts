import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import Registration from "../models/Registration"; // ต้องมี model นี้ก่อน
import multer from "multer";
const upload = multer({ dest: "uploads/" }); // หรือใช้ Cloudinary ก็ได้
const router = express.Router();

router.get("/myevents", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const registrations = await Registration.find({ user: userId }).populate("eventId");
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// ✅ Upload Slip
router.post("/upload-slip/:id", authMiddleware, upload.single("slip"), async (req, res) => {
  try {
    const registrationId = req.params.id;
    const filePath = req.file?.path;

    if (!filePath) return res.status(400).json({ message: "ไม่พบไฟล์" });

    const updated = await Registration.findByIdAndUpdate(registrationId, {
      slipUrl: filePath,
      status: "รอตรวจสอบ"
    });

    if (!updated) return res.status(404).json({ message: "ไม่พบข้อมูลการสมัคร" });

    res.json({ message: "อัปโหลดสลิปเรียบร้อย" });
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

export default router;
