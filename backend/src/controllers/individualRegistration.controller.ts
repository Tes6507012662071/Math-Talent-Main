import { Request, Response } from 'express';
import IndividualRegistration from '../models/IndividualRegistration';

interface CustomRequest extends Request {
  user?: { id: string };
}

export const registerIndividual = async (req: Request, res: Response) => {
  try {
    console.log("✅ registerIndividual called");
    console.log("📦 req.body:", req.body);

    // 👇 Ensure req.user is available (คุณต้องใช้ authMiddleware ด้วย)
    const customReq = req as CustomRequest;
    const userId = customReq.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    console.log("🔑 User ID from token:", userId);
    
    const { eventId, fullname, grade, school, phone, email, note } = req.body;

    const newRegistration = new IndividualRegistration({
      eventId,
      fullname,
      grade,
      school,
      phone,
      email,
      note,
      userId, // ✅ ใส่ userId ลงไป
    });

    await newRegistration.save();
    
    console.log("✅ Registration saved");

    res.status(201).json({ success: true, message: "ลงทะเบียนเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("❌ Register Individual Error:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
};
