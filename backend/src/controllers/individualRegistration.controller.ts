import path from "path";
import { Request, Response } from "express";
import IndividualRegistration from "../models/IndividualRegistration";
import Event, { IStation } from "../models/Event";
import fs from "fs";
import multer from "multer";

const uploadFolder = path.join(__dirname, "../../uploads/slips");
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const uploadSlipMiddleware = multer({ storage });

// Mapping ระดับชั้น → รหัส 2 หลัก
const GRADE_TO_LL: Record<string, string> = {
  "ประถมศึกษาตอนปลาย": "01",
  "มัธยมศึกษาตอนต้น": "02",
  "มัธยมศึกษาตอนปลาย": "03",
};

// REGISTER INDIVIDUAL
export const registerIndividual = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { eventId, fullname, grade, school, station: stationName, phone, email } = req.body;

    // 1. ดึง event
    const event = await Event.findById(eventId).lean();
    if (!event) return res.status(404).json({ message: "Event not found" });

    // 2. ตรวจสอบ station
    const selectedStation = event.stations.find((s: IStation) => s.stationName === stationName);
    if (!selectedStation) {
      return res.status(400).json({ message: "ไม่พบศูนย์สอบที่เลือก" });
    }

    // 3. ตรวจสอบระดับชั้น
    const LL = GRADE_TO_LL[grade];
    if (!LL) return res.status(400).json({ message: "Invalid grade" });

    // 4. ดึงปีจาก event.dateAndTime
    const YY = String(new Date(event.dateAndTime).getFullYear()).slice(-2);

    // 5. รหัสศูนย์สอบ (2 หลัก)
    const SS = String(selectedStation.code).padStart(2, "0");

    // 6. ลำดับการสมัคร (4 หลัก) — นับเฉพาะ event นี้
    const count = await IndividualRegistration.countDocuments({ eventId });
    const CCCC = String(count + 1).padStart(4, "0");

    // 7. สร้างรหัส
    const userCode = `${YY}${SS}${LL}${CCCC}`;
    const adminCode = `${event.code}${userCode}`; // เช่น "012503030012"

    // 8. บันทึก
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
      adminCode, // ✅ เก็บไว้
      stationName, // ✅ เก็บชื่อศูนย์สอบที่เลือก
    });

    await newRegistration.save();

    res.status(201).json({
      success: true,
      message: "ลงทะเบียนเรียบร้อยแล้ว",
      userCode, // ✅ ส่งให้ user เห็น
    });
  } catch (error) {
    console.error("❌ Register Individual Error:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
};

// GET MY REGISTRATIONS
export const getMyRegistrations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const registrations = await IndividualRegistration.find({ userId })
      .populate("eventId")
      .exec();

    const transformedData = registrations
      .map((reg: any) => {
        if (!reg.eventId) return null;
        return {
          _id: reg._id,
          event: {
            _id: reg.eventId._id,
            title: reg.eventId.nameEvent, // ✅ nameEvent แทน title
            description: reg.eventId.detail, // ✅ detail แทน description
            date: reg.eventId.dateAndTime, // ✅ dateAndTime แทน date
            location: reg.eventId.location,
            detail: reg.eventId.detail,
            registrationType: reg.eventId.registrationType,
            image: reg.eventId.images, // ✅ images แทน image
            examSchedules: reg.eventId.stations, // ✅ stations แทน examSchedules
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
          adminCode: reg.adminCode, // ✅ เพิ่ม (เฉพาะ admin ใช้)
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
export const uploadSlipToIndividualRegistration = async (req: Request, res: Response) => {
  try {
    const registrationId = req.params.id;
    const userId = req.user?.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "❌ ไม่พบไฟล์ slip" });
    }
    const slipUrl = `${req.protocol}://${req.get("host")}/uploads/slips/${file.filename}`;

    console.log("📥 Uploaded file:", req.file);
    console.log("🌐 Slip URL saved:", slipUrl);
    
    const registration = await IndividualRegistration.findOneAndUpdate(
      { _id: registrationId, userId },
      { slipUrl, status: "slip_uploaded" },
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

// 🟢 ดึงรายชื่อผู้สมัครตาม event
export const getApplicantsByEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "ไม่พบกิจกรรม" });

    const applicants = await IndividualRegistration.find({ eventId }).sort({ createdAt: 1 });

    const result = applicants.map(a => ({
      _id: a._id,
      userCode: a.userCode,
      fullname: a.fullname,
      email: a.email,
      status: a.status,
      slipUrl: a.slipUrl,
    }));

    console.log("Sending applicants:", result);
    res.json({ eventName: event.nameEvent, applicants: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// อัปเดตสถานะผู้สมัคร
export const updateApplicantStatus = async (req: Request, res: Response) => {
  try {
    const { registrationId } = req.params;
    const { status } = req.body;

    const updated = await IndividualRegistration.findByIdAndUpdate(
      registrationId,
      { status },
      { new: true }
    ).populate("userId", "fullname email");

    if (!updated) return res.status(404).json({ message: "ไม่พบผู้สมัคร" });

    res.json({ success: true, registration: updated });
  } catch (error) {
    console.error("❌ updateApplicantStatus error:", error);
    res.status(500).json({ message: "Server error" });
  }
};