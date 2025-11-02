"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const attendance_controller_1 = require("../controllers/attendance.controller");
const uploadExcel_1 = require("../middleware/uploadExcel");
const router = express_1.default.Router();
router.post("/upload", uploadExcel_1.uploadExcel.single("file"), attendance_controller_1.uploadAttendance);
exports.default = router;
