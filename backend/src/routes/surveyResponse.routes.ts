// routes/surveyResponse.routes.ts
import { Router } from 'express';
import { 
  submitSurveyResponse, 
  checkSurveyResponse,
  getSurveyResponses 
} from '../controllers/surveyResponse.controller';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

// Submit survey response (protected)
router.post('/:eventId/submit', protect, submitSurveyResponse);

// Check if user submitted (protected)
router.get('/:surveyId/check', protect, checkSurveyResponse);

// Get all responses for survey (admin only)
router.get('/:surveyId/responses', protect, adminOnly, getSurveyResponses);

export default router;