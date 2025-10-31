"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const individualRegistration_controller_1 = require("../controllers/individualRegistration.controller");
const uploadSlip_1 = require("../middleware/uploadSlip");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.protect, individualRegistration_controller_1.registerIndividual);
router.get("/my-registrations", authMiddleware_1.protect, individualRegistration_controller_1.getMyRegistrations);
router.get("/event/:eventId", individualRegistration_controller_1.getApplicantsByEvent);
router.patch("/:registrationId/status", individualRegistration_controller_1.updateApplicantStatus);
router.patch("/:id/slip", authMiddleware_1.protect, uploadSlip_1.uploadSlip.single("slip"), individualRegistration_controller_1.uploadSlipToIndividualRegistration);
exports.default = router;
