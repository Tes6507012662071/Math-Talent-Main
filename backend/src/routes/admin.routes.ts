import express from "express";
import { getAllRegistrations, verifySlip } from "../controllers/adminRegistration.controller";
import { verifyToken, isAdmin } from "../middleware/authAdmin";

const router = express.Router();

router.get("/registrations", verifyToken, isAdmin, getAllRegistrations);
router.put("/registrations/:id/verify", verifyToken, isAdmin, verifySlip);

export default router;
