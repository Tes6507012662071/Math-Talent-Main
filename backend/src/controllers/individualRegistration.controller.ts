// src/controllers/individualRegistration.controller.ts
import { Request, Response } from "express";
import IndividualRegistration from "../models/IndividualRegistration";
import Event from "../models/Event";

interface CustomRequest extends Request {
  user?: { id: string };
}

// REGISTER INDIVIDUAL
export const registerIndividual = async (req: Request, res: Response) => {
  try {
    const customReq = req as CustomRequest;
    const userId = customReq.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { eventId, fullname, grade, school, phone, email } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    const eventCode = event.code?.toString().padStart(2, "0") || "01";

    const gradeMap: Record<string, number> = {
      "ประถมศึกษาตอนปลาย": 1,
      "มัธยมศึกษาตอนต้น": 2,
      "มัธยมศึกษาตอนปลาย": 3,
    };
    const level = gradeMap[grade];
    if (!level) return res.status(400).json({ message: "Invalid grade" });

    const sequence = await IndividualRegistration.countDocuments({ eventId }) + 1;

    const year = new Date().getFullYear() % 100;
    const levelCode = level.toString().padStart(2, "0");
    const seqCode = sequence.toString().padStart(3, "0");
    const userCode = `${year}${eventCode}${levelCode}${seqCode}`;

    const newRegistration = new IndividualRegistration({
      eventId,
      fullname,
      grade,
      school,
      phone,
      email,
      userId,
      status: "registered",
      userCode,
    });

    await newRegistration.save();

    res.status(201).json({
      success: true,
      message: "ลงทะเบียนเรียบร้อยแล้ว",
      userCode,
      eventId,
    });
  } catch (error) {
    console.error("❌ Register Individual Error:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
};

// GET MY REGISTRATIONS
export const getMyRegistrations = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const registrations = await IndividualRegistration.find({ userId })
      .populate("eventId")
      .exec();

    const transformedData = registrations
      .map((reg: any) => {
        if (!reg.eventId) return null; // skip null events
        return {
          _id: reg._id,
          event: {
            _id: reg.eventId._id,
            title: reg.eventId.title,
            description: reg.eventId.description,
            date: reg.eventId.date,
            location: reg.eventId.location,
            detail: reg.eventId.detail,
            registrationType: reg.eventId.registrationType,
            image: reg.eventId.image,
            examSchedules: reg.eventId.examSchedules,
          },
          fullname: reg.fullname,
          grade: reg.grade,
          school: reg.school,
          phone: reg.phone,
          email: reg.email,
          status: reg.status,
          slipUrl: reg.slipUrl,
          certificateUrl: reg.certificateUrl,
          userCode: reg.userCode,
          registrationId: reg._id,
          createdAt: reg.createdAt,
        };
      })
      .filter(Boolean);

    res.json(transformedData);
  } catch (error) {
    console.error("getMyRegistrations error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// UPLOAD SLIP
export const uploadSlipToIndividualRegistration = async (req: CustomRequest, res: Response) => {
  try {
    const registrationId = req.params.id;
    const userId = req.user?.id;
    const slipPath = req.file?.path;

    if (!slipPath) return res.status(400).json({ message: "❌ ไม่พบไฟล์ slip" });

    const registration = await IndividualRegistration.findOneAndUpdate(
      { _id: registrationId, userId },
      { slipUrl: slipPath, status: "slip_uploaded" },
      { new: true }
    ).populate("eventId");

    if (!registration) return res.status(404).json({ message: "❌ ไม่พบการลงทะเบียน" });

    res.status(200).json({
      message: "📤 อัปโหลดสลิปสำเร็จและรอตรวจสอบจากแอดมิน",
      registration,
    });
  } catch (err) {
    console.error("❌ uploadSlip error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
};
