import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import { registerIndividual } from "../controllers/individualRegistration.controller";

const router = express.Router();

router.post('/', authMiddleware, registerIndividual);

export default router;
