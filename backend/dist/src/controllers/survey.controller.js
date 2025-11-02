"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSurveyByEvent = exports.upsertSurvey = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const client_1 = require("../generated/client");
const upsertSurvey = async (req, res) => {
    const { eventId } = req.params;
    const { title, questions, isActive } = req.body;
    try {
        if (!eventId) {
            return res.status(400).json({ message: 'ต้องระบุ Event ID ใน URL' });
        }
        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: 'ต้องมีอย่างน้อย 1 คำถาม' });
        }
        const mapQuestionsToPrismaData = (q) => ({
            question: q.question,
            type: q.type,
            options: q.options !== undefined && q.options !== null
                ? q.options
                : client_1.Prisma.JsonNull
        });
        const survey = await prisma_1.default.survey.upsert({
            where: { eventId: eventId },
            update: {
                title,
                isActive,
                questions: {
                    deleteMany: {},
                    createMany: {
                        data: questions.map(mapQuestionsToPrismaData)
                    }
                }
            },
            create: {
                eventId,
                title,
                isActive,
                questions: {
                    createMany: {
                        data: questions.map(mapQuestionsToPrismaData)
                    }
                }
            },
        });
        res.json({ success: true, survey });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return res.status(400).json({ message: 'เกิดข้อผิดพลาด: Survey นี้ถูกสร้างแล้ว' });
        }
        console.error("❌ upsertSurvey error:", error);
        res.status(500).json({ message: "ไม่สามารถบันทึกแบบสอบถามได้" });
    }
};
exports.upsertSurvey = upsertSurvey;
const getSurveyByEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const survey = await prisma_1.default.survey.findFirst({
            where: {
                eventId: eventId,
                isActive: true
            },
            include: {
                questions: true
            }
        });
        res.json(survey);
    }
    catch (error) {
        console.error("❌ getSurveyByEvent error:", error);
        res.status(500).json({ message: "โหลดแบบสอบถามไม่ได้" });
    }
};
exports.getSurveyByEvent = getSurveyByEvent;
