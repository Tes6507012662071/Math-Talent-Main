import { Router, Request, Response } from "express";
import Registration from "../models/Registration";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware";

const router = Router();

// สมัครแบบบุคคล
router.post("/individual", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { eventId, data } = req.body;
    if (!eventId || !data) return res.status(400).json({ message: "Missing fields" });

    const registration = new Registration({
      userId: req.user!.userId,
      eventId,
      registrationType: "individual",
      data,
      status: "pending_payment",
    });
    await registration.save();

    res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// สมัครแบบโรงเรียน (อัปโหลด Excel)
// สำหรับง่าย ๆ ตัวอย่างนี้รับข้อมูล Excel เป็น JSON มาแล้วเก็บเลย (ต่อยอดได้)
router.post("/school", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { eventId, data } = req.body;
    if (!eventId || !data) return res.status(400).json({ message: "Missing fields" });

    const registration = new Registration({
      userId: req.user!.userId,
      eventId,
      registrationType: "school",
      data,
      status: "pending_payment",
    });
    await registration.save();

    res.status(201).json({ message: "School registration successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ดึงข้อมูลสถานะสมัครของ user
router.get("/status", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const registrations = await Registration.find({ userId: req.user!.userId });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
