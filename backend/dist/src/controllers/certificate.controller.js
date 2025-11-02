"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCertificatesByEvent = exports.downloadCertificate = exports.uploadCertificates = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const client_1 = require("../generated/client");
const uploadCertificates = async (req, res) => {
    try {
        const files = req.files;
        const { eventId } = req.body;
        if (!eventId) {
            return res.status(400).json({ message: "กรุณาระบุ eventId" });
        }
        if (!files || files.length === 0) {
            return res.status(400).json({ message: "กรุณาอัปโหลดไฟล์ PDF อย่างน้อย 1 ไฟล์" });
        }
        const savedCertificates = [];
        for (const file of files) {
            const match = file.originalname.match(/^(\d+)/);
            if (!match)
                continue;
            const userCode = match[1];
            const certificateUrl = `/api-uploads/certificates/${eventId}/${file.originalname}`;
            const cert = await prisma_1.default.certificate.upsert({
                where: {
                    userCode_eventId: { userCode, eventId }
                },
                update: {
                    certificateUrl: certificateUrl,
                    uploadedAt: new Date(),
                },
                create: {
                    userCode: userCode,
                    eventId: eventId,
                    certificateUrl: certificateUrl,
                    uploadedAt: new Date(),
                },
            });
            savedCertificates.push(cert);
        }
        return res.status(200).json({
            message: "✅ อัปโหลด Certificate สำเร็จ",
            data: savedCertificates,
        });
    }
    catch (error) {
        console.error("❌ uploadCertificates error:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};
exports.uploadCertificates = uploadCertificates;
const downloadCertificate = async (req, res) => {
    try {
        const { userCode, eventId } = req.params;
        console.log("📥 Download request:", { eventId, userCode });
        if (!userCode || !eventId) {
            return res.status(400).json({ message: "กรุณาระบุ userCode และ eventId" });
        }
        const registration = await prisma_1.default.individualRegistration.findFirst({
            where: { userCode, eventId }
        });
        if (!registration)
            return res.status(404).json({ message: "❌ ไม่พบข้อมูลการลงทะเบียน" });
        if (registration.status !== client_1.IndividualStatus.completed) {
            return res.status(403).json({ message: "❌ Certificate ยังไม่พร้อมดาวน์โหลด" });
        }
        const cert = await prisma_1.default.certificate.findFirst({
            where: { userCode, eventId }
        });
        if (!cert)
            return res.status(404).json({ message: "❌ ไม่พบ Certificate" });
        const filePath = path_1.default.resolve(`.${cert.certificateUrl}`);
        if (!fs_1.default.existsSync(filePath)) {
            return res.status(404).json({ message: "❌ ไม่พบไฟล์ Certificate" });
        }
        return res.download(filePath, `${userCode}_Certificate.pdf`);
    }
    catch (error) {
        console.error("❌ downloadCertificate error:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};
exports.downloadCertificate = downloadCertificate;
const getCertificatesByEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        if (!eventId) {
            return res.status(400).json({ message: "กรุณาระบุ eventId" });
        }
        const certificates = await prisma_1.default.certificate.findMany({
            where: { eventId },
            orderBy: { uploadedAt: 'desc' }
        });
        return res.status(200).json({
            message: "✅ ดึงข้อมูล Certificate สำเร็จ",
            data: certificates,
        });
    }
    catch (error) {
        console.error("❌ getCertificatesByEvent error:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};
exports.getCertificatesByEvent = getCertificatesByEvent;
