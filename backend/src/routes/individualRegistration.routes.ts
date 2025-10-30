// backend/src/routes/individualRegistration.routes.ts (แก้ไขแล้ว)
import express from "express";
import { protect } from "../middleware/authMiddleware";
import { 
  registerIndividual, 
  getMyRegistrations, 
  getApplicantsByEvent, 
  updateApplicantStatus, 
  uploadSlipToIndividualRegistration 
} from "../controllers/individualRegistration.controller";

// 1. ❌ ลบ Mongoose Model ที่ไม่ได้ใช้ออก
// import IndividualRegistration from "../models/IndividualRegistration"; 

// 2. ✅ Import Middleware ให้ถูกต้อง (ตามชื่อไฟล์ `uploadSlip.ts` ที่เราแก้)
import { uploadSlip } from "../middleware/uploadSlip"; 

const router = express.Router();

// POST /api/individual-registration/
router.post('/', protect, registerIndividual);

// GET /api/individual-registration/my-registrations
// 3. ‼️ แก้ Path จาก "/myevents" เป็น "/my-registrations" ‼️
router.get("/my-registrations", protect, getMyRegistrations);

// GET /api/individual-registration/event/:eventId
router.get("/event/:eventId", getApplicantsByEvent);

// PATCH /api/individual-registration/:registrationId/status
router.patch("/:registrationId/status", updateApplicantStatus); // (Admin)

// PATCH /api/individual-registration/:id/slip
// 4. ‼️ แก้ Method เป็น PATCH และแก้ Path ‼️
router.patch(
  "/:id/slip", // 👈 (ตรงกับ /:id/slip)
  protect, 
  uploadSlip.single("slip"), // 👈 (Middleware ที่ถูกต้อง)
  uploadSlipToIndividualRegistration 
);

export default router;