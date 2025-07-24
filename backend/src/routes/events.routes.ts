// backend/routes/events.routes.ts
import express from "express";
import { getAllEvents, getEventById } from "../controllers/event.controller";

const router = express.Router();

router.get("/", getAllEvents);
router.get("/:id", getEventById); // ✅ ตัวอย่าง endpoint: GET /api/events

export default router;
