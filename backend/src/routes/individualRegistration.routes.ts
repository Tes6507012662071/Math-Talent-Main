import express from "express";
import { protect } from "../middleware/authMiddleware";
import { 
  registerIndividual, 
  getMyRegistrations, 
  getApplicantsByEvent, 
  updateApplicantStatus, 
  uploadSlipToIndividualRegistration 
} from "../controllers/individualRegistration.controller";
import { uploadSlip } from "../middleware/uploadSlip"; 

const router = express.Router();

router.post('/', protect, registerIndividual);
router.get("/my-registrations", protect, getMyRegistrations);
router.get("/event/:eventId", getApplicantsByEvent);
router.patch("/:registrationId/status", updateApplicantStatus); 
router.patch(
  "/:id/slip",
  protect, 
  uploadSlip.single("slip"),
  uploadSlipToIndividualRegistration 
);

export default router;