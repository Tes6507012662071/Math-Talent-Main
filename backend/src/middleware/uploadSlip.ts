import multer from "multer";
import path from "path";
import fs from "fs";

const uploadFolder = path.join(__dirname, "../../uploads/slips");
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    // ดึง extension จาก originalname หรือ fallback จาก mimetype
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
