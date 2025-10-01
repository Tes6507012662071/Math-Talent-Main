import { Router } from 'express';
import { upsertSurvey, getSurveyByEvent } from '../controllers/survey.controller';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

// Admin เท่านั้น
router.post('/:eventId', protect, adminOnly, upsertSurvey);
// สาธารณะ (สำหรับผู้ใช้กรอก)
router.get('/:eventId', getSurveyByEvent);

export default router;