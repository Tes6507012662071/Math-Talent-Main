import express from "express";
import { getAllRegistrations, verifySlip } from "../controllers/adminRegistration.controller";
import { protect, adminOnly } from "../middleware/authMiddleware";
import { updateLandingContent } from "../controllers/landing.controller";

const router = express.Router();

router.get("/registrations", protect, adminOnly, getAllRegistrations);
router.put("/registrations/:id/verify", protect, adminOnly, verifySlip);
router.put('/landing', protect, adminOnly, updateLandingContent);

export default router;
