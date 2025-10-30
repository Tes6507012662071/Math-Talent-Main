// backend/src/middleware/uploadCertificate.ts
import multer from "multer";
import path from "path";
import fs from "fs";

// 1. ❌ ลบ CERT_FOLDER ออก (เราจะใช้ Environment Variable แทน)
// const CERT_FOLDER = path.join(__dirname, "../../uploads/certificates");

// 2. ✅ กำหนด Base Path จาก Environment (Absolute Path ของ HostAtom)
const BASE_PATH = process.env.PUBLIC_ROOT_PATH as string;
// 3. ✅ กำหนด Folder หลักสำหรับ Certificate ในโครงสร้างที่ปลอดภัย
const CERT_BASE_FOLDER_NAME = 'api-uploads/certificates'; 

// 4. ไม่ต้องเช็ก fs.existsSync ที่นี่ เพราะเราจะสร้างโฟลเดอร์ใน destination แทน

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { eventId } = req.body;
    if (!eventId) return cb(new Error("Missing eventId"), "");

    // 5. ✅ สร้าง Absolute Path แบบเต็ม + Subfolder
    // ตัวอย่าง: /var/www/vhosts/.../httpdocs/api-uploads/certificates/68dcf4ba2babebcf131d0090
    const eventFolder = path.join(BASE_PATH, CERT_BASE_FOLDER_NAME, eventId);

    // 6. สร้าง Folder ถ้ายังไม่มี (จำเป็นต้องทำใน Destination เพราะ path เปลี่ยนตาม eventId)
    if (!fs.existsSync(eventFolder)) {
      fs.mkdirSync(eventFolder, { recursive: true });
      console.log(`📂 Created certificates subfolder: ${eventFolder}`);
    }

    // 7. ใช้ Absolute Path ที่ถูกต้อง
    cb(null, eventFolder);
  },
  filename: (req, file, cb) => {
    // ใช้ชื่อไฟล์เดิม (Logic เหมือนเดิม)
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