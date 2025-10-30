// backend/src/middleware/uploadEventImage.ts (ฉบับแก้ไข)
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 1. ‼️ ตรวจสอบ Path ทันที ‼️
const BASE_PATH = process.env.PUBLIC_ROOT_PATH;

if (!BASE_PATH) {
    throw new Error("❌ PUBLIC_ROOT_PATH is not defined. Check your .env file and dotenv setup.");
}

const UPLOAD_FOLDER_NAME = 'api-images/events'; 
const UPLOAD_FOLDER = path.join(BASE_PATH, ...UPLOAD_FOLDER_NAME.split('/')); // 👈 ตอนนี้ BASE_PATH เป็น String แน่นอน

// 2. ตรวจสอบและสร้าง Folder หลัก ถ้ายังไม่มี
if (!fs.existsSync(UPLOAD_FOLDER)) {
    fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 3. ใช้ Absolute Path ที่ถูกต้อง
    cb(null, UPLOAD_FOLDER);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('❌ Only image files are allowed!'), false);
  }
};

export const uploadEventImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});