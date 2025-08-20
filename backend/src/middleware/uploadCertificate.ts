import multer from "multer";
import path from "path";
import fs from "fs";

const CERT_FOLDER = path.join(__dirname, "../../uploads/certificates");

// ถ้าโฟลเดอร์หลักยังไม่มี ให้สร้าง
if (!fs.existsSync(CERT_FOLDER)) {
  fs.mkdirSync(CERT_FOLDER, { recursive: true });
  console.log("📂 Created certificates folder:", CERT_FOLDER);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { eventId } = req.body;
    if (!eventId) return cb(new Error("Missing eventId"), "");

    const eventFolder = path.join(CERT_FOLDER, eventId);
    if (!fs.existsSync(eventFolder)) fs.mkdirSync(eventFolder, { recursive: true });

    cb(null, eventFolder);
  },
  filename: (req, file, cb) => {
    // ใช้ชื่อไฟล์เดิม เช่น 250101001_Test.pdf
    cb(null, file.originalname);
  },
});

export const uploadCertificate = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("❌ Only PDF files are allowed"));
  },
  limits: { fileSize: 20 * 1024 * 1024 }, // จำกัด 20MB ต่อไฟล์
});
