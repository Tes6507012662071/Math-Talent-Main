// backend/src/routes/events.routes.ts
import express from "express";
import { getAllEvents, getEventById, createEvent, updateEvent } from "../controllers/event.controller";
import { protect, adminOnly } from "../middleware/authMiddleware";
import { uploadEventImage } from "../middleware/uploadEventImage";

const router = express.Router();

router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.post("/", protect, adminOnly, uploadEventImage.single('image'), createEvent);
router.patch("/:id", protect, adminOnly, uploadEventImage.single('image'), updateEvent); // ✅ เพิ่มบรรทัดนี้

export default router;