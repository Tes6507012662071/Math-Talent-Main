import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import { registerIndividual, getMyRegistrations } from "../controllers/individualRegistration.controller";
import IndividualRegistration from "../models/IndividualRegistration"; // ✅ Change this

const router = express.Router();

router.post('/', authMiddleware, registerIndividual);
router.get("/myevents", authMiddleware, getMyRegistrations);

export default router;