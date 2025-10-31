"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const certificate_controller_1 = require("../controllers/certificate.controller");
const uploadCertificate_1 = require("../middleware/uploadCertificate");
const router = express_1.default.Router();
router.post("/upload", authMiddleware_1.protect, authMiddleware_1.adminOnly, uploadCertificate_1.uploadCertificate.array("files", 100), certificate_controller_1.uploadCertificates);
router.get("/download/:eventId/:userCode", authMiddleware_1.protect, certificate_controller_1.downloadCertificate);
router.get("/event/:eventId", authMiddleware_1.protect, authMiddleware_1.adminOnly, certificate_controller_1.getCertificatesByEvent);
exports.default = router;
