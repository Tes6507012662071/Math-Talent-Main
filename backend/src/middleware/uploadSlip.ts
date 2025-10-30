// backend/src/middleware/uploadSlip.ts
import multer from "multer";
import path from "path";
import fs from "fs";

// 1. ✅ กำหนด Base Path และ Folder ปลายทาง (Absolute Path ของ HostAtom)
const BASE_PATH = process.env.PUBLIC_ROOT_PATH as string;
const UPLOAD_FOLDER_NAME = 'api-uploads/slips'; 
const UPLOAD_FOLDER = path.join(BASE_PATH, ...UPLOAD_FOLDER_NAME.split('/')); // 👈 Path ที่ถูกต้องบน Server

// 2. ✅ ตรวจสอบและสร้าง Folder ถ้ายังไม่มี (ใช้ Path เต็ม)
if (!fs.existsSync(UPLOAD_FOLDER)) {
    fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 3. ✅ ใช้ Absolute Path ที่ถูกต้องบน Server
    cb(null, UPLOAD_FOLDER);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    // ดึง extension จาก originalname หรือ fallback จาก mimetype (Logic เหมือนเดิม)
    let ext = path.extname(file.originalname);
    if (!ext) {
      switch (file.mimetype) {
        case "image/jpeg": ext = ".jpg"; break;
        case "image/png": ext = ".png"; break;
        case "application/pdf": ext = ".pdf"; break;
        default: ext = "";
      }
    }

    cb(null, uniqueSuffix + ext);
  },
});

export const uploadSlip = multer({ storage });