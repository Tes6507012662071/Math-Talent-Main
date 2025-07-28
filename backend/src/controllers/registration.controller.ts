import { Request, Response } from "express";
import Registration from "../models/Registration";


interface CustomRequest extends Request {
  user?: { id: string };
}


// ดึงข้อมูล registration ของ user คนที่ล็อกอิน (แสดง event + status)
export const getMyEvents = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const registrations = await Registration.find({ user: userId })
      .populate("event")  // ดึงข้อมูล event มาแสดงด้วย
      .exec();

    res.json(registrations);
  } catch (error) {
    console.error("getMyEvents error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
};

export const uploadSlip = async (req: CustomRequest, res: Response) => {
  try {
    const eventId = req.params.id;
    const userId = req.user?.id;
    const slipPath = req.file?.path;

    console.log("📥 uploadSlip called:", { eventId, userId, slipPath });

    if (!slipPath) {
      return res.status(400).json({ message: "❌ ไม่พบไฟล์ slip" });
    }

    // ✅ ใช้ upsert: true เพื่อสร้าง record ใหม่ถ้ายังไม่มี
    const registration = await Registration.findOneAndUpdate(
      { event: eventId, user: userId },
      { slipUrl: slipPath, status: "slip_uploaded" },
      { new: true, upsert: true }   // <<<< สำคัญ
    );

    console.log("✅ Slip uploaded for registration:", registration._id);

    res.status(200).json({
      message: "📤 อัปโหลดสลิปสำเร็จและรอตรวจสอบจากแอดมิน",
      registration,
    });

  } catch (err) {
    console.error("❌ uploadSlip error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
};
