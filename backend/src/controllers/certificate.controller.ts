import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import Certificate from "../models/Certificate";
import IndividualRegistration from "../models/IndividualRegistration";

const CERT_FOLDER = path.join(__dirname, "../../uploads/certificates");

// อัปโหลดหลายไฟล์ PDF
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
      // ✅ รองรับทั้งแบบ 250101001_Test.pdf และ 250101001.pdf
      const match = file.originalname.match(/^(\d+)/);
      if (!match) continue;

      const userCode = match[1];

      // ✅ path สำหรับเก็บใน DB
      const certificateUrl = `/uploads/certificates/${eventId}/${file.originalname}`;

      // ✅ upsert ใส่ eventId ด้วย
      const cert = await Certificate.findOneAndUpdate(
        { userCode, eventId },
        {
          userCode,
          eventId,
          certificateUrl,
          uploadedAt: new Date(),
        },
        { upsert: true, new: true }
      );

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

    const registration = await IndividualRegistration.findOne({ userCode, eventId });
    if (!registration) return res.status(404).json({ message: "❌ ไม่พบข้อมูลการลงทะเบียน" });

    if (registration.status !== "completed") {
      return res.status(403).json({ message: "❌ Certificate ยังไม่พร้อมดาวน์โหลด" });
    }

    const cert = await Certificate.findOne({ userCode, eventId });
    if (!cert) return res.status(404).json({ message: "❌ ไม่พบ Certificate" });

    // ✅ ใช้ path.resolve ป้องกัน path error
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


// 📌 ดึงรายชื่อผู้ที่มี Certificate แล้วตาม EventId
export const getCertificatesByEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({ message: "กรุณาระบุ eventId" });
    }

    const certificates = await Certificate.find({ eventId }).sort({ uploadedAt: -1 });

    return res.status(200).json({
      message: "✅ ดึงข้อมูล Certificate สำเร็จ",
      data: certificates,
    });
  } catch (error) {
    console.error("❌ getCertificatesByEvent error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};
