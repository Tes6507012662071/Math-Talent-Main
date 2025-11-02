"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminRegistration_controller_1 = require("../controllers/adminRegistration.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const landing_controller_1 = require("../controllers/landing.controller");
const router = express_1.default.Router();
router.get("/registrations", authMiddleware_1.protect, authMiddleware_1.adminOnly, adminRegistration_controller_1.getAllRegistrations);
router.put("/registrations/:id/verify", authMiddleware_1.protect, authMiddleware_1.adminOnly, adminRegistration_controller_1.verifySlip);
router.put('/landing', authMiddleware_1.protect, authMiddleware_1.adminOnly, landing_controller_1.updateLandingContent);
exports.default = router;
