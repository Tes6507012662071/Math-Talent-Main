import express from "express";
import { uploadCertificates, downloadCertificate, getCertificatesByEvent } from "../controllers/certificate.controller";
import { uploadCertificate } from "../middleware/uploadCertificate";

const router = express.Router();

// ✅ Admin อัปโหลดใบประกาศหลายไฟล์
router.post("/upload", uploadCertificate.array("files", 20), uploadCertificates);

// ✅ User ดาวน์โหลดใบประกาศ
router.get("/download/:eventId/:userCode", downloadCertificate);

// ✅ ดึงรายชื่อ Certificate ตาม EventId
router.get("/event/:eventId", getCertificatesByEvent);

export default router;
