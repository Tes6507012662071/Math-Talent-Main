import { Router } from 'express';
import { getLandingContent, updateLandingContent } from '../controllers/landing.controller';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getLandingContent);
router.put('/', protect, adminOnly, updateLandingContent);

export default router; 