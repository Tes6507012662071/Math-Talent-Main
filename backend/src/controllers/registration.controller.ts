// controllers/registrationController.ts
import { Request, Response } from "express";
import Registration from "../models/Registration";
import IndividualRegistration from '../models/IndividualRegistration';

interface CustomRequest extends Request {
  user?: { id: string }; // เพิ่มจาก middleware
}



export const uploadSlip = async (req: CustomRequest, res: Response) => {
  try {
    const eventId = req.params.id; // คือ eventId จริง ๆ
    const userId = req.user?.id; // มาจาก middleware
    const slipPath = req.file?.path;

    if (!slipPath) {
      return res.status(400).json({ message: "ไม่พบไฟล์ slip" });
    }

    const registration = await Registration.findOneAndUpdate(
      { eventId, userId },
      { slipUrl: slipPath, status: "pending" },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({ message: "ไม่พบข้อมูลการสมัคร" });
    }
    
    res.status(200).json({
      message: "อัปโหลดสลิปสำเร็จและรอยืนยันจากแอดมิน",
      registration,
    });

    res.status(200).json({ message: "อัปโหลด slip สำเร็จ", registration });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

