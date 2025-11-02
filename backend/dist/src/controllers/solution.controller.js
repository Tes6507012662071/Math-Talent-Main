"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSolutionById = exports.getAllSolutions = exports.uploadSolution = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const uploadSolution = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        const { eventId } = req.body;
        const solutionFilePath = `/api-uploads/solutions/${req.file.filename}`;
        const solution = await prisma_1.default.solution.create({
            data: {
                eventId: eventId,
                fileUrl: solutionFilePath,
            }
        });
        res.json({ success: true, solution });
    }
    catch (err) {
        console.error("❌ Upload Solution Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.uploadSolution = uploadSolution;
const getAllSolutions = async (req, res) => {
    try {
        const solutions = await prisma_1.default.solution.findMany({
            orderBy: { uploadedAt: 'desc' },
            include: {
                event: {
                    select: { nameEvent: true, dateAndTime: true }
                }
            }
        });
        res.json(solutions);
    }
    catch (err) {
        console.error("❌ Get Solutions Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAllSolutions = getAllSolutions;
const getSolutionById = async (req, res) => {
    try {
        const { id } = req.params;
        const solution = await prisma_1.default.solution.findUnique({
            where: { id },
            include: {
                event: { select: { nameEvent: true } }
            }
        });
        if (!solution) {
            return res.status(404).json({ message: "ไม่พบเฉลยนี้" });
        }
        res.json(solution);
    }
    catch (err) {
        console.error("❌ Get Solution Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getSolutionById = getSolutionById;
