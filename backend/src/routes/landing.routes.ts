// backend/src/routes/landing.routes.ts
import { Router } from 'express';
import { getLandingContent, updateLandingContent } from '../controllers/landing.controller';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getLandingContent); // ✅ สำคัญมาก
router.put('/', protect, adminOnly, updateLandingContent);

export default router; // ✅ ต้องมี default export