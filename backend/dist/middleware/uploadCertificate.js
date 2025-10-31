"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadCertificate = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const BASE_PATH = process.env.PUBLIC_ROOT_PATH;
const CERT_BASE_FOLDER_NAME = 'api-uploads/certificates';
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const { eventId } = req.body;
        if (!eventId)
            return cb(new Error("Missing eventId"), "");
        const eventFolder = path_1.default.join(BASE_PATH, CERT_BASE_FOLDER_NAME, eventId);
        if (!fs_1.default.existsSync(eventFolder)) {
            fs_1.default.mkdirSync(eventFolder, { recursive: true });
            console.log(`📂 Created certificates subfolder: ${eventFolder}`);
        }
        cb(null, eventFolder);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
exports.uploadCertificate = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf")
            cb(null, true);
        else
            cb(new Error("❌ Only PDF files are allowed"));
    },
    limits: { fileSize: 50 * 1024 * 1024 },
});
