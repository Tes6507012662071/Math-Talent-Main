import path from "path";
import { Request, Response } from "express";
import fs from "fs";
import prisma from '../utils/prisma';
import { IndividualStatus } from '../generated/client'; 


const GRADE_TO_LL: Record<string, string> = {
  "ประถมศึกษาตอนปลาย": "01",
  "มัธยมศึกษาตอนต้น": "02",
  "มัธยมศึกษาตอนปลาย": "03",
};


export const registerIndividual = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { eventId, fullname, grade, school, station: stationName, phone, email } = req.body;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { stations: true }, 
    });
    if (!event) return res.status(404).json({ message: "Event not found" });

    const selectedStation = event.stations.find((s) => s.stationName === stationName);
    if (!selectedStation) {
      return res.status(400).json({ message: "ไม่พบศูนย์สอบที่เลือก" });
    }

    if (!event.levels || !Array.isArray(event.levels) || !(event.levels as string[]).includes(grade)) {
         return res.status(400).json({ message: "ระดับชั้นที่เลือก ไม่ได้เปิดสอบในกิจกรรมนี้" });
    }
    const LL = GRADE_TO_LL[grade];
    if (!LL) return res.status(400).json({ message: "Invalid grade" });

    const YY = String(new Date(event.dateAndTime).getFullYear()).slice(-2);
    const SS = String(selectedStation.code).padStart(2, "0");

    const count = await prisma.individualRegistration.count({
      where: { eventId: eventId },
    });
    const CCCC = String(count + 1).padStart(4, "0");

    const userCode = `${YY}${SS}${LL}${CCCC}`;
    const adminCode = `${event.code}${userCode}`;

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

export const getMyRegistrations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

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
    
    res.json(registrations); 

  } catch (error) {
    console.error("getMyRegistrations error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const uploadSlipToIndividualRegistration = async (req: Request, res: Response) => {
  try {
    const registrationId = req.params.id; 
    const userId = (req as any).user?.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "❌ ไม่พบไฟล์ slip" });
    }
    
    const slipUrl = `/api-uploads/slips/${file.filename}`; 

    console.log("📥 Uploaded file:", req.file);
    console.log("🌐 Slip URL saved:", slipUrl);

    const registration = await prisma.individualRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration || registration.userId !== userId) {
      if (file) fs.unlinkSync(file.path); 
      return res.status(404).json({ message: "❌ ไม่พบการลงทะเบียน หรือไม่มีสิทธิ์" });
    }
    
    const updatedRegistration = await prisma.individualRegistration.update({
      where: { id: registrationId },
      data: {
        slipUrl: slipUrl,
        status: IndividualStatus.slip_uploaded, 
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