import { Router } from 'express';
import { 
  submitSurveyResponse, 
  checkSurveyResponse,
  getSurveyResponses 
} from '../controllers/surveyResponse.controller';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

router.post('/:eventId/submit', protect, submitSurveyResponse);
router.get('/:surveyId/check', protect, checkSurveyResponse);
router.get('/:surveyId/responses', protect, adminOnly, getSurveyResponses);

export default router;