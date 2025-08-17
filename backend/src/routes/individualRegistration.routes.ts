import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import { registerIndividual, getMyRegistrations,getApplicantsByEvent, updateApplicantStatus, uploadSlipToIndividualRegistration } from "../controllers/individualRegistration.controller";
import IndividualRegistration from "../models/IndividualRegistration"; // ✅ Change this
import { uploadSlip } from "../middleware/uploadSlip"; // ✅ Change this

const router = express.Router();

router.post('/', authMiddleware, registerIndividual);
router.get("/myevents", authMiddleware, getMyRegistrations);
// ดึงรายชื่อผู้สมัครตาม event
router.get("/event/:eventId", getApplicantsByEvent);

// อัปเดตสถานะผู้สมัคร
router.patch("/:registrationId/status", updateApplicantStatus);
router.post("/upload-slip/:id", authMiddleware, uploadSlip.single("slip"), uploadSlipToIndividualRegistration);

export default router;