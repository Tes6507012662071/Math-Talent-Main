import path from "path";
import { Request, Response } from "express";
// 1. ❌ ลบ Mongoose Models
// import IndividualRegistration from "../models/IndividualRegistration";
// import Event, { IStation } from "../models/Event";
import fs from "fs";
// 2. ❌ ลบ Multer ออกจาก Controller
// import multer from "multer"; 

// 3. ✅ Import Prisma Client และ Enum ที่จำเป็น
import prisma from '../utils/prisma';
import { IndividualStatus } from '../generated/client'; 

// 4. ❌ ลบ Logic ของ Multer เก่าทั้งหมด ❌
// const uploadFolder = path.join(__dirname, "../../uploads/slips");
// ...
// export const uploadSlipMiddleware = multer({ storage });
// ---

// Mapping ระดับชั้น (เหมือนเดิม)
const GRADE_TO_LL: Record<string, string> = {
  "ประถมศึกษาตอนปลาย": "01",
  "มัธยมศึกษาตอนต้น": "02",
  "มัธยมศึกษาตอนปลาย": "03",
};

// REGISTER INDIVIDUAL
export const registerIndividual = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { eventId, fullname, grade, school, station: stationName, phone, email } = req.body;

    // 1. ดึง event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { stations: true }, 
    });
    if (!event) return res.status(404).json({ message: "Event not found" });

    // 2. ตรวจสอบ station
    const selectedStation = event.stations.find((s) => s.stationName === stationName);
    if (!selectedStation) {
      return res.status(400).json({ message: "ไม่พบศูนย์สอบที่เลือก" });
    }

    // 3. ตรวจสอบระดับชั้น
    // ‼️ [แก้ไข] ตรวจสอบกับ Levels ที่เราเพิ่มมาใหม่ใน Event ‼️
    if (!event.levels || !Array.isArray(event.levels) || !(event.levels as string[]).includes(grade)) {
         return res.status(400).json({ message: "ระดับชั้นที่เลือก ไม่ได้เปิดสอบในกิจกรรมนี้" });
    }
    const LL = GRADE_TO_LL[grade];
    if (!LL) return res.status(400).json({ message: "Invalid grade" });

    // 4. ดึงปี (Logic เหมือนเดิม)
    const YY = String(new Date(event.dateAndTime).getFullYear()).slice(-2);
    // 5. รหัสศูนย์สอบ (Logic เหมือนเดิม)
    const SS = String(selectedStation.code).padStart(2, "0");

    // 6. ลำดับการสมัคร (Prisma)
    const count = await prisma.individualRegistration.count({
      where: { eventId: eventId },
    });
    const CCCC = String(count + 1).padStart(4, "0");

    // 7. สร้างรหัส (Logic เหมือนเดิม)
    const userCode = `${YY}${SS}${LL}${CCCC}`;
    const adminCode = `${event.code}${userCode}`;

    // 8. บันทึก (Prisma)
    const newRegistration = await prisma.individualRegistration.create({
      data: {
        fullname, grade, school, phone, email,
        status: IndividualStatus.registered,
        userCode, adminCode, stationName,
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

    // 5. ‼️ [แก้ไข] ดึงข้อมูลและส่งกลับไปตรงๆ (ไม่แปลง) ‼️
    const registrations = await prisma.individualRegistration.findMany({
      where: { userId: userId },
      include: {
        event: { 
          include: {
            stations: true 
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // 6. ‼️ ส่งข้อมูลดิบจาก Prisma กลับไป ‼️
    // (Frontend (Profile.tsx) จะจัดการ Type `EventStatus` เอง)
    res.json(registrations); 

  } catch (error) {
    console.error("getMyRegistrations error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// UPLOAD SLIP
export const uploadSlipToIndividualRegistration = async (req: Request, res: Response) => {
  try {
    const registrationId = req.params.id; // ‼️ (รับจาก Path :id) ‼️
    const userId = (req as any).user?.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "❌ ไม่พบไฟล์ slip" });
    }
    
    // 7. ‼️ [แก้ไข] ใช้ Path ใหม่ที่ถูกต้อง ‼️
    const slipUrl = `/api-uploads/slips/${file.filename}`; 

    console.log("📥 Uploaded file:", req.file);
    console.log("🌐 Slip URL saved:", slipUrl);

    // (เช็กสิทธิ์ก่อน)
    const registration = await prisma.individualRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration || registration.userId !== userId) {
      if (file) fs.unlinkSync(file.path); // (ลบไฟล์ที่อัปโหลดทิ้ง)
      return res.status(404).json({ message: "❌ ไม่พบการลงทะเบียน หรือไม่มีสิทธิ์" });
    }
    
    // (อัปเดต)
    const updatedRegistration = await prisma.individualRegistration.update({
      where: { id: registrationId },
      data: {
        slipUrl: slipUrl,
        status: IndividualStatus.slip_uploaded, // ✅ ใช้ Enum
      },
      include: { event: true }, 
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

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });
    if (!event) return res.status(404).json({ message: "ไม่พบกิจกรรม" });

    const applicants = await prisma.individualRegistration.findMany({
      where: { eventId: eventId },
      orderBy: { createdAt: 'asc' } 
    });

    // (Map ข้อมูลสำหรับหน้า Admin)
    const result = applicants.map(a => ({
      id: a.id, 
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

    if (!Object.values(IndividualStatus).includes(status as IndividualStatus)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updated = await prisma.individualRegistration.update({
      where: { id: registrationId },
      data: {
        status: status as IndividualStatus, 
      },
      include: { 
        user: {
          select: {
            name: true, 
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