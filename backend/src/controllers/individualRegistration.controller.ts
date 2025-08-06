import { Request, Response } from 'express';
import IndividualRegistration from '../models/IndividualRegistration';

interface CustomRequest extends Request {
  user?: { id: string };
}

export const registerIndividual = async (req: Request, res: Response) => {
  try {
    console.log("✅ registerIndividual called");
    console.log("📦 req.body:", req.body);

    const customReq = req as CustomRequest;
    const userId = customReq.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    console.log("🔑 User ID from token:", userId);
    
    const { eventId, fullname, grade, school, phone, email, note } = req.body;
    console.log("eventId from req.body:", eventId);

    const newRegistration = new IndividualRegistration({
      eventId,
      fullname,
      grade,
      school,
      phone,
      email,
      note,
      userId,
      status: "registered", // ✅ Default status
    });

    await newRegistration.save();
    
    console.log("✅ Registration saved");

    res.status(201).json({ success: true, message: "ลงทะเบียนเรียบร้อยแล้ว", eventId });
  } catch (error) {
    console.error("❌ Register Individual Error:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
};

export const getMyRegistrations = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const registrations = await IndividualRegistration.find({ userId })
      .populate("eventId")
      .exec();
    
    // ✅ Transform the data to match frontend expectations
    const transformedData = registrations.map((reg: any) => ({
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
        examSchedules: reg.eventId.examSchedules
      },
      // Registration details
      fullname: reg.fullname,
      grade: reg.grade,
      school: reg.school,
      phone: reg.phone,
      email: reg.email,
      note: reg.note,
      // Status info (now from same model)
      status: reg.status,
      slipUrl: reg.slipUrl,
      certificateUrl: reg.certificateUrl,
      registrationId: reg._id, // Use the same ID for uploads
      createdAt: reg.createdAt
    }));
    
    res.json(transformedData);
  } catch (error) {
    console.error("getMyRegistrations error:", error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ NEW: Upload slip directly to IndividualRegistration
export const uploadSlipToIndividualRegistration = async (req: CustomRequest, res: Response) => {
  try {
    const registrationId = req.params.id;
    const userId = req.user?.id;
    const slipPath = req.file?.path;

    console.log("📥 uploadSlip called:", { registrationId, userId, slipPath });

    if (!slipPath) {
      return res.status(400).json({ message: "❌ ไม่พบไฟล์ slip" });
    }

    // ✅ Update IndividualRegistration directly
    const registration = await IndividualRegistration.findOneAndUpdate(
      { _id: registrationId, userId: userId },
      { slipUrl: slipPath, status: "slip_uploaded" },
      { new: true }
    ).populate("eventId");

    if (!registration) {
      return res.status(404).json({ message: "❌ ไม่พบการลงทะเบียน" });
    }

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