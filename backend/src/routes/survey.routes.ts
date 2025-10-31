import { Router } from 'express';
import { upsertSurvey, getSurveyByEvent } from '../controllers/survey.controller';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

router.post('/:eventId', protect, adminOnly, upsertSurvey);
router.put('/:eventId', protect, adminOnly, upsertSurvey); 
router.get('/:eventId', getSurveyByEvent);

export default router;