import multer from "multer";
import path from "path";
import fs from "fs";

const BASE_PATH = process.env.PUBLIC_ROOT_PATH as string;
const CERT_BASE_FOLDER_NAME = 'api-uploads/certificates'; 

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { eventId } = req.body;
    if (!eventId) return cb(new Error("Missing eventId"), "");

    const eventFolder = path.join(BASE_PATH, CERT_BASE_FOLDER_NAME, eventId);

    if (!fs.existsSync(eventFolder)) {
      fs.mkdirSync(eventFolder, { recursive: true });
      console.log(`📂 Created certificates subfolder: ${eventFolder}`);
    }

    cb(null, eventFolder);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

export const uploadCertificate = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("❌ Only PDF files are allowed"));
  },
  limits: { fileSize: 50 * 1024 * 1024 }, 
});