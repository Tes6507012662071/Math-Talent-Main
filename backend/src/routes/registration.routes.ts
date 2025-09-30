// Updated individual-registration router
import express from 'express';
import { registerIndividual, getMyRegistrations, uploadSlipToIndividualRegistration } from '../controllers/individualRegistration.controller';
import {protect} from '../middleware/authMiddleware';
import multer from 'multer';
import { getApplicantsByEvent } from "../controllers/registration.controller";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/slips/' });

// Existing routes
router.post('/register', protect, registerIndividual);
router.get('/myevents', protect, getMyRegistrations);
router.get("/event/:eventId", getApplicantsByEvent);

// ✅ NEW: Upload slip directly to IndividualRegistration
router.post('/upload-slip/:id', protect, upload.single('slip'), uploadSlipToIndividualRegistration);

export default router;