import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware";
import { 
    exportSurveyResponses, 
    exportApplicants 
} from "../controllers/export.controller";

const router = express.Router();

router.get(
    "/survey/:eventId",
    protect,
    adminOnly,
    exportSurveyResponses
);
router.get(
    "/applicants/:eventId",
    protect,
    adminOnly,
    exportApplicants
);

export default router;