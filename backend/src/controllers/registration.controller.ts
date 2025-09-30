import { Request, Response } from "express";
import Registration from "../models/Registration";
import IndividualRegistration from "../models/IndividualRegistration";

// ✅ ลบ CustomRequest ออกทั้งหมด — ใช้ global type

// ดึงข้อมูล registration ของ user คนที่ล็อกอิน (แสดง event + status)
export const getMyEvents = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const registrations = await Registration.find({ user: userId })
      .populate("event")
      .exec();

    res.json(registrations);
  } catch (error) {
    console.error("getMyEvents error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
};

export const uploadSlip = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    const userId = req.user?.id;
    const slipPath = req.file?.path;

    console.log("📥 uploadSlip called:", { eventId, userId, slipPath });

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!slipPath) {
      return res.status(400).json({ message: "❌ ไม่พบไฟล์ slip" });
    }

    const registration = await Registration.findOneAndUpdate(
      { event: eventId, user: userId },
      { slipUrl: slipPath, status: "slip_uploaded" },
      { new: true, upsert: true }
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

// ✅ ดึงผู้สมัครทั้งหมดตาม Event
export const getApplicantsByEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    const applicants = await IndividualRegistration.find({ eventId })
      .populate("userId", "fullname userCode email")
      .populate("eventId", "title");

    res.json(applicants);
  } catch (error) {
    console.error("❌ getApplicantsByEvent error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้สมัคร" });
  }
};