"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadEventImage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const BASE_PATH = process.env.PUBLIC_ROOT_PATH;
if (!BASE_PATH) {
    throw new Error("❌ PUBLIC_ROOT_PATH is not defined. Check your .env file and dotenv setup.");
}
const UPLOAD_FOLDER_NAME = 'api-images/events';
const UPLOAD_FOLDER = path_1.default.join(BASE_PATH, ...UPLOAD_FOLDER_NAME.split('/'));
if (!fs_1.default.existsSync(UPLOAD_FOLDER)) {
    fs_1.default.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_FOLDER);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'event-' + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('❌ Only image files are allowed!'), false);
    }
};
exports.uploadEventImage = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});
