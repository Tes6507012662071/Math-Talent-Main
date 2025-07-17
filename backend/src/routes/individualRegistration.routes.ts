import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import { registerIndividual } from "../controllers/individualRegistration.controller";

const router = express.Router();

router.post('/individual-registration', authMiddleware, registerIndividual);

export default router;
