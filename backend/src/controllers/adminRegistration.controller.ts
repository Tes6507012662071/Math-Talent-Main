import { Request, Response } from "express";
import prisma from '../utils/prisma';
import { IndividualStatus } from '../generated/client';

export const getAllRegistrations = async (req: Request, res: Response) => {
  try {
    console.log("[getAllRegistrations] fetching...");
    
    const regs = await prisma.individualRegistration.findMany({
      include: {
        event: { select: { id: true, nameEvent: true } }, 
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

export const verifySlip = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, note } = req.body as { action: "approve"|"reject"; note?: string };
  console.log("[verifySlip] id:", id, "action:", action, "note:", note);

  if (!["approve", "reject"].includes(action)) {
    return res.status(400).json({ message: "action ต้องเป็น approve หรือ reject" });
  }

  try {
    const reg = await prisma.individualRegistration.findUnique({
      where: { id }
    });
    if (!reg) return res.status(404).json({ message: "ไม่พบการสมัคร" });

    if (!reg.slipUrl) {
      return res.status(400).json({ message: "ยังไม่มีสลิปให้ตรวจ" });
    }

    let newStatus: IndividualStatus;
    if (action === "approve") {
      newStatus = IndividualStatus.exam_ready;
    } else {
      newStatus = IndividualStatus.registered; 
    }

    const updatedReg = await prisma.individualRegistration.update({
      where: { id: reg.id },
      data: {
        status: newStatus,
      },
    });
    
    console.log("[verifySlip] updated ->", updatedReg.id, "status:", updatedReg.status);
    res.json(updatedReg);
  } catch (err) {
    console.error("[verifySlip] error:", err);
    res.status(500).json({ message: "อัปเดตสถานะไม่สำเร็จ" });
  }
};