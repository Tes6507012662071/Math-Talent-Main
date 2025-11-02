"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const export_controller_1 = require("../controllers/export.controller");
const router = express_1.default.Router();
router.get("/survey/:eventId", authMiddleware_1.protect, authMiddleware_1.adminOnly, export_controller_1.exportSurveyResponses);
router.get("/applicants/:eventId", authMiddleware_1.protect, authMiddleware_1.adminOnly, export_controller_1.exportApplicants);
exports.default = router;
