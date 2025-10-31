"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSlip = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const BASE_PATH = process.env.PUBLIC_ROOT_PATH;
const UPLOAD_FOLDER_NAME = 'api-uploads/slips';
const UPLOAD_FOLDER = path_1.default.join(BASE_PATH, ...UPLOAD_FOLDER_NAME.split('/'));
if (!fs_1.default.existsSync(UPLOAD_FOLDER)) {
    fs_1.default.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_FOLDER);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        let ext = path_1.default.extname(file.originalname);
        if (!ext) {
            switch (file.mimetype) {
                case "image/jpeg":
                    ext = ".jpg";
                    break;
                case "image/png":
                    ext = ".png";
                    break;
                case "application/pdf":
                    ext = ".pdf";
                    break;
                default: ext = "";
            }
        }
        cb(null, uniqueSuffix + ext);
    },
});
exports.uploadSlip = (0, multer_1.default)({ storage });
