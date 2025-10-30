import path from "path";
import { Request, Response } from "express";
// 1. ❌ ลบ Mongoose Models
// import IndividualRegistration from "../models/IndividualRegistration";
// import Event, { IStation } from "../models/Event";
import fs from "fs";
import multer from "multer";

// 2. ✅ Import Prisma Client และ Enum ที่จำเป็น
import prisma from '../utils/prisma';
import { IndividualStatus } from '../generated/client'; // Import Enum ที่เราสร้าง

// --- 🔽 ไม่ต้องแก้ 🔽 (Multer ไม่เกี่ยวกับ Database) ---
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
// --- 🔼 ไม่ต้องแก้ 🔼 ---

// Mapping ระดับชั้น (เหมือนเดิม)
const GRADE_TO_LL: Record<string, string> = {
  "ประถมศึกษาตอนปลาย": "01",
  "มัธยมศึกษาตอนต้น": "02",
  "มัธยมศึกษาตอนปลาย": "03",
};

// REGISTER INDIVIDUAL
export const registerIndividual = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id; // (อาจต้องปรับ Type 'any')
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { eventId, fullname, grade, school, station: stationName, phone, email } = req.body;

    // 1. ‼️ ดึง event (เปลี่ยนเป็น Prisma) ‼️
    //    (เราต้อง include 'stations' มาด้วยเพื่อใช้ตรวจสอบ)
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { stations: true }, // ✅ เทียบเท่า .populate('stations')
    });
    if (!event) return res.status(404).json({ message: "Event not found" });

    // 2. ตรวจสอบ station (Logic เหมือนเดิม)
    const selectedStation = event.stations.find((s) => s.stationName === stationName);
    if (!selectedStation) {
      return res.status(400).json({ message: "ไม่พบศูนย์สอบที่เลือก" });
    }

    // 3. ตรวจสอบระดับชั้น (Logic เหมือนเดิม)
    const LL = GRADE_TO_LL[grade];
    if (!LL) return res.status(400).json({ message: "Invalid grade" });

    // 4. ดึงปี (Logic เหมือนเดิม)
    const YY = String(new Date(event.dateAndTime).getFullYear()).slice(-2);

    // 5. รหัสศูนย์สอบ (Logic เหมือนเดิม)
    const SS = String(selectedStation.code).padStart(2, "0");

    // 6. ‼️ ลำดับการสมัคร (เปลี่ยนเป็น Prisma) ‼️
    const count = await prisma.individualRegistration.count({
      where: { eventId: eventId },
    });
    const CCCC = String(count + 1).padStart(4, "0");

    // 7. สร้างรหัส (Logic เหมือนเดิม)
    const userCode = `${YY}${SS}${LL}${CCCC}`;
    const adminCode = `${event.code}${userCode}`;

    // 8. ‼️ บันทึก (เปลี่ยนเป็น Prisma) ‼️
    //    (เปลี่ยนจาก new Model().save() เป็น prisma.create)
    const newRegistration = await prisma.individualRegistration.create({
      data: {
        fullname,
        grade,
        school,
        phone,
        email,
        status: IndividualStatus.registered, // ✅ ใช้ Enum
        userCode,
        adminCode,
        stationName,
        // ✅ สร้างความสัมพันธ์ (Foreign Key)
        event: { connect: { id: eventId } },
        user: { connect: { id: userId } },
      }
    });

    res.status(201).json({
      success: true,
      message: "ลงทะเบียนเรียบร้อยแล้ว",
      userCode: newRegistration.userCode,
    });
  } catch (error) {
    console.error("❌ Register Individual Error:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
};

// GET MY REGISTRATIONS
export const getMyRegistrations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // ‼️ เปลี่ยน .find().populate() เป็น .findMany() + include ‼️
    const registrations = await prisma.individualRegistration.findMany({
      where: { userId: userId },
      include: {
        event: { // ✅ เทียบเท่า .populate("eventId")
          include: {
            stations: true // ✅ Nested include (Mongoose ไม่มี)
          }
        }
      }
    });

    // ‼️ ปรับการ Map ข้อมูล ‼️
    // (Mongoose: reg.eventId.nameEvent | Prisma: reg.event.nameEvent)
    const transformedData = registrations
      .map((reg) => {
        if (!reg.event) return null; // (กันเหนียว)
        return {
          id: reg.id, // ✅ _id -> id
          event: {
            id: reg.event.id,
            title: reg.event.nameEvent,
            description: reg.event.detail,
            date: reg.event.dateAndTime,
            location: reg.event.location,
            detail: reg.event.detail,
            registrationType: reg.event.registrationType,
            image: reg.event.images,
            examSchedules: reg.event.stations, // ✅ ข้อมูล stations ที่เรา include มา
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
          adminCode: reg.adminCode,
          registrationId: reg.id, // ✅ _id -> id
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
    const userId = (req as any).user?.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "❌ ไม่พบไฟล์ slip" });
    }
    // ‼️ (ข้อควรระวัง) การสร้าง URL แบบนี้จะใช้ได้
    //    เฉพาะตอนที่ 'uploadFolder' ถูกเสิร์ฟเป็น Static File
    //    ใน app.ts (เช่น app.use('/uploads', express.static('uploads'))) ‼️
    const slipUrl = `/api-uploads/slips/${file.filename}`; // (แนะนำให้ใช้ Relative path)

    console.log("📥 Uploaded file:", req.file);
    console.log("🌐 Slip URL saved:", slipUrl);

    // ‼️ เปลี่ยน FindOneAndUpdate เป็น Update ‼️
    // (เราต้องเช็กสิทธิ์ก่อน เพื่อความปลอดภัย)
    const registration = await prisma.individualRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration || registration.userId !== userId) {
      // (ถ้าไฟล์ถูกอัปโหลดแล้ว ควรลบไฟล์ทิ้ง)
      if (file) fs.unlinkSync(file.path);
      return res.status(404).json({ message: "❌ ไม่พบการลงทะเบียน หรือไม่มีสิทธิ์" });
    }
    
    // (ถ้าสิทธิ์ถูกต้อง ค่อยอัปเดต)
    const updatedRegistration = await prisma.individualRegistration.update({
      where: { id: registrationId },
      data: {
        slipUrl: slipUrl,
        status: IndividualStatus.slip_uploaded, // ✅ ใช้ Enum
      },
      include: { event: true }, // ✅ เทียบเท่า .populate("eventId")
    });

    res.status(200).json({
      message: "📤 อัปโหลดสลิปสำเร็จและรอตรวจสอบจากแอดมิน",
      registration: updatedRegistration,
    });
  } catch (err) {
    console.error("❌ uploadSlip error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
};

// 🟢 ดึงรายชื่อผู้สมัครตาม event (Admin)
export const getApplicantsByEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    // ‼️ เปลี่ยน Event.findById เป็น prisma.event.findUnique ‼️
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });
    if (!event) return res.status(404).json({ message: "ไม่พบกิจกรรม" });

    // ‼️ เปลี่ยน .find().sort() เป็น .findMany() + orderBy ‼️
    const applicants = await prisma.individualRegistration.findMany({
      where: { eventId: eventId },
      orderBy: { createdAt: 'asc' } // 'asc' = 1
    });

    // (Logic การ map เหมือนเดิม)
    const result = applicants.map(a => ({
      id: a.id, // ✅ _id -> id
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

// อัปเดตสถานะผู้สมัคร (Admin)
export const updateApplicantStatus = async (req: Request, res: Response) => {
  try {
    const { registrationId } = req.params;
    const { status } = req.body;

    // ‼️ (สำคัญ) ตรวจสอบว่า status ที่ส่งมา ถูกต้องตาม Enum ‼️
    if (!Object.values(IndividualStatus).includes(status as IndividualStatus)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // ‼️ เปลี่ยน FindByIdAndUpdate เป็น Update + include ‼️
    const updated = await prisma.individualRegistration.update({
      where: { id: registrationId },
      data: {
        status: status as IndividualStatus, // (Cast type หลังจากเช็กแล้ว)
      },
      include: { // ‼️ .populate("userId", "fullname email") -> (Prisma User Model มี 'name')
        user: {
          select: {
            name: true, // (Mongoose ของคุณใช้ "fullname", Prisma Model เราใช้ "name")
            email: true,
          }
        }
      }
    });

    if (!updated) return res.status(404).json({ message: "ไม่พบผู้สมัคร" });

    res.json({ success: true, registration: updated });
  } catch (error) {
    console.error("❌ updateApplicantStatus error:", error);
    res.status(500).json({ message: "Server error" });
  }
};