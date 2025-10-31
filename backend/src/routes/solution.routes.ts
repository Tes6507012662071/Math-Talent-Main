import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware";
import { 
    uploadSolution, 
    getAllSolutions,
    getSolutionById 
} from "../controllers/solution.controller";
import { uploadSolutionFile } from "../middleware/uploadSolution";

const router = express.Router();

router.get("/", getAllSolutions); 
router.get("/:id", getSolutionById); 
router.post(
    "/upload",
    protect,
    adminOnly,
    uploadSolutionFile.single("file"), 
    uploadSolution
);

export default router;