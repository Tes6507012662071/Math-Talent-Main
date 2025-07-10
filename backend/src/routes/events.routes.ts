// backend/routes/events.routes.ts
import express from "express";
import { getAllEvents } from "../controllers/eventController";

const router = express.Router();

router.get("/", getAllEvents); // ✅ ตัวอย่าง endpoint: GET /api/events

export default router;
