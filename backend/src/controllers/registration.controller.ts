// controllers/registrationController.ts
import { Request, Response } from "express";
import Registration from "../models/Registration";

export const uploadSlip = async (req: Request, res: Response) => {
  try {
    const registrationId = req.params.id;
    const slipPath = req.file?.path;

    if (!slipPath) {
      return res.status(400).json({ message: "ไม่พบไฟล์ slip" });
    }

    const registration = await Registration.findByIdAndUpdate(
      registrationId,
      { slipUrl: slipPath, status: "slip_uploaded" },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({ message: "ไม่พบข้อมูลการสมัคร" });
    }

    res.status(200).json({ message: "อัปโหลด slip สำเร็จ", registration });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};
