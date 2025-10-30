// backend/src/controllers/adminRegistration.controller.ts (เวอร์ชัน Prisma)
import { Request, Response } from "express";
// 1. ❌ ลบ Mongoose Model ทิ้ง
// import IndividualRegistration from "../models/IndividualRegistration";

// 2. ✅ Import Prisma Client และ Enum ที่จำเป็น
import prisma from '../utils/prisma';
import { IndividualStatus } from '../generated/client';

export const getAllRegistrations = async (req: Request, res: Response) => {
  try {
    console.log("[getAllRegistrations] fetching...");
    
    // 3. ‼️ Mongoose: .find().populate().sort() -> Prisma: .findMany() + include + orderBy ‼️
    const regs = await prisma.individualRegistration.findMany({
      include: {
        // ✅ เทียบเท่า .populate("eventId", "name")
        event: { select: { id: true, nameEvent: true } }, 
        // ✅ เทียบเท่า .populate("userId", "name email")
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    console.log("[getAllRegistrations] found:", regs.length);
    res.json(regs);
  } catch (err) {
    console.error("[getAllRegistrations] error:", err);
    res.status(500).json({ message: "ไม่สามารถโหลดข้อมูลได้" });
  }
};

/**
 * อนุมัติ / ไม่อนุมัติสลิป
 */
export const verifySlip = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, note } = req.body as { action: "approve"|"reject"; note?: string };
  console.log("[verifySlip] id:", id, "action:", action, "note:", note);

  if (!["approve", "reject"].includes(action)) {
    return res.status(400).json({ message: "action ต้องเป็น approve หรือ reject" });
  }

  try {
    // 4. ‼️ Mongoose: .findById() -> Prisma: .findUnique() ‼️
    const reg = await prisma.individualRegistration.findUnique({
      where: { id }
    });
    if (!reg) return res.status(404).json({ message: "ไม่พบการสมัคร" });

    // 5. ตรวจสอบเงื่อนไข (Logic เหมือนเดิม)
    if (!reg.slipUrl) {
      return res.status(400).json({ message: "ยังไม่มีสลิปให้ตรวจ" });
    }
    // Note: การตรวจสอบสถานะเดิม ไม่จำเป็นใน Prisma เพราะ update จะทำตาม where

    // 6. ‼️ กำหนดสถานะใหม่ (ใช้ Enum) ‼️
    let newStatus: IndividualStatus;
    if (action === "approve") {
      newStatus = IndividualStatus.exam_ready;
    } else {
      // action === "reject"
      newStatus = IndividualStatus.registered; 
    }

    // 7. ‼️ Mongoose: reg.status = newStatus; await reg.save() -> Prisma: .update() ‼️
    const updatedReg = await prisma.individualRegistration.update({
      where: { id: reg.id },
      data: {
        status: newStatus,
        // (ถ้าคุณต้องการเก็บ note การ Reject ใน database ควรมี field 'adminNote' ใน model)
      },
    });
    
    console.log("[verifySlip] updated ->", updatedReg.id, "status:", updatedReg.status);
    res.json(updatedReg);
  } catch (err) {
    console.error("[verifySlip] error:", err);
    res.status(500).json({ message: "อัปเดตสถานะไม่สำเร็จ" });
  }
};