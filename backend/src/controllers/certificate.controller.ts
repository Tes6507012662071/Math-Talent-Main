import { Request, Response } from "express";
import path from "path";
import fs from "fs";
// 1. ❌ ลบ Mongoose Models
// import Certificate from "../models/Certificate";
// import IndividualRegistration from "../models/IndividualRegistration";

// 2. ✅ Import Prisma Client และ Enum ที่จำเป็น
import prisma from '../utils/prisma';
import { IndividualStatus } from '../generated/client'; // ใช้ Enum สถานะ

// 3. ❌ ลบ CERT_FOLDER ออก (ไม่ได้ใช้ใน Controller นี้)
// const CERT_FOLDER = path.join(__dirname, "../../uploads/certificates");

// อัปโหลดหลายไฟล์ PDF (Admin)
export const uploadCertificates = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: "กรุณาระบุ eventId" });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "กรุณาอัปโหลดไฟล์ PDF อย่างน้อย 1 ไฟล์" });
    }

    const savedCertificates = [];

    for (const file of files) {
      // ✅ รองรับทั้งแบบ 250101001_Test.pdf และ 250101001.pdf (Logic เหมือนเดิม)
      const match = file.originalname.match(/^(\d+)/);
      if (!match) continue;

      const userCode = match[1];

      // ✅ path สำหรับเก็บใน DB (Logic เหมือนเดิม)
      // (ต้องมั่นใจว่า path นี้ตรงกับ Multer ที่ใช้ในการอัปโหลด)
      const certificateUrl = `/api-uploads/certificates/${eventId}/${file.originalname}`;

      // 4. ‼️ Mongoose: findOneAndUpdate({ upsert: true }) -> Prisma: .upsert() ‼️
      const cert = await prisma.certificate.upsert({
        where: {
          // Prisma ต้องการ Unique Key สำหรับ upsert, เราต้องสร้าง Composite Unique Key ในที่นี้
          // NOTE: เนื่องจากเราไม่ได้สร้าง @@unique([userCode, eventId]) ใน schema.prisma
          //       เราต้องสร้างเงื่อนไขที่ unique จริงๆ หรือใช้วิธี 'try/catch create'
          //       แต่ตอนนี้เราจะใช้เทคนิคหาอันที่มีอยู่จริง:
          userCode_eventId: { userCode, eventId } as any // ‼️ NOTE: ต้องเพิ่ม @@unique([userCode, eventId]) ใน Certificate model ก่อน
        },
        update: {
          certificateUrl: certificateUrl,
          uploadedAt: new Date(),
        },
        create: {
          userCode: userCode,
          eventId: eventId,
          certificateUrl: certificateUrl,
          uploadedAt: new Date(),
        },
      });

      // 5. ‼️ (Optional: Update status ใน Registration) ‼️
      //    (โค้ดเดิมของคุณไม่ได้ทำ แต่ถ้าอยากให้สถานะเปลี่ยนตาม ควรเพิ่มโค้ดนี้)
      // await prisma.individualRegistration.updateMany({
      //   where: { userCode, eventId },
      //   data: { status: IndividualStatus.completed }
      // });
      
      savedCertificates.push(cert);
    }

    return res.status(200).json({
      message: "✅ อัปโหลด Certificate สำเร็จ",
      data: savedCertificates,
    });
  } catch (error) {
    console.error("❌ uploadCertificates error:", error);
    // ‼️ (สำคัญ) ถ้าเกิด Error ที่ Unique Constraint (P2002) จะต้องจัดการ
    return res.status(500).json({ message: "Server error", error });
  }
};


export const downloadCertificate = async (req: Request, res: Response) => {
  try {
    const { userCode, eventId } = req.params;

    console.log("📥 Download request:", { eventId, userCode }); 

    if (!userCode || !eventId) {
      return res.status(400).json({ message: "กรุณาระบุ userCode และ eventId" });
    }

    // 6. ‼️ Mongoose: findOne -> Prisma: findFirst
    //    (ใช้ findFirst เพราะเราไม่ได้สร้าง Unique Key ที่นี่)
    const registration = await prisma.individualRegistration.findFirst({
      where: { userCode, eventId }
    });
    if (!registration) return res.status(404).json({ message: "❌ ไม่พบข้อมูลการลงทะเบียน" });

    // 7. ตรวจสอบสถานะ (Logic เหมือนเดิม)
    if (registration.status !== IndividualStatus.completed) {
      return res.status(403).json({ message: "❌ Certificate ยังไม่พร้อมดาวน์โหลด" });
    }

    // 8. Mongoose: findOne -> Prisma: findFirst
    const cert = await prisma.certificate.findFirst({
      where: { userCode, eventId }
    });
    if (!cert) return res.status(404).json({ message: "❌ ไม่พบ Certificate" });

    // 9. การจัดการไฟล์ (Logic เหมือนเดิม)
    // ‼️ (ข้อควรระวัง: ต้องมั่นใจว่า path นี้ถูกต้องใน Production) ‼️
    const filePath = path.resolve(`.${cert.certificateUrl}`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "❌ ไม่พบไฟล์ Certificate" });
    }

    return res.download(filePath, `${userCode}_Certificate.pdf`);
  } catch (error) {
    console.error("❌ downloadCertificate error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};


// 📌 ดึงรายชื่อผู้ที่มี Certificate แล้วตาม EventId (Admin)
export const getCertificatesByEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({ message: "กรุณาระบุ eventId" });
    }

    // 10. ‼️ Mongoose: find().sort() -> Prisma: findMany() + orderBy
    const certificates = await prisma.certificate.findMany({
      where: { eventId },
      orderBy: { uploadedAt: 'desc' }
    });

    return res.status(200).json({
      message: "✅ ดึงข้อมูล Certificate สำเร็จ",
      data: certificates,
    });
  } catch (error) {
    console.error("❌ getCertificatesByEvent error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};