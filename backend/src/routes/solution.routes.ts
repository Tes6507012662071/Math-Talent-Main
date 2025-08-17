// src/api/registration/routes/solution.routes.ts
import express from "express";
import multer from "multer";
import { uploadSolution, getSolutions } from "../controllers/solution.controller";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), uploadSolution);
router.get("/", getSolutions);

export default router;
