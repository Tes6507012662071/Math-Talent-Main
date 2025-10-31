"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const solution_controller_1 = require("../controllers/solution.controller");
const uploadSolution_1 = require("../middleware/uploadSolution");
const router = express_1.default.Router();
router.get("/", solution_controller_1.getAllSolutions);
router.get("/:id", solution_controller_1.getSolutionById);
router.post("/upload", authMiddleware_1.protect, authMiddleware_1.adminOnly, uploadSolution_1.uploadSolutionFile.single("file"), solution_controller_1.uploadSolution);
exports.default = router;
