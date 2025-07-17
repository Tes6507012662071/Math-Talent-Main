import { Request, Response } from 'express';
import IndividualRegistration from '../models/IndividualRegistration';

export const registerIndividual = async (req: Request, res: Response) => {
  try {
    const { eventId, fullname, grade, school, phone, email, note } = req.body;

    const newRegistration = new IndividualRegistration({
      eventId,
      fullname,
      grade,
      school,
      phone,
      email,
      note,
    });

    await newRegistration.save();

    res.status(201).json({ success: true, message: "ลงทะเบียนเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("❌ Register Individual Error:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
};
