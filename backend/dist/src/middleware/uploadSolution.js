"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSolutionFile = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const BASE_PATH = process.env.PUBLIC_ROOT_PATH;
const UPLOAD_FOLDER_NAME = 'api-uploads/solutions';
const UPLOAD_FOLDER = path_1.default.join(BASE_PATH, ...UPLOAD_FOLDER_NAME.split('/'));
if (!BASE_PATH) {
    throw new Error("❌ PUBLIC_ROOT_PATH is not defined in .env");
}
if (!fs_1.default.existsSync(UPLOAD_FOLDER)) {
    fs_1.default.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_FOLDER);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `solution-${uniqueSuffix}${path_1.default.extname(file.originalname)}`);
    },
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    }
    else {
        cb(new Error("❌ Only PDF files are allowed"), false);
    }
};
exports.uploadSolutionFile = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 },
});
