import multer from 'multer';
import path from 'path';
import fs from 'fs';

const BASE_PATH = process.env.PUBLIC_ROOT_PATH as string;
const UPLOAD_FOLDER_NAME = 'api-uploads/solutions'; 
const UPLOAD_FOLDER = path.join(BASE_PATH, ...UPLOAD_FOLDER_NAME.split('/'));

if (!BASE_PATH) {
    throw new Error("❌ PUBLIC_ROOT_PATH is not defined in .env");
}

if (!fs.existsSync(UPLOAD_FOLDER)) {
    fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_FOLDER); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `solution-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("❌ Only PDF files are allowed"), false);
  }
};

export const uploadSolutionFile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, 
});