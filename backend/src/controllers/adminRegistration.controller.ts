// src/controllers/adminRegistration.controller.ts
import { Request, Response } from "express";
import IndividualRegistration from "../models/IndividualRegistration";

export const getAllRegistrations = async (req: Request, res: Response) => {
  try {
    console.log("[getAllRegistrations] fetching...");
    const regs = await IndividualRegistration
      .find({})
      .populate("eventId", "name")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    console.log("[getAllRegistrations] found:", regs.length);
    res.json(regs);
  } catch (err) {
    console.error("[getAllRegistrations] error:", err);
    res.status(500).json({ message: "ไม่สามารถโหลดข้อมูลได้" });
  }
};

/**
 * อนุมัติ / ไม่อนุมัติสลิป
 * body: { action: "approve" | "reject", note?: string }
 * - approve  => status = "exam_ready"
 * - reject   => status = "registered" (หรือจะคง "slip_uploaded" ก็ได้ ปรับเอา)
 */
export const verifySlip = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, note } = req.body as { action: "approve"|"reject"; note?: string };
  console.log("[verifySlip] id:", id, "action:", action, "note:", note);

  if (!["approve", "reject"].includes(action)) {
    return res.status(400).json({ message: "action ต้องเป็น approve หรือ reject" });
  }

  try {
    const reg = await IndividualRegistration.findById(id);
    if (!reg) return res.status(404).json({ message: "ไม่พบการสมัคร" });

    // ตรวจว่ามีสลิปแล้วหรือยัง
    if (!reg.slipUrl) {
      return res.status(400).json({ message: "ยังไม่มีสลิปให้ตรวจ" });
    }

    // ตรวจสถานะปัจจุบัน (ถ้าต้องการบังคับ workflow)
    if (reg.status !== "slip_uploaded" && action === "approve") {
      console.warn("[verifySlip] current status not slip_uploaded:", reg.status);
      // ไม่บังคับก็ได้ แต่เตือน
    }

    let newStatus = reg.status;
    if (action === "approve") newStatus = "exam_ready";
    if (action === "reject") newStatus = "registered"; // หรือ "slip_uploaded" ถ้าต้องการให้ re-upload

    reg.status = newStatus as any;

    await reg.save();
    console.log("[verifySlip] updated ->", reg._id, "status:", reg.status);
    res.json(reg);
  } catch (err) {
    console.error("[verifySlip] error:", err);
    res.status(500).json({ message: "อัปเดตสถานะไม่สำเร็จ" });
  }
};
