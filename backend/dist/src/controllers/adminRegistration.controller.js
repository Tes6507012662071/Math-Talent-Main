"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySlip = exports.getAllRegistrations = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const client_1 = require("../generated/client");
const getAllRegistrations = async (req, res) => {
    try {
        console.log("[getAllRegistrations] fetching...");
        const regs = await prisma_1.default.individualRegistration.findMany({
            include: {
                event: { select: { id: true, nameEvent: true } },
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        console.log("[getAllRegistrations] found:", regs.length);
        res.json(regs);
    }
    catch (err) {
        console.error("[getAllRegistrations] error:", err);
        res.status(500).json({ message: "ไม่สามารถโหลดข้อมูลได้" });
    }
};
exports.getAllRegistrations = getAllRegistrations;
const verifySlip = async (req, res) => {
    const { id } = req.params;
    const { action, note } = req.body;
    console.log("[verifySlip] id:", id, "action:", action, "note:", note);
    if (!["approve", "reject"].includes(action)) {
        return res.status(400).json({ message: "action ต้องเป็น approve หรือ reject" });
    }
    try {
        const reg = await prisma_1.default.individualRegistration.findUnique({
            where: { id }
        });
        if (!reg)
            return res.status(404).json({ message: "ไม่พบการสมัคร" });
        if (!reg.slipUrl) {
            return res.status(400).json({ message: "ยังไม่มีสลิปให้ตรวจ" });
        }
        let newStatus;
        if (action === "approve") {
            newStatus = client_1.IndividualStatus.exam_ready;
        }
        else {
            newStatus = client_1.IndividualStatus.registered;
        }
        const updatedReg = await prisma_1.default.individualRegistration.update({
            where: { id: reg.id },
            data: {
                status: newStatus,
            },
        });
        console.log("[verifySlip] updated ->", updatedReg.id, "status:", updatedReg.status);
        res.json(updatedReg);
    }
    catch (err) {
        console.error("[verifySlip] error:", err);
        res.status(500).json({ message: "อัปเดตสถานะไม่สำเร็จ" });
    }
};
exports.verifySlip = verifySlip;
