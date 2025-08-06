// Updated individual-registration router
import express from 'express';
import { registerIndividual, getMyRegistrations, uploadSlipToIndividualRegistration } from '../controllers/individualRegistration.controller';
import authMiddleware from '../middleware/authMiddleware';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/slips/' });

// Existing routes
router.post('/register', authMiddleware, registerIndividual);
router.get('/myevents', authMiddleware, getMyRegistrations);

// ✅ NEW: Upload slip directly to IndividualRegistration
router.post('/upload-slip/:id', authMiddleware, upload.single('slip'), uploadSlipToIndividualRegistration);

export default router;