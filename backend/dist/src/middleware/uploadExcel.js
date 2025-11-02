"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadExcel = void 0;
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
exports.uploadExcel = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            file.mimetype === "application/vnd.ms-excel") {
            cb(null, true);
        }
        else {
            cb(new Error("กรุณาอัปโหลดไฟล์ Excel เท่านั้น (.xlsx, .xls)"));
        }
    },
});
