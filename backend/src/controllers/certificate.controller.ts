import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import prisma from '../utils/prisma';
import { IndividualStatus } from '../generated/client'; 

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
      const match = file.originalname.match(/^(\d+)/);
      if (!match) continue;

      const userCode = match[1];

      const certificateUrl = `/api-uploads/certificates/${eventId}/${file.originalname}`;

      const cert = await prisma.certificate.upsert({
        where: {
          userCode_eventId: { userCode, eventId } as any 
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

      savedCertificates.push(cert);
    }

    return res.status(200).json({
      message: "✅ อัปโหลด Certificate สำเร็จ",
      data: savedCertificates,
    });
  } catch (error) {
    console.error("❌ uploadCertificates error:", error);

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

    const registration = await prisma.individualRegistration.findFirst({
      where: { userCode, eventId }
    });
    if (!registration) return res.status(404).json({ message: "❌ ไม่พบข้อมูลการลงทะเบียน" });

    if (registration.status !== IndividualStatus.completed) {
      return res.status(403).json({ message: "❌ Certificate ยังไม่พร้อมดาวน์โหลด" });
    }

    const cert = await prisma.certificate.findFirst({
      where: { userCode, eventId }
    });
    if (!cert) return res.status(404).json({ message: "❌ ไม่พบ Certificate" });

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


export const getCertificatesByEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({ message: "กรุณาระบุ eventId" });
    }

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