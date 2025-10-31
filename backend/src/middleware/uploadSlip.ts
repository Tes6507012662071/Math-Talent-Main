import multer from "multer";
import path from "path";
import fs from "fs";

const BASE_PATH = process.env.PUBLIC_ROOT_PATH as string;
const UPLOAD_FOLDER_NAME = 'api-uploads/slips'; 
const UPLOAD_FOLDER = path.join(BASE_PATH, ...UPLOAD_FOLDER_NAME.split('/')); 

if (!fs.existsSync(UPLOAD_FOLDER)) {
    fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_FOLDER);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

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